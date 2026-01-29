import os, json, uuid, hashlib
from datetime import datetime, timezone
import boto3

s3 = boto3.client("s3")
ddb = boto3.resource("dynamodb")

def utc_now_iso():
    return datetime.now(timezone.utc).isoformat()

def resp(code, body):
    return {
        "statusCode": code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": os.environ.get("CORS_ALLOW_ORIGIN", "*"),
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        },
        "body": json.dumps(body),
    }

class AuthError(Exception):
    def __init__(self, status_code: int, message: str, details: dict | None = None):
        super().__init__(message)
        self.status_code = status_code
        self.message = message
        self.details = details or {}

def _get_claims(event):
    rc = event.get("requestContext", {}) or {}
    authz = rc.get("authorizer", {}) or {}
    jwt_block = authz.get("jwt", {}) or {}
    claims = jwt_block.get("claims")
    if claims:
        return claims
    if "claims" in authz and authz.get("claims"):
        return authz.get("claims")
    return None

def _normalize_groups(groups_val):
    if groups_val is None:
        return []
    if isinstance(groups_val, list):
        return [str(g).strip() for g in groups_val if str(g).strip()]
    if isinstance(groups_val, str):
        s = groups_val.strip()
        if not s:
            return []
        if s.startswith("[") and s.endswith("]"):
            try:
                arr = json.loads(s)
                if isinstance(arr, list):
                    return [str(g).strip() for g in arr if str(g).strip()]
            except Exception:
                inner = s[1:-1].strip()
                if not inner:
                    return []
                if "," in inner:
                    return [p.strip().strip('"').strip("'") for p in inner.split(",") if p.strip()]
                return [p.strip().strip('"').strip("'") for p in inner.split() if p.strip()]
        if "," in s:
            return [p.strip() for p in s.split(",") if p.strip()]
        return [s]
    return [str(groups_val).strip()]

def _normalize_amr(amr_val):
    if amr_val is None:
        return []
    if isinstance(amr_val, list):
        return [str(a).strip() for a in amr_val if str(a).strip()]
    if isinstance(amr_val, str):
        s = amr_val.strip()
        if not s:
            return []
        if s.startswith("[") and s.endswith("]"):
            try:
                arr = json.loads(s)
                if isinstance(arr, list):
                    return [str(a).strip() for a in arr if str(a).strip()]
            except Exception:
                inner = s[1:-1].strip()
                if not inner:
                    return []
                if "," in inner:
                    return [p.strip() for p in inner.split(",") if p.strip()]
                return [p.strip() for p in inner.split() if p.strip()]
        if "," in s:
            return [p.strip() for p in s.split(",") if p.strip()]
        return [p.strip() for p in s.split(" ") if p.strip()]
    return [str(amr_val).strip()]

def _looks_like_email(x: str | None) -> bool:
    if not x:
        return False
    s = str(x)
    return ("@" in s) and ("." in s.split("@")[-1])

def _require_authz(event):
    claims = _get_claims(event)
    if not claims:
        raise AuthError(401, "Unauthorized (no JWT claims found)")

    actor_sub = claims.get("sub")
    raw_email = claims.get("email") or claims.get("cognito:email")
    actor_email = raw_email if raw_email else None

    actor_username = (
        claims.get("cognito:username")
        or claims.get("username")
        or actor_email
        or actor_sub
    )
    if not actor_email and _looks_like_email(actor_username):
        actor_email = actor_username

    actor = {
        "sub": actor_sub,
        "email": actor_email,
        "username": actor_username,
        "groups": _normalize_groups(claims.get("cognito:groups")),
        "amr": _normalize_amr(claims.get("amr")),
        "auth_time": claims.get("auth_time"),
    }
    return actor

def _require_group(actor, group_name):
    groups = actor.get("groups", []) or []
    if group_name.lower() not in [g.lower() for g in groups]:
        raise AuthError(403, f"Forbidden: requires group '{group_name}'", details={"groups_seen": groups})

def sha256_stream(bucket, key):
    h = hashlib.sha256()
    obj = s3.get_object(Bucket=bucket, Key=key)
    version_id = obj.get("VersionId")
    body = obj["Body"]
    for chunk in iter(lambda: body.read(1024 * 1024), b""):
        h.update(chunk)
    return h.hexdigest(), version_id

def handler(event, context):
    method = event.get("requestContext", {}).get("http", {}).get("method")
    if method == "OPTIONS":
        return resp(200, {"ok": True})
    if method != "POST":
        return resp(405, {"error": "Method not allowed"})

    try:
        actor = _require_authz(event)
        _require_group(actor, "Submitter")
    except AuthError as e:
        body = {"error": e.message, "details": e.details} if e.details else {"error": e.message}
        return resp(e.status_code, body)

    table = ddb.Table(os.environ["DDB_TABLE"])
    bucket = os.environ["DOCS_BUCKET"]
    env_name = os.environ.get("ENV_NAME", "dev")

    try:
        body = json.loads(event.get("body") or "{}")
    except json.JSONDecodeError:
        return resp(400, {"error": "Invalid JSON body"})

    document_id = body.get("documentId")
    title = (body.get("title") or "").strip()
    description = (body.get("description") or "").strip()
    comment = (body.get("comment") or "").strip()

    if not document_id:
        return resp(400, {"error": "documentId is required"})
    if not title:
        return resp(400, {"error": "title is required"})

    pk = f"DOC#{document_id}"
    meta = table.get_item(Key={"pk": pk, "sk": "METADATA"}).get("Item")
    if not meta:
        return resp(404, {"error": "Document not found"})
    if meta.get("status") != "DRAFT":
        return resp(409, {"error": f"Must be DRAFT to submit. Current: {meta.get('status')}"})

    # owner enforcement
    enforce_owner = os.environ.get("ENFORCE_SUBMIT_OWNER", "true").lower() == "true"
    owner_user_id = meta.get("ownerUserId")
    actor_sub = actor.get("sub")
    if enforce_owner and owner_user_id and owner_user_id != "anonymous" and actor_sub and owner_user_id != actor_sub:
        return resp(403, {"error": "Only the document owner can submit this document"})

    key = meta.get("s3Key")
    if not key:
        return resp(500, {"error": "Document metadata missing s3Key"})

    try:
        sha, ver = sha256_stream(bucket, key)
    except Exception as e:
        return resp(500, {"error": f"Failed to read S3 object: {str(e)}"})

    now = utc_now_iso()
    actor_user_id = actor.get("sub") or "unknown"
    actor_username = actor.get("username") or actor_user_id
    actor_email = actor.get("email")

    # Backfill owner fields if older draft
    backfill_owner = (meta.get("ownerUserId") in (None, "", "anonymous"))
    owner_update_expr = ""
    expr_vals = {
        ":t": title,
        ":d": description,
        ":s": "SUBMITTED",
        ":u": now,
        ":sa": now,
        ":h": sha,
        ":v": ver if ver else "null",
        ":gpk": "STATUS#SUBMITTED",
        ":gsk": now,
        ":sb": actor_username,
        ":sbs": actor_user_id,
        ":se": actor_email,
    }
    if backfill_owner:
        owner_update_expr = ", ownerUserId=:ouid, ownerUsername=:oun, ownerEmail=:oem"
        expr_vals[":ouid"] = actor_user_id
        expr_vals[":oun"] = actor_username
        expr_vals[":oem"] = actor_email

    table.update_item(
        Key={"pk": pk, "sk": "METADATA"},
        UpdateExpression=(
            "SET #t=:t, #d=:d, #s=:s, updatedAt=:u, submittedAt=:sa, "
            "sha256=:h, s3VersionId=:v, gsi1pk=:gpk, gsi1sk=:gsk, "
            "submittedBy=:sb, submittedBySub=:sbs, submittedByEmail=:se"
            + owner_update_expr
        ),
        ExpressionAttributeNames={"#t": "title", "#d": "description", "#s": "status"},
        ExpressionAttributeValues=expr_vals,
    )

    audit_id = str(uuid.uuid4())
    table.put_item(Item={
        "pk": pk,
        "sk": f"AUDIT#{now}#{audit_id}",
        "eventId": audit_id,
        "eventType": "DOC_SUBMITTED",
        "timestampUtc": now,
        "actorUserId": actor_user_id,
        "actorUsername": actor_username,
        "actorEmail": actor_email,
        "actorGroups": actor.get("groups", []),
        "actorAuthTime": actor.get("auth_time"),
        "actorAmr": actor.get("amr", []),
        "details": {
            "title": title,
            "env": env_name,
            "comment": comment,
            "apiRequestId": event.get("requestContext", {}).get("requestId"),
            "routeKey": event.get("routeKey"),
        },
        "integrity": {"s3Bucket": bucket, "s3Key": key, "s3VersionId": ver, "sha256": sha},
    })

    sig_id = str(uuid.uuid4())
    table.put_item(Item={
        "pk": pk,
        "sk": f"ESIG#{now}#{sig_id}",
        "signatureId": sig_id,
        "timestampUtc": now,
        "signerUserId": actor_user_id,
        "signerUsername": actor_username,
        "signerEmail": actor_email,
        "signerGroups": actor.get("groups", []),
        "signerAuthTime": actor.get("auth_time"),
        "signerAmr": actor.get("amr", []),
        "signerRole": "UPLOADER",
        "signatureMeaning": "SUBMIT",
        "documentId": document_id,
        "s3Bucket": bucket,
        "s3Key": key,
        "s3VersionId": ver,
        "sha256": sha,
        "attestationText": "I attest this submission is accurate and complete.",
        "comment": comment,
    })

    return resp(200, {"documentId": document_id, "status": "SUBMITTED", "sha256": sha, "s3VersionId": ver})
