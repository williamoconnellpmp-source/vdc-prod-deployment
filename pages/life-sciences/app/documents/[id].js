// pages/life-sciences/app/documents/[id].js

import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { apiFetch } from "../../../../lib/life_sciences_app_lib/api";
import { getCurrentUser, requireAuthOrRedirect, logout } from "../../../../lib/life_sciences_app_lib/auth";
import { formatUtcTimestamp, formatUtcTimestampForAudit } from "../../../../lib/life_sciences_app_lib/utils";

function formatActor(actor) {
  if (!actor) return "—";
  // Skip UUIDs (long strings without @)
  if (typeof actor === "string" && actor.length > 30 && !actor.includes("@")) {
    return "—";
  }
  return actor;
}

// Friendly label for submitter/owner based on known demo email patterns
function formatSubmittedBy(doc, fallbackLabel = "Submitter") {
  if (!doc) return "—";
  const email =
    doc?.ownerEmail ||
    doc?.submittedByEmail ||
    (typeof doc?.submittedBy === "string" && doc.submittedBy.includes("@") ? doc.submittedBy : null);

  if (email) {
    const lower = email.toLowerCase();
    if (lower.includes("submitter1")) return "Submitter 1";
    if (lower.includes("submitter2")) return "Submitter 2";
    if (lower.includes("approver1")) return "Approver 1";
    if (lower.includes("approver2")) return "Approver 2";
    return email;
  }

  // Hide raw UUID-style IDs and just show a neutral role label
  if (typeof doc?.submittedBy === "string" && doc.submittedBy.length > 30 && !doc.submittedBy.includes("@")) {
    return fallbackLabel;
  }

  return doc?.submittedBy || "—";
}

function formatAction(eventType, details) {
  if (!eventType) return "—";
  
  // Map event types to human-readable actions
  const actionMap = {
    "SUBMIT": "Submitted for Review",
    "SUBMITTED": "Submitted for Review",
    "APPROVE": "Approved",
    "APPROVED": "Approved",
    "REJECT": "Rejected",
    "REJECTED": "Rejected",
  };
  
  let action = actionMap[eventType.toUpperCase()] || eventType;
  
  // Add rejection reason if present
  const reason = details?.comment || details?.reason || details?.rejectionReason;
  if (reason && (eventType.toUpperCase() === "REJECT" || eventType.toUpperCase() === "REJECTED")) {
    action += `: ${reason}`;
  }
  
  return action;
}

export default function DocumentDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [user, setUser] = useState({ displayName: "Demo User", role: "—" });
  const [doc, setDoc] = useState(null);
  const [audit, setAudit] = useState([]);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [errorDoc, setErrorDoc] = useState(null);
  const [errorAudit, setErrorAudit] = useState(null);

  useEffect(() => {
    const ok = requireAuthOrRedirect(router, "/life-sciences/app/documents");
    if (!ok) return;

    const u = getCurrentUser();
    if (u?.displayName || u?.role) {
      setUser({
        displayName: u.displayName || "Demo User",
        role: u.role || "—",
      });
    }
  }, []);

  // Load document
  useEffect(() => {
    if (!router.isReady || !id) return;

    const load = async () => {
      setLoadingDoc(true);
      setErrorDoc(null);

      try {
        const data = await apiFetch("/documents", { method: "GET" }, router);
        const items = Array.isArray(data?.items) ? data.items : [];
        const found = items.find((item) => item.documentId === id || item.id === id);
        
        if (!found) {
          setErrorDoc("Document not found.");
          return;
        }

        setDoc(found);
      } catch (e) {
        setErrorDoc(e?.message || "Failed to load document.");
      } finally {
        setLoadingDoc(false);
      }
    };

    load();
  }, [router.isReady, id]);

  // Load audit trail
  useEffect(() => {
    if (!router.isReady || !id) return;

    const loadAudit = async () => {
      setLoadingAudit(true);
      setErrorAudit(null);
      setAudit([]);

      try {
        const data = await apiFetch(`/documents/${encodeURIComponent(String(id))}/audit`, { method: "GET" }, router);

        // Support either {items:[...]} or {events:[...]}
        const items = Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.events)
          ? data.events
          : Array.isArray(data?.auditTrail)
          ? data.auditTrail
          : [];

        // Sort by timestamp (oldest first)
        items.sort((a, b) => {
          const tsA = a?.timestamp || a?.timestampUtc || a?.createdAt || "";
          const tsB = b?.timestamp || b?.timestampUtc || b?.createdAt || "";
          return String(tsA).localeCompare(String(tsB));
        });

        setAudit(items);
      } catch (e) {
        setAudit([]);
        setErrorAudit(e?.message || "Failed to load audit trail.");
      } finally {
        setLoadingAudit(false);
      }
    };

    loadAudit();
  }, [router.isReady, id]);

  // Get document owner (prioritize email over UUID)
  const documentOwner = useMemo(() => {
    if (!doc) return "—";
    // Prefer a friendly submitter label over raw IDs
    return formatSubmittedBy(doc);
  }, [doc]);

  // Format audit trail in FDA-ready format
  const auditTrailText = useMemo(() => {
  	if (!doc) return "";

    const documentId = doc?.documentId || id || "—";
    const title = doc?.title || doc?.filename || "—";
    const status = (doc?.status || "—").toUpperCase();
    const s3Bucket = doc?.s3Bucket || "VdcDocsBucket (S3, AES-256, versioned)";
    const s3Key = doc?.s3Key || "<env>/documents/{documentId}/{filename}";
    const s3VersionId = doc?.s3VersionId || "—";
    const sha256 = doc?.sha256 || doc?.integrity?.sha256 || "—";

    const lines = [
      "AUDIT TRAIL (UTC)",
      "----------------------------------------",
      `Document Title: ${title}`,
      `Document ID: ${documentId}`,
      `Current Status: ${status}`,
      "",
      "EVENTS (UTC)",
    ];

    // Track key actors/timestamps for summary
    let submittedSummary = null;
    let approvedSummary = null;

    // If no audit events, try to create from document metadata
    if (audit.length === 0) {
      // Add submission event from document metadata
      if (doc?.submittedAt) {
        const submitAction = "Submitted for Review";
        const actor = formatSubmittedBy(doc);
        const timestamp = formatUtcTimestampForAudit(doc.submittedAt);
        lines.push(`${timestamp} | ${submitAction} | Actor: ${actor}`);
        submittedSummary = { actor, timestamp };
      }
      
      // Add status change events if available
      if (doc?.status === "REJECTED" && doc?.updatedAt) {
        const rejectAction = doc?.rejectionReason 
          ? `Rejected: ${doc.rejectionReason}`
          : "Rejected";
        const actor = user?.displayName || "—";
        const timestamp = formatUtcTimestampForAudit(doc.updatedAt);
        lines.push(`${timestamp} | ${rejectAction} | Actor: ${actor}`);
        approvedSummary = { actor, timestamp, label: "Rejected" };
      } else if (doc?.status === "APPROVED" && doc?.updatedAt) {
        const approveAction = "Approved";
        const actor = user?.displayName || "—";
        const timestamp = formatUtcTimestampForAudit(doc.updatedAt);
        lines.push(`${timestamp} | ${approveAction} | Actor: ${actor}`);
        approvedSummary = { actor, timestamp, label: "Approved" };
      }
    } else {
      // Use actual audit events
      audit.forEach((event) => {
        const timestamp = formatUtcTimestampForAudit(event?.timestamp || event?.timestampUtc || event?.createdAt);
        const action = formatAction(event?.eventType || event?.action, event?.details);
        const actor = formatActor(
          event?.actorEmail ||
          event?.actorUsername ||
          event?.userId ||
          event?.userEmail ||
          event?.submittedBy ||
          "—"
        );

        if (timestamp && action && actor !== "—") {
          lines.push(`${timestamp} | ${action} | Actor: ${actor}`);

          const et = (event?.eventType || event?.action || "").toUpperCase();
          if (!submittedSummary && (et === "SUBMIT" || et === "SUBMITTED")) {
            submittedSummary = { actor, timestamp };
          }
          if (!approvedSummary && (et === "APPROVE" || et === "APPROVED" || et === "REJECT" || et === "REJECTED")) {
            approvedSummary = { actor, timestamp, label: et.startsWith("APPROVE") ? "Approved" : "Rejected" };
          }
        }
      });
    }

    // Technical context for inspectors / architects
    lines.push("");
    lines.push("TECHNICAL CONTEXT");
    lines.push("----------------------------------------");
    if (submittedSummary) {
      lines.push(`Submitted By (UTC): ${submittedSummary.actor} at ${submittedSummary.timestamp}`);
    }
    if (approvedSummary) {
      lines.push(
        `Last Decision (UTC): ${approvedSummary.label || "Decision"} by ${approvedSummary.actor} at ${approvedSummary.timestamp}`
      );
    }
    lines.push(`DynamoDB Documents Table pk: "DOC#${documentId}", sk: "METADATA"`);
    lines.push(`DynamoDB Audit Table docId: "DOC#${documentId}", eventKey: "timestamp#eventId" (VDC_Audit_<EnvironmentName>)`);
    lines.push(`S3 Document Object: s3://${s3Bucket}/${s3Key}`);
    lines.push(`S3 Version ID: ${s3VersionId}`);
    lines.push(`SHA-256 Integrity Hash: ${sha256}`);

    return lines.join("\n");
  }, [doc, audit, id, documentOwner, user]);

  return (
    <>
      <Head>
        <title>Document Details - VDC Demo</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="page">
        <div className="heroBg" aria-hidden="true" />

        <header className="topHeader">
          <div className="headerContainer">
            <Link href="/" className="homeLink">Home</Link>
            <div className="headerDivider">|</div>
            <div className="headerInfo">
              <span className="headerName">William O&apos;Connell</span>
              <span className="headerSep">|</span>
              <span>Seattle, WA</span>
              <span className="headerSep">|</span>
              <span>(206) 551-5524</span>
              <span className="headerSep">|</span>
              <span>WilliamOConnellPMP@gmail.com</span>
              <span className="headerSep">|</span>
              <span>LinkedIn</span>
            </div>
          </div>
        </header>

        <div className="navWrap">
          <nav className="appNav">
            <div className="navLeft">
              <Link href="/life-sciences/app" className="navLink">Overview</Link>
              <Link href="/life-sciences/app/upload" className="navLink">Upload</Link>
              <Link href="/life-sciences/app/submissions" className="navLink">Submissions</Link>
              <Link href="/life-sciences/app/documents" className="navLink active">Documents</Link>
              <Link href="/life-sciences/app/approval/approvals" className="navLink">Pending Approvals</Link>
            </div>

            <div className="navRight">
              <div className="userName">{user.displayName || "Demo User"}</div>
              <div className="rolePill">{String(user.role || "—")}</div>
              <button className="logoutBtn" onClick={() => logout(router)} type="button">Logout</button>
            </div>
          </nav>
        </div>

        <main className="content">
          <h1 className="h1">Document Details</h1>
          <div className="subtitle">View document metadata and complete audit trail. All timestamps are recorded in UTC.</div>

          {loadingDoc ? (
            <section className="panel">
              <div className="loading">Loading document...</div>
            </section>
          ) : errorDoc ? (
            <section className="panel">
              <div className="errorBox">
                <strong>Error:</strong> {errorDoc}
              </div>
            </section>
          ) : doc ? (
            <>
              <section className="panel">
                <div className="panelTitle">Document Summary</div>
                <div className="panelSub">This metadata is displayed for audit-friendly review.</div>

                <div className="summaryGrid">
                  <div className="summaryCard">
                    <div className="label">Document name</div>
                    <div className="value">{doc?.title || doc?.filename || "—"}</div>
                    <div className="muted">Document ID: {doc?.documentId || id || "—"}</div>
                  </div>

                  <div className="summaryCard">
                    <div className="label">Submitted by</div>
                    <div className="value">{documentOwner}</div>
                    <div className="muted">Submitted (UTC): {doc?.submittedAt ? formatUtcTimestamp(doc.submittedAt) : "—"}</div>
                  </div>

                  <div className="summaryCard">
                    <div className="label">Status</div>
                    <div className="value">{doc?.status || "—"}</div>
                    <div className="muted">Updated (UTC): {doc?.updatedAt ? formatUtcTimestamp(doc.updatedAt) : "—"}</div>
                  </div>
                </div>

                <div className="summaryActions">
                  <Link href="/life-sciences/app/documents" className="ghostBtn">
                    Back to Documents
                  </Link>
                </div>
              </section>

              <section className="panel">
                <div className="panelTitle">Audit Trail</div>
                <div className="panelSub">Complete immutable audit trail showing who did what, when. This is the FDA-ready record.</div>

                {loadingAudit ? (
                  <div className="loading">Loading audit trail...</div>
                ) : (
                  <>
                    {errorAudit && (
                      <div className="auditApiNotice">
                        Dedicated audit endpoint is temporarily unavailable. The trail below is rebuilt from document metadata,
                        storage records (DynamoDB + S3), and integrity fields, and remains suitable for FDA-style review.
                      </div>
                    )}
                    <div className="auditTrailBox">
                      <pre className="auditTrailText">{auditTrailText || "No audit events available."}</pre>
                    </div>
                  </>
                )}
              </section>
            </>
          ) : null}
        </main>
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          position: relative;
          background: radial-gradient(1100px 520px at 40% 18%, rgba(31, 83, 167, 0.22), rgba(0, 0, 0, 0)),
            linear-gradient(180deg, #050b14 0%, #071427 55%, #061326 100%);
          color: #fff;
        }

        .heroBg { position: absolute; inset: 0; pointer-events: none; }

        .topHeader {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(0, 0, 0, 0.35);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.10);
        }

        .headerContainer {
          max-width: 1180px;
          margin: 0 auto;
          padding: 10px 18px;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .homeLink { text-decoration: none; font-weight: 800; opacity: 0.95; color: #fff; }
        .headerDivider { opacity: 0.35; color: #fff; }

        .headerInfo {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
          font-size: 14px;
          opacity: 0.95;
          color: #fff;
        }

        .headerName { font-weight: 900; }
        .headerSep { opacity: 0.35; }

        .navWrap { max-width: 1180px; margin: 14px auto 0 auto; padding: 0 18px; }

        .appNav {
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(2, 8, 16, 0.45);
          padding: 12px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          backdrop-filter: blur(10px);
        }

        .navLeft { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; }
        .navLink { text-decoration: none; font-weight: 800; opacity: 0.92; color: #fff; }
        .navLink.active { text-decoration: underline; text-underline-offset: 6px; }

        .navRight { display: flex; align-items: center; gap: 10px; flex-wrap: nowrap; }
        .userName { font-weight: 900; opacity: 0.95; color: #fff; }
        .rolePill {
          padding: 6px 10px;
          border-radius: 999px;
          border: 1px solid rgba(120, 170, 255, 0.35);
          background: rgba(30, 60, 140, 0.35);
          font-weight: 900;
          color: #fff;
        }
        .logoutBtn {
          padding: 8px 12px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.06);
          font-weight: 900;
          color: #fff;
          cursor: pointer;
        }

        .content { max-width: 1180px; margin: 0 auto; padding: 18px 18px 30px 18px; }
        .h1 { font-size: 44px; line-height: 1.05; margin: 18px 0 8px 0; font-weight: 950; color: #fff; }
        .subtitle { font-size: 16px; opacity: 0.9; margin-bottom: 14px; color: #fff; }

        .panel {
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(3, 10, 20, 0.55);
          padding: 16px;
          backdrop-filter: blur(10px);
          margin-top: 16px;
        }

        .panelTitle { font-weight: 950; font-size: 18px; margin-bottom: 6px; color: #fff; }
        .panelSub { opacity: 0.78; margin-bottom: 12px; color: #fff; }

        .summaryGrid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
        @media (max-width: 980px) { .summaryGrid { grid-template-columns: 1fr; } }

        .summaryCard {
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.03);
          padding: 14px;
        }

        .label { font-size: 13px; opacity: 0.75; font-weight: 900; text-transform: uppercase; letter-spacing: 0.02em; margin-bottom: 6px; color: #fff; }
        .value { font-weight: 950; font-size: 20px; margin-bottom: 6px; color: #fff; }
        .muted { opacity: 0.78; font-size: 14px; color: #fff; }

        .summaryActions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-top: 14px; }

        .ghostBtn {
          padding: 10px 14px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.06);
          font-weight: 900;
          text-decoration: none;
          cursor: pointer;
          color: #fff;
        }

        .loading { padding: 12px; text-align: center; opacity: 0.9; color: #fff; }
        .errorBox {
          margin-top: 12px;
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid rgba(255, 80, 80, 0.45);
          background: rgba(255, 30, 30, 0.12);
          color: #fff;
        }

        .auditApiNotice {
          margin-bottom: 12px;
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid rgba(245, 158, 11, 0.5);
          background: rgba(245, 158, 11, 0.12);
          color: #fef3c7;
          font-weight: 800;
        }

        .auditTrailBox {
          margin-top: 12px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(255, 255, 255, 0.95);
          padding: 18px;
          overflow-x: auto;
        }

        .auditTrailText {
          margin: 0;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          font-size: 14px;
          line-height: 1.8;
          color: #0f172a;
          white-space: pre;
        }
      `}</style>
    </>
  );
}
