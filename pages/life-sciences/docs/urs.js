import Head from "next/head";
import Link from "next/link";

export default function URSPage() {
  return (
    <>
      <Head>
        <title>URS - User Requirements Specification | VDC System</title>
        <meta name="description" content="User Requirements Specification for Validated Document Control system"/>
      </Head>

      <div className="page">
        <header className="topHeader">
          <div className="headerContainer">
            <Link href="/" className="homeLink">Home</Link>
            <span className="sep">|</span>
            <Link href="/life-sciences/evidence" className="backLink">← Back to Evidence</Link>
          </div>
        </header>

        <main className="mainContent">
          <div className="container">
            <div className="docHeader">
              <h1 className="h1">User Requirements Specification</h1>
              <div className="docMeta">
                <span className="metaItem"><strong>Document ID:</strong> VDC-URS-001</span>
                <span className="metaItem"><strong>Version:</strong> 2.0</span>
                <span className="metaItem"><strong>Date:</strong> January 2026</span>
                <span className="metaItem"><strong>Status:</strong> Approved</span>
              </div>
            </div>

            <section className="section">
              <h2 className="h2">1. Introduction</h2>
              
              <h3 className="h3">1.1 Purpose</h3>
              <p>This User Requirements Specification (URS) defines the functional and non-functional requirements for a Validated Document Control (VDC) system designed to manage controlled documents in a regulated Life Sciences environment with full compliance to GxP, 21 CFR Part 11, and CSV requirements. This document is reverse-engineered from the implemented codebase to ensure accuracy and traceability.</p>

              <h3 className="h3">1.2 Scope</h3>
              <p>This VDC system provides:</p>
              <ul>
                <li>Secure document submission and storage with version control</li>
                <li>Role-based access control (Submitter and Approver roles ONLY - no Admin role)</li>
                <li>Multi-Factor Authentication (MFA) via TOTP for ALL users</li>
                <li>Electronic approval workflow with audit trail</li>
                <li>Immutable audit logging of all system actions</li>
                <li>Data integrity controls aligned to ALCOA+ principles</li>
                <li>MFA-enforced authentication via Amazon Cognito</li>
              </ul>

              <h3 className="h3">1.3 Regulatory Context</h3>
              <p>The system must comply with:</p>
              <ul>
                <li><strong>21 CFR Part 11:</strong> Electronic Records; Electronic Signatures</li>
                <li><strong>GxP:</strong> Good Practice quality guidelines</li>
                <li><strong>EU Annex 11:</strong> Computerised Systems (where applicable)</li>
                <li><strong>GAMP 5:</strong> Risk-based approach to compliant GxP computerized systems</li>
              </ul>

              <h3 className="h3">1.4 System User Roles</h3>
              <p>The system supports exactly two user roles:</p>
              <ul>
                <li><strong>Submitter:</strong> Users assigned to Cognito group "Submitter" (submitter1, submitter2 accounts)</li>
                <li><strong>Approver:</strong> Users assigned to Cognito group "Approver" (approver1, approver2 accounts)</li>
                <li><strong>NO Admin role exists</strong> - system administration is performed via AWS Cognito console by IT administrators</li>
              </ul>
            </section>

            <section className="section">
              <h2 className="h2">2. User Requirements</h2>

              <h3 className="h3">2.1 Authentication & Multi-Factor Authentication (MFA) Requirements</h3>
              <div className="reqTable">
                <div className="reqRow reqHeader">
                  <div className="reqId">Req ID</div>
                  <div className="reqDesc">Requirement</div>
                  <div className="reqPriority">Priority</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-AUTH-001</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> The system SHALL require Multi-Factor Authentication (TOTP 6-digit code) for ALL users (Submitters and Approvers) at login.
                    <div className="reqRationale"><strong>Rationale:</strong> Provides strong authentication for all system access per 21 CFR Part 11.10(d) and GxP security requirements. MFA prevents unauthorized access even if credentials are compromised.</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> Cognito User Pool configured with MfaConfiguration: OPTIONAL and EnabledMfas: [SOFTWARE_TOKEN_MFA] in <code>cloudformation/prod/vdc-prod-identity.yaml</code>. All user accounts (submitter1, submitter2, approver1, approver2) have requiresMFA: true in <code>pages/life-sciences/app/login.js</code> USER_CREDENTIALS. TOTP codes generated via <code>components/TOTPGenerator.js</code>.</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-AUTH-002</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> The system SHALL authenticate users via Amazon Cognito OAuth 2.0 authorization code flow with Hosted UI.
                    <div className="reqRationale"><strong>Rationale:</strong> Industry-standard OAuth 2.0 flow provides secure token exchange per 21 CFR Part 11.10(a). Cognito Hosted UI manages password complexity and MFA challenges.</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> Login flow in <code>pages/life-sciences/app/login.js</code> redirects to Cognito Hosted UI via <code>CONFIG.cognitoDomain/oauth2/authorize</code>. Callback handler in <code>pages/life-sciences/app/callback.js</code> exchanges authorization code for JWT tokens via <code>lib/life_sciences_app_lib/auth.js</code> exchangeCodeForTokens().</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-AUTH-003</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> The system SHALL enforce password policy: minimum 12 characters, requiring uppercase, lowercase, numbers, and symbols.
                    <div className="reqRationale"><strong>Rationale:</strong> Strong password policy per 21 CFR Part 11.10(b) and industry security best practices.</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> Cognito User Pool PasswordPolicy configured in <code>cloudformation/prod/vdc-prod-identity.yaml</code> lines 34-41: MinimumLength: 12, RequireLowercase: true, RequireNumbers: true, RequireSymbols: true, RequireUppercase: true.</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-AUTH-004</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> The system SHALL use email addresses as usernames and auto-verify email addresses.
                    <div className="reqRationale"><strong>Rationale:</strong> Email-based authentication provides unique user identification and enables account recovery per 21 CFR Part 11.10(c).</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> Cognito User Pool UsernameAttributes: [email] and AutoVerifiedAttributes: [email] in <code>cloudformation/prod/vdc-prod-identity.yaml</code> lines 30-33.</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-AUTH-005</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> The system SHALL store JWT tokens (ID token, Access token) in browser localStorage and validate token expiration before API calls.
                    <div className="reqRationale"><strong>Rationale:</strong> Secure token storage and validation prevents use of expired credentials per 21 CFR Part 11.10(d).</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> Token storage in <code>lib/life_sciences_app_lib/auth.js</code> setTokens() stores to localStorage. Token expiration check in isExpired() validates exp claim with 60-second buffer. getAccessToken() clears expired tokens automatically.</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-AUTH-006</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> The system SHALL enable Cognito Advanced Security Mode (ENFORCED) for enhanced threat detection.
                    <div className="reqRationale"><strong>Rationale:</strong> Advanced security provides protection against compromised credentials and brute force attacks per GxP security requirements.</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> UserPoolAddOns.AdvancedSecurityMode: ENFORCED in <code>cloudformation/prod/vdc-prod-identity.yaml</code> line 55.</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
              </div>

              <h3 className="h3">2.2 Role-Based Access Control (RBAC) Requirements</h3>
              <div className="reqTable">
                <div className="reqRow reqHeader">
                  <div className="reqId">Req ID</div>
                  <div className="reqDesc">Requirement</div>
                  <div className="reqPriority">Priority</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-RBAC-001</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> The system SHALL support exactly two user roles: Submitter and Approver. NO Admin role SHALL exist in the application.
                    <div className="reqRationale"><strong>Rationale:</strong> Implements role-based access control and separation of duties per 21 CFR Part 11.10(g). Admin functions are performed via AWS Cognito console by IT administrators only.</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> Role determination in <code>lib/life_sciences_app_lib/auth.js</code> getUserFromToken() extracts cognito:groups from JWT ID token. Default role is "Submitter" if no groups present. Role set to "Approver" only if groups.includes("Approver"). No "Admin" role logic exists in codebase.</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-RBAC-002</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> Submitter role users (submitter1, submitter2) SHALL be able to upload documents but SHALL NOT be able to approve or reject documents.
                    <div className="reqRationale"><strong>Rationale:</strong> Separation of duties prevents submitters from approving their own work per 21 CFR Part 11.10(g) and GxP quality requirements.</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> Frontend role check in <code>pages/life-sciences/app/approval/[id].js</code> line 63 validates roleIsApprover(u.role). Backend Lambda functions (approve, reject) validate cognito:groups claim contains "Approver" group. Submitter group users receive 403 Forbidden if attempting approval actions.</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-RBAC-003</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> Approver role users (approver1, approver2) SHALL be able to approve/reject documents but SHALL NOT be able to upload documents.
                    <div className="reqRationale"><strong>Rationale:</strong> Role separation ensures approvers focus on review activities. Document submission is restricted to Submitter role per workflow design.</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> Upload Lambda functions validate user has Submitter group membership. Approver-only users attempting upload receive appropriate error. Frontend <code>pages/life-sciences/app/upload.js</code> accessible to all authenticated users, but backend enforces role-based submission.</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-RBAC-004</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> The system SHALL prevent Submitters from viewing the Pending Approvals page and SHALL display an appropriate message.
                    <div className="reqRationale"><strong>Rationale:</strong> Prevents unauthorized access to approval queue per role-based access control principles.</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> Frontend check in <code>pages/life-sciences/app/submissions.js</code> onClickPendingApprovals() displays "Only Approvers can view Pending Approval documents" message. Navigation link disabled for non-approvers via disabledNav class.</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-RBAC-005</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> The system SHALL prevent users from approving their own submitted documents (self-approval prevention).
                    <div className="reqRationale"><strong>Rationale:</strong> Critical separation of duties control per 21 CFR Part 11.10(g). Prevents conflict of interest where submitter approves own work.</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> Approve Lambda function validates submittedBy !== currentUser before allowing approval. If match detected, returns 403 Forbidden with error message. Tested in OQ-004 and PQ-014 per <code>pages/life-sciences/docs/inspection-qa.js</code> line 228-230.</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-RBAC-006</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> The system SHALL extract user role from JWT token cognito:groups claim and enforce role-based access at both frontend and backend layers.
                    <div className="reqRationale"><strong>Rationale:</strong> Defense-in-depth security approach. Frontend provides user experience, backend enforces security per 21 CFR Part 11.10(g).</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> Frontend: <code>lib/life_sciences_app_lib/auth.js</code> getUserFromToken() parses JWT and extracts cognito:groups. Backend: API Gateway JWT Authorizer validates token and passes claims to Lambda. Lambda functions check event.requestContext.authorizer.claims["cognito:groups"] array.</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
              </div>

              <h3 className="h3">2.3 Document Submission Requirements</h3>
              <div className="reqTable">
                <div className="reqRow reqHeader">
                  <div className="reqId">Req ID</div>
                  <div className="reqDesc">Requirement</div>
                  <div className="reqPriority">Priority</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-SUBMIT-001</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> The system SHALL allow authorized Submitters to upload documents for approval via a three-step process: (1) upload-init, (2) direct S3 PUT, (3) submit.
                    <div className="reqRationale"><strong>Rationale:</strong> Secure document upload workflow per 21 CFR Part 11.10(a). Presigned URLs enable direct S3 upload without exposing credentials.</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> Frontend workflow in <code>pages/life-sciences/app/upload.js</code> handleSubmit() calls POST /documents/upload/init, then PUT to presignedUrl, then POST /documents/submit. UploadInitLambda generates presigned S3 URL with 15-minute expiration.</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-SUBMIT-002</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> The system SHALL generate a unique document ID (UUID v4) for each uploaded document before S3 upload.
                    <div className="reqRationale"><strong>Rationale:</strong> Unique document identification per 21 CFR Part 11.10(e) enables traceability and prevents document conflicts.</div>
                    <div className="reqImplementation">
                      <strong>Implementation:</strong> UploadInitLambda generates documentId = str(uuid.uuid4()) in <code>temp-analysis/vdc-dev-template.yaml</code> line 200. Document ID is returned to the frontend before S3 upload and used as part of the S3 key prefix in the pattern <code>&lt;env&gt;/documents/&lbrace;document_id&rbrace;/&lbrace;filename&rbrace;</code>, where <code>&lt;env&gt;</code> represents the environment (for example, <code>dev</code> or <code>prod</code>).
                    </div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-SUBMIT-003</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> The system SHALL calculate and store SHA-256 hash for document integrity verification during the submit step (after S3 upload completes).
                    <div className="reqRationale"><strong>Rationale:</strong> Data integrity verification per 21 CFR Part 11.10(e) and ALCOA+ Accurate principle. Hash enables detection of document tampering.</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> SubmitLambda reads uploaded file from S3 and calculates SHA-256 hash via sha256_stream() function. Hash stored in DynamoDB document metadata (sha256 field) and audit trail (integrity.sha256). Hash verification on download ensures document integrity.</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-SUBMIT-004</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> The system SHALL record submission timestamp in ISO 8601 format (UTC) at the time of document submission.
                    <div className="reqRationale"><strong>Rationale:</strong> Contemporaneous record-keeping per 21 CFR Part 11.10(e) and ALCOA+ Contemporaneous principle. UTC ensures timezone-independent auditability.</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> SubmitLambda sets submittedAt = utc_now_iso() in DynamoDB document metadata. Timestamp format: ISO 8601 with milliseconds and Z suffix (e.g., "2026-01-27T23:44:35.394527Z"). Displayed in human-readable format via <code>lib/life_sciences_app_lib/utils.js</code> formatUtcTimestamp().</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-SUBMIT-005</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> The system SHALL store documents in encrypted S3 storage (AES-256 Server-Side Encryption) with versioning enabled.
                    <div className="reqRationale"><strong>Rationale:</strong> Data protection at rest per 21 CFR Part 11.10(b) and encryption requirements. Versioning enables document history recovery.</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> S3 bucket VdcDocsBucket configured with BucketEncryption.ServerSideEncryptionByDefault.SSEAlgorithm: AES256 and VersioningConfiguration.Status: Enabled in <code>cloudformation/prod/vdc-prod-app.yaml</code> lines 65-70.</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-SUBMIT-006</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> The system SHALL store document metadata in DynamoDB with composite key: pk="DOC#&lbrace;documentId&rbrace;", sk="METADATA".
                    <div className="reqRationale"><strong>Rationale:</strong> Structured data storage enables efficient querying and document retrieval per system design requirements.</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> DynamoDB Documents table schema: pk (HASH), sk (RANGE), gsi1pk, gsi1sk for status-based queries. Document metadata stored with pk=f"DOC#&lbrace;document_id&rbrace;", sk="METADATA" in <code>temp-analysis/vdc-dev-template.yaml</code> lines 210-228.</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-SUBMIT-007</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> The system SHALL capture submitter identity (email, displayName) from JWT token and store in document metadata as ownerEmail, ownerDisplayName, submittedByEmail.
                    <div className="reqRationale"><strong>Rationale:</strong> Attributable record-keeping per 21 CFR Part 11.10(e) and ALCOA+ Attributable principle. Links document to authenticated user.</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> Frontend <code>pages/life-sciences/app/upload.js</code> sends userIdentity (currentUserLabel) in submit request. SubmitLambda extracts user email from JWT claims and stores in DynamoDB as ownerEmail, submittedByEmail fields. Frontend prioritizes displayName || email over username to avoid UUIDs.</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-SUBMIT-008</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> The system SHALL require document title as a mandatory field during submission.
                    <div className="reqRationale"><strong>Rationale:</strong> Document identification and searchability per business requirements.</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> SubmitLambda validates title is required in <code>temp-analysis/vdc-dev-template.yaml</code> line 322-323. Returns 400 error if title missing. Frontend <code>pages/life-sciences/app/upload.js</code> requires docName input before submission.</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-SUBMIT-009</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> The system SHALL set document status to "DRAFT" during upload-init and "SUBMITTED" after successful submit.
                    <div className="reqRationale"><strong>Rationale:</strong> Workflow state management enables proper document lifecycle tracking per business process requirements.</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> UploadInitLambda creates document with status="DRAFT" in DynamoDB. SubmitLambda validates status must be "DRAFT" before submission (line 329), then updates status to "SUBMITTED" via UpdateItem expression. Status stored in gsi1pk="STATUS#SUBMITTED" for querying pending approvals.</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
              </div>

              <h3 className="h3">2.4 Approval Workflow Requirements</h3>
              <div className="reqTable">
                <div className="reqRow reqHeader">
                  <div className="reqId">Req ID</div>
                  <div className="reqDesc">Requirement</div>
                  <div className="reqPriority">Priority</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-APPROVE-001</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> The system SHALL allow authorized Approvers to view pending approval requests via GET /approvals/pending endpoint.
                    <div className="reqRationale"><strong>Rationale:</strong> Approver access to pending documents per workflow requirements and 21 CFR Part 11.10(g).</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> PendingApprovalsLambda queries DynamoDB GSI1 where gsi1pk="STATUS#SUBMITTED" to retrieve all submitted documents. Frontend <code>pages/life-sciences/app/approval/approvals/index.js</code> displays pending documents in table format. API route: GET /approvals/pending with JWT authorization required.</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-APPROVE-002</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> The system SHALL display document metadata (ID, filename, submitter email/name, submission timestamp, SHA-256 hash) to Approvers for review.
                    <div className="reqRationale"><strong>Rationale:</strong> Complete document information enables informed approval decisions per 21 CFR Part 11.10(e) and audit requirements.</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> Frontend <code>pages/life-sciences/app/approval/[id].js</code> displays document summary with title, documentId, submittedBy (prioritizing email/displayName over UUIDs), submittedAt (human-readable UTC), and status. Metadata retrieved from DynamoDB document record.</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-APPROVE-003</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> The system SHALL allow Approvers to download and review documents via controlled copy (presigned S3 URL with 5-minute expiration) before making approval decision.
                    <div className="reqRationale"><strong>Rationale:</strong> Document review capability per workflow requirements. Short-lived presigned URLs enhance security per 21 CFR Part 11.10(b).</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> DownloadLambda generates presigned S3 URL with ExpiresIn=300 (5 minutes) in <code>cloudformation/prod/vdc-prod-app.yaml</code> DownloadLambda configuration. Frontend <code>pages/life-sciences/app/approval/[id].js</code> openControlledCopy() calls GET /documents/:id/download and opens URL in new window.</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-APPROVE-004</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> The system SHALL provide Approve action (POST /approvals/:id/approve) that requires MFA-authenticated session and Approver role.
                    <div className="reqRationale"><strong>Rationale:</strong> Electronic signature via MFA-authenticated approval per 21 CFR Part 11.10(g) and 11.50. Approval action represents electronic signature with meaning equivalent to handwritten signature.</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> ApproveLambda validates user has "Approver" group in cognito:groups claim. ENFORCE_APPROVER_MFA environment variable enables MFA validation. Frontend <code>pages/life-sciences/app/approval/[id].js</code> handleApprove() calls API endpoint. Approval creates audit record and updates document status to "APPROVED".</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-APPROVE-005</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> The system SHALL provide Reject action (POST /approvals/:id/reject) that requires MFA-authenticated session, Approver role, and mandatory rejection reason.
                    <div className="reqRationale"><strong>Rationale:</strong> Rejection with reason provides audit trail justification per 21 CFR Part 11.10(e). Rejection reason recorded in audit trail for FDA inspection.</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> RejectLambda validates Approver role and requires comment field in request body. Frontend <code>pages/life-sciences/app/approval/[id].js</code> handleReject() validates rejectionComment.trim() is not empty before API call. Rejection reason stored in audit trail details.comment field. Document status updated to "REJECTED".</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-APPROVE-006</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> The system SHALL prevent self-approval by validating submittedBy (from document metadata) does not equal currentUser (from JWT token) before allowing approval.
                    <div className="reqRationale"><strong>Rationale:</strong> Separation of duties per 21 CFR Part 11.10(g). Prevents conflict of interest where submitter approves own document.</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> ApproveLambda compares document.submittedBy (or ownerEmail) with JWT claims.email. If match detected, returns 403 Forbidden error. Tested in OQ-004 and PQ-014. Frontend also validates roleIsApprover() but backend enforcement is authoritative.</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-APPROVE-007</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> The system SHALL update document status from "SUBMITTED" to "APPROVED" or "REJECTED" upon approver decision.
                    <div className="reqRationale"><strong>Rationale:</strong> Workflow state management enables proper document lifecycle tracking and status visibility per business requirements.</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> ApproveLambda and RejectLambda update DynamoDB document metadata status field via UpdateItem. GSI1 keys updated: gsi1pk="STATUS#APPROVED" or "STATUS#REJECTED", gsi1sk=timestamp for querying by status. Status displayed in frontend with color-coded badges.</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
              </div>

              <h3 className="h3">2.5 Audit Trail Requirements (21 CFR Part 11)</h3>
              <div className="reqTable">
                <div className="reqRow reqHeader">
                  <div className="reqId">Req ID</div>
                  <div className="reqDesc">Requirement</div>
                  <div className="reqPriority">Priority</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-AUDIT-001</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> The system SHALL create audit records for all document upload-init actions with eventType "DOC_UPLOAD_INITIATED".
                    <div className="reqRationale"><strong>Rationale:</strong> Complete audit trail per 21 CFR Part 11.10(e). Records document creation initiation for traceability.</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> UploadInitLambda creates audit record in VdcAuditTable with eventType="DOC_UPLOAD_INITIATED", timestampUtc, actorUserId, actorUsername, details (filename, contentType), and integrity (S3 bucket/key) in <code>temp-analysis/vdc-dev-template.yaml</code> lines 231-243.</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-AUDIT-002</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> The system SHALL create audit records for all document submissions with eventType "SUBMIT" and electronic signature record with signatureMeaning "SUBMIT".
                    <div className="reqRationale"><strong>Rationale:</strong> Submission audit record and electronic signature per 21 CFR Part 11.50 and 11.70. Signature record provides attestation text.</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> SubmitLambda creates two DynamoDB records: (1) Audit record with eventType="SUBMIT", (2) Electronic signature record with sk=f"ESIG#&lbrace;timestamp&rbrace;#&lbrace;sig_id&rbrace;", signatureMeaning="SUBMIT", attestationText="I attest this submission is accurate and complete." in <code>temp-analysis/vdc-dev-template.yaml</code> lines 345-388.</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-AUDIT-003</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> The system SHALL create audit records for all approval actions with eventType "APPROVE", including approver identity and timestamp.
                    <div className="reqRationale"><strong>Rationale:</strong> Approval audit record per 21 CFR Part 11.10(e) and 11.50. Records who approved, when, and which document.</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> ApproveLambda creates audit record with eventType="APPROVE", timestampUtc, actorEmail (from JWT), actorUsername, documentId, and outcome="success". Record stored in VdcAuditTable with composite key: docId (documentId), eventKey (timestamp-based).</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-AUDIT-004</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> The system SHALL create audit records for all rejection actions with eventType "REJECT", including approver identity, timestamp, and rejection reason in details.comment.
                    <div className="reqRationale"><strong>Rationale:</strong> Rejection audit record with reason per 21 CFR Part 11.10(e). Enables FDA inspection to understand why documents were rejected.</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> RejectLambda creates audit record with eventType="REJECT", timestampUtc, actorEmail, details.comment (rejection reason from request body), and outcome="success". Rejection reason displayed in audit trail via <code>pages/life-sciences/app/documents/[id].js</code> formatAction() function.</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-AUDIT-005</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> Audit records SHALL include: eventId (UUID), documentId, timestampUtc (ISO 8601), eventType, actorEmail, actorUsername, actorUserId, actorGroups, details (action-specific), and integrity (S3 bucket/key/SHA-256).
                    <div className="reqRationale"><strong>Rationale:</strong> Complete audit record per 21 CFR Part 11.10(e) and ALCOA+ principles. Enables full traceability of who did what, when, and on which document.</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> Audit record schema in DynamoDB VdcAuditTable: docId (HASH), eventKey (RANGE with timestamp). Fields include eventId, timestampUtc, eventType, actorEmail, actorUsername, actorUserId, actorGroups (from JWT cognito:groups), details (JSON object), integrity (S3 location and SHA-256 hash).</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-AUDIT-006</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> Audit records SHALL be immutable (stored in DynamoDB with IAM policies that deny UpdateItem and DeleteItem operations).
                    <div className="reqRationale"><strong>Rationale:</strong> Immutability per 21 CFR Part 11.10(e) prevents tampering with audit records. Only PutItem (create) and Query (read) operations permitted.</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> VdcLambdaRole IAM policy in <code>cloudformation/prod/vdc-prod-app.yaml</code> lines 240-246 allows only dynamodb:PutItem, dynamodb:Query, dynamodb:GetItem on VdcAuditTable. No UpdateItem or DeleteItem permissions granted. Tested in OQ-017 per <code>pages/life-sciences/docs/inspection-qa.js</code> lines 113-118.</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-AUDIT-007</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> The system SHALL provide audit trail retrieval capability via GET /documents/:id/audit endpoint, returning events sorted chronologically.
                    <div className="reqRationale"><strong>Rationale:</strong> Audit trail inspection capability per 21 CFR Part 11.10(e) and FDA inspection requirements. Enables retrieval of complete document history.</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> DocumentAuditLambda queries VdcAuditTable by docId (documentId) and returns events array. Frontend <code>pages/life-sciences/app/documents/[id].js</code> displays audit trail in FDA-ready format matching Overview page example: "timestamp | action | Actor: name". Events sorted by timestamp (oldest first).</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-AUDIT-008</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> The system SHALL store audit records in a separate DynamoDB table (VdcAuditTable) with composite key: docId (HASH), eventKey (RANGE).
                    <div className="reqRationale"><strong>Rationale:</strong> Separation of audit data from operational data per security best practices. Composite key enables efficient querying by document.</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> VdcAuditTable schema in <code>cloudformation/prod/vdc-prod-app.yaml</code> lines 181-199: docId (HASH), eventKey (RANGE with format "timestamp#eventId"). Table name: VDC_Audit_&lbrace;EnvironmentName&rbrace;. Point-in-time recovery enabled for 7-year retention.</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-AUDIT-009</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> The system SHALL display audit trail in FDA-ready format: "AUDIT TRAIL (UTC)" header, document metadata (Title, ID, Status), "EVENTS (UTC)" section with format "timestamp | action | Actor: name".
                    <div className="reqRationale"><strong>Rationale:</strong> Human-readable audit trail format per FDA inspection requirements. Matches example format shown on Overview page for consistency.</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> Frontend <code>pages/life-sciences/app/documents/[id].js</code> auditTrailText useMemo formats audit events as: "&lbrace;timestamp&rbrace; | &lbrace;action&rbrace; | Actor: &lbrace;actor&rbrace;". Timestamps use ISO 8601 format with Z suffix via formatUtcTimestampForAudit(). Rejection reasons included in action text: "Rejected: &lbrace;reason&rbrace;".</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-AUDIT-010</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> The system SHALL write audit records to S3 WORM (Write-Once-Read-Many) bucket with Object Lock in COMPLIANCE mode for long-term retention.
                    <div className="reqRationale"><strong>Rationale:</strong> Immutable long-term audit storage per 21 CFR Part 11.10(e) and 7-year retention requirements. COMPLIANCE mode prevents deletion even by root account.</div>
                    <div className="reqImplementation">
                      <strong>Implementation:</strong> VdcAuditWormBucket is configured with ObjectLockEnabled: true and ObjectLockConfiguration with Mode: COMPLIANCE and DefaultRetention: 90 days in <code>cloudformation/prod/vdc-prod-app.yaml</code> lines 122-143. Lambda functions write audit JSON to S3 under an environment-specific prefix such as <code>audit/&lt;env&gt;/</code> (for example, <code>audit/dev/</code> or <code>audit/prod/</code>).
                    </div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
              </div>

              <h3 className="h3">2.6 Electronic Signature Requirements (21 CFR Part 11)</h3>
              <div className="reqTable">
                <div className="reqRow reqHeader">
                  <div className="reqId">Req ID</div>
                  <div className="reqDesc">Requirement</div>
                  <div className="reqPriority">Priority</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-ESIG-001</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> The system SHALL create electronic signature records for document submission with signatureMeaning "SUBMIT", signerUserId, signerUsername, timestampUtc, and attestationText.
                    <div className="reqRationale"><strong>Rationale:</strong> Electronic signature per 21 CFR Part 11.50 and 11.70. Submission represents electronic signature with meaning equivalent to handwritten signature.</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> SubmitLambda creates electronic signature record in DynamoDB with sk=f"ESIG#&lbrace;timestamp&rbrace;#&lbrace;sig_id&rbrace;", signatureMeaning="SUBMIT", signerRole="UPLOADER", attestationText="I attest this submission is accurate and complete." in <code>temp-analysis/vdc-dev-template.yaml</code> lines 371-388.</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-ESIG-002</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> The system SHALL create electronic signature records for approval actions with signatureMeaning "APPROVE", including approver identity from MFA-authenticated JWT token.
                    <div className="reqRationale"><strong>Rationale:</strong> Electronic signature for approval per 21 CFR Part 11.50. MFA-authenticated session provides two-factor authentication equivalent to handwritten signature.</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> ApproveLambda creates electronic signature record with signerEmail, signerUsername from JWT claims, signatureMeaning="APPROVE", timestampUtc, and documentId. Signature linked to document via pk="DOC#&lbrace;documentId&rbrace;".</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-ESIG-003</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> Electronic signatures SHALL be linked to the signer's identity (email, username, userId) from the authenticated JWT token, not from user input.
                    <div className="reqRationale"><strong>Rationale:</strong> Prevents signature forgery per 21 CFR Part 11.50(b). Identity must come from authenticated session, not user-provided data.</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> Lambda functions extract user identity from event.requestContext.authorizer.claims (email, sub, cognito:username) passed by API Gateway JWT Authorizer. No user-provided identity fields accepted. JWT token validated by API Gateway before reaching Lambda.</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-ESIG-004</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> Electronic signatures SHALL include timestamp in ISO 8601 UTC format recorded at the time of signature action.
                    <div className="reqRationale"><strong>Rationale:</strong> Timestamped signatures per 21 CFR Part 11.50(a). UTC ensures timezone-independent auditability.</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> All signature records include timestampUtc field in ISO 8601 format with milliseconds and Z suffix (e.g., "2026-01-27T23:44:35.394527Z"). Timestamp generated server-side at action time, not from client.</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
              </div>

              <h3 className="h3">2.7 Data Integrity Requirements (ALCOA+)</h3>
              <div className="reqTable">
                <div className="reqRow reqHeader">
                  <div className="reqId">Req ID</div>
                  <div className="reqDesc">Requirement</div>
                  <div className="reqPriority">Priority</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-INTEGRITY-001</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> <strong>Attributable:</strong> All actions SHALL be linked to authenticated user identity (email, userId from JWT token cognito:groups claim).
                    <div className="reqRationale"><strong>Rationale:</strong> ALCOA+ Attributable principle per 21 CFR Part 11.10(e). Every action must be traceable to a specific authenticated user.</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> All audit records include actorEmail, actorUsername, actorUserId extracted from JWT token claims. Frontend <code>lib/life_sciences_app_lib/auth.js</code> getUserFromToken() extracts email and sub from ID token. Backend Lambda functions use event.requestContext.authorizer.claims for user identity.</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-INTEGRITY-002</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> <strong>Legible:</strong> All records SHALL be human-readable and stored in UTF-8 encoding.
                    <div className="reqRationale"><strong>Rationale:</strong> ALCOA+ Legible principle per 21 CFR Part 11.10(e). Records must be readable by humans and systems.</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> DynamoDB stores all text fields as UTF-8 strings. Audit trail displayed in human-readable format via <code>pages/life-sciences/app/documents/[id].js</code> with monospace font. Frontend prioritizes human-readable fields (email, displayName) over UUIDs in owner display logic.</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-INTEGRITY-003</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> <strong>Contemporaneous:</strong> Timestamps SHALL be recorded at the time of action (server-side, not client-side).
                    <div className="reqRationale"><strong>Rationale:</strong> ALCOA+ Contemporaneous principle per 21 CFR Part 11.10(e). Prevents timestamp manipulation by recording server-side.</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> All Lambda functions generate timestamps server-side using utc_now_iso() function. No client-provided timestamps accepted. Timestamps stored in ISO 8601 format with milliseconds: "2026-01-27T23:44:35.394527Z".</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-INTEGRITY-004</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> <strong>Original:</strong> Documents SHALL be stored in original uploaded format without modification.
                    <div className="reqRationale"><strong>Rationale:</strong> ALCOA+ Original principle per 21 CFR Part 11.10(e). Documents must be stored exactly as uploaded to preserve authenticity.</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> S3 stores documents with original filename and content-type. No document transformation or conversion performed. S3 versioning enabled to preserve original versions. Documents retrieved via presigned URLs maintain original format.</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-INTEGRITY-005</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> <strong>Accurate:</strong> SHA-256 hashes SHALL verify document integrity on upload and enable verification on download.
                    <div className="reqRationale"><strong>Rationale:</strong> ALCOA+ Accurate principle per 21 CFR Part 11.10(e). Hash verification detects document tampering or corruption.</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> SubmitLambda calculates SHA-256 hash via sha256_stream() function after S3 upload completes. Hash stored in DynamoDB document metadata (sha256 field) and audit trail (integrity.sha256). Download verification can compare stored hash with recalculated hash to detect tampering.</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-INTEGRITY-006</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> <strong>Complete:</strong> All required document metadata fields (title, documentId, submittedAt, sha256, status, ownerEmail) SHALL be captured and stored.
                    <div className="reqRationale"><strong>Rationale:</strong> ALCOA+ Complete principle. All necessary information for document traceability must be captured.</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> SubmitLambda validates required fields (title, documentId) and stores complete metadata in DynamoDB: title, description, documentId, submittedAt, sha256, status, ownerEmail, ownerDisplayName, s3Bucket, s3Key, s3VersionId, contentType, originalFilename.</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-INTEGRITY-007</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> <strong>Consistent:</strong> Document status transitions SHALL follow defined workflow: DRAFT → SUBMITTED → (APPROVED | REJECTED).
                    <div className="reqRationale"><strong>Rationale:</strong> ALCOA+ Consistent principle. Workflow state management ensures consistent document lifecycle.</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> SubmitLambda validates document status must be "DRAFT" before allowing submission (line 329). Status updated to "SUBMITTED" only from "DRAFT". ApproveLambda/RejectLambda update status to "APPROVED" or "REJECTED" only from "SUBMITTED". Status stored in gsi1pk for querying.</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-INTEGRITY-008</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> <strong>Enduring:</strong> Documents and audit records SHALL be retained for minimum 7 years with Point-in-Time Recovery enabled.
                    <div className="reqRationale"><strong>Rationale:</strong> ALCOA+ Enduring principle and 21 CFR Part 11.10(e) retention requirements. Long-term data preservation for FDA inspection.</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> DynamoDB tables (VdcDocumentsTable, VdcAuditTable) configured with PointInTimeRecoverySpecification.PointInTimeRecoveryEnabled: true in <code>cloudformation/prod/vdc-prod-app.yaml</code> lines 178 and 199. S3 audit WORM bucket with Object Lock provides additional long-term storage.</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
              </div>

              <h3 className="h3">2.8 Security & Encryption Requirements</h3>
              <div className="reqTable">
                <div className="reqRow reqHeader">
                  <div className="reqId">Req ID</div>
                  <div className="reqDesc">Requirement</div>
                  <div className="reqPriority">Priority</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-SEC-001</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> The system SHALL encrypt data in transit using TLS 1.2+ on all API Gateway and CloudFront endpoints.
                    <div className="reqRationale"><strong>Rationale:</strong> Data protection in transit per 21 CFR Part 11.10(b) and industry security standards.</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> API Gateway HTTP API enforces TLS 1.2+ by default. CloudFront distribution uses TLS for all frontend traffic. All API calls use HTTPS. CORS configuration allows only authorized origins.</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-SEC-002</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> The system SHALL encrypt data at rest using AES-256 Server-Side Encryption for S3 buckets and AWS-managed encryption for DynamoDB tables.
                    <div className="reqRationale"><strong>Rationale:</strong> Data protection at rest per 21 CFR Part 11.10(b) and encryption requirements.</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> S3 buckets configured with BucketEncryption.ServerSideEncryptionByDefault.SSEAlgorithm: AES256 in <code>cloudformation/prod/vdc-prod-app.yaml</code> lines 68-70 and 136-138. DynamoDB tables configured with SSESpecification.SSEEnabled: true (AWS-managed keys) in lines 177 and 197.</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-SEC-003</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> The system SHALL enforce API Gateway JWT Authorizer on all API routes, validating JWT token signature, issuer, and audience before allowing Lambda invocation.
                    <div className="reqRationale"><strong>Rationale:</strong> API security per 21 CFR Part 11.10(b). JWT validation ensures only authenticated users can access API endpoints.</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> VdcJwtAuthorizer configured in <code>cloudformation/prod/vdc-prod-app.yaml</code> lines 464-475 with AuthorizerType: JWT, IdentitySource: ["$request.header.Authorization"], JwtConfiguration with Audience (CognitoClientId) and Issuer (CognitoIssuerUrl). All routes (lines 538-608) require AuthorizationType: JWT and AuthorizerId.</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-SEC-004</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> The system SHALL implement least-privilege IAM policies for Lambda functions, granting only necessary DynamoDB and S3 permissions.
                    <div className="reqRationale"><strong>Rationale:</strong> Security best practice per GxP requirements. Minimizes attack surface by restricting Lambda permissions to minimum required.</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> VdcLambdaRole IAM policy in <code>cloudformation/prod/vdc-prod-app.yaml</code> lines 219-267 grants: Documents table (GetItem, PutItem, UpdateItem, Query, Scan), Audit table (PutItem, Query, GetItem only - no Update/Delete), S3 docs bucket (GetObject, PutObject, ListBucket), S3 audit WORM bucket (PutObject, ListBucket). No wildcard permissions.</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-SEC-005</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> The system SHALL block public access to S3 buckets (BlockPublicAcls, IgnorePublicAcls, BlockPublicPolicy, RestrictPublicBuckets all set to true).
                    <div className="reqRationale"><strong>Rationale:</strong> S3 security best practice. Prevents accidental public exposure of documents per 21 CFR Part 11.10(b).</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> VdcDocsBucket and VdcAuditWormBucket configured with PublicAccessBlockConfiguration setting all four flags to true in <code>cloudformation/prod/vdc-prod-app.yaml</code> lines 71-75 and 139-143.</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-SEC-006</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> The system SHALL configure S3 CORS to allow only authorized frontend origins (explicit domain list, no wildcards).
                    <div className="reqRationale"><strong>Rationale:</strong> CORS security per web security best practices. S3 does not support wildcard origins, requiring explicit domain list.</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> VdcDocsBucket CorsConfiguration in <code>cloudformation/prod/vdc-prod-app.yaml</code> lines 76-96 explicitly lists AllowedOrigins: ["https://vdc-mfa-demo.vercel.app", "https://vdc-prod.vercel.app", "https://williamoconnellpmp.com", "http://localhost:3000"]. No wildcard patterns used.</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
              </div>

              <h3 className="h3">2.9 Document Retrieval & Display Requirements</h3>
              <div className="reqTable">
                <div className="reqRow reqHeader">
                  <div className="reqId">Req ID</div>
                  <div className="reqDesc">Requirement</div>
                  <div className="reqPriority">Priority</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-DISPLAY-001</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> The system SHALL display human-readable submitter/owner names (email, displayName) instead of UUIDs in all document listings and detail pages.
                    <div className="reqRationale">
                      <strong>Rationale:</strong> User experience and audit trail readability. UUIDs are not meaningful to users or FDA inspectors.
                    </div>
                    <div className="reqImplementation">
                      <strong>Implementation:</strong> Frontend functions in <code>pages/life-sciences/app/documents/index.js</code> pickOwner() and <code>pages/life-sciences/app/submissions.js</code> pickSubmittedBy() prioritize human-readable fields (ownerEmail, ownerDisplayName, submittedByEmail) over UUIDs. UUIDs (long strings &gt; 30 characters without an <code>@</code>) are hidden and display &quot;—&quot; instead.
                    </div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-DISPLAY-002</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> The system SHALL display UTC timestamps in human-readable format (e.g., "Jan 27, 2026 at 11:44 PM UTC") in all user-facing displays, while maintaining ISO 8601 format in audit trail text.
                    <div className="reqRationale"><strong>Rationale:</strong> User experience for readability while maintaining machine-readable format in audit records per FDA requirements.</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> Frontend <code>lib/life_sciences_app_lib/utils.js</code> formatUtcTimestamp() formats for display. formatUtcTimestampForAudit() maintains ISO 8601 format for audit trail. All timestamp displays use formatUtcTimestamp() except audit trail pre-formatted text which uses ISO format.</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-DISPLAY-003</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> The system SHALL provide "Audit Trail" link (not "View") on all document listing pages for consistency and FDA readiness.
                    <div className="reqRationale"><strong>Rationale:</strong> Consistent terminology per FDA inspection requirements. "Audit Trail" is the standard term for regulatory compliance.</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> Frontend pages use "Audit Trail" link text: <code>pages/life-sciences/app/submissions.js</code> line 507, <code>pages/life-sciences/app/documents/index.js</code> line 478, <code>pages/life-sciences/app/approval/index.js</code> line 320. Links navigate to <code>/life-sciences/app/documents/:id</code> which displays audit trail section.</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
                <div className="reqRow">
                  <div className="reqId">URS-DISPLAY-004</div>
                  <div className="reqDesc">
                    <strong>Requirement:</strong> The system SHALL provide graceful degradation when audit API fails, displaying audit trail built from document metadata instead of showing only error message.
                    <div className="reqRationale"><strong>Rationale:</strong> User experience and audit trail availability. Even if dedicated audit endpoint fails, document metadata provides basic audit information.</div>
                    <div className="reqImplementation"><strong>Implementation:</strong> Frontend <code>pages/life-sciences/app/documents/[id].js</code> auditTrailText useMemo builds fallback audit trail from document metadata (submittedAt, status, updatedAt) when audit.length === 0. Error notice displayed but audit trail still shown. Graceful degradation ensures users always see audit information.</div>
                  </div>
                  <div className="reqPriority">Critical</div>
                </div>
              </div>

            </section>

            <section className="section">
              <h2 className="h2">3. Non-Functional Requirements</h2>

              <h3 className="h3">3.1 Performance</h3>
              <ul>
                <li><strong>URS-PERF-001:</strong> Document upload SHALL complete within 30 seconds for files up to 10MB</li>
                <li><strong>URS-PERF-002:</strong> Approval list page SHALL load within 3 seconds</li>
                <li><strong>URS-PERF-003:</strong> System SHALL support 100 concurrent users</li>
                <li><strong>URS-PERF-004:</strong> Lambda functions SHALL have timeout of 15 seconds (30 seconds for submit/download operations)</li>
              </ul>

              <h3 className="h3">3.2 Availability</h3>
              <ul>
                <li><strong>URS-AVAIL-001:</strong> System SHALL maintain 99.5% uptime during business hours</li>
                <li><strong>URS-AVAIL-002:</strong> System SHALL provide graceful error messages for failures</li>
                <li><strong>URS-AVAIL-003:</strong> System SHALL use AWS serverless architecture (Lambda, API Gateway) for automatic scaling</li>
              </ul>

              <h3 className="h3">3.3 Backup & Recovery</h3>
              <ul>
                <li><strong>URS-BACKUP-001:</strong> Document storage SHALL be backed up via S3 versioning with Point-in-Time Recovery enabled</li>
                <li><strong>URS-BACKUP-002:</strong> Audit logs SHALL be retained for minimum 7 years in S3 WORM bucket with Object Lock</li>
                <li><strong>URS-BACKUP-003:</strong> DynamoDB tables SHALL have PointInTimeRecoveryEnabled: true for 35-day recovery window</li>
              </ul>
            </section>

            <section className="section">
              <h2 className="h2">4. System Architecture</h2>
              <p>The VDC system is built on AWS serverless architecture:</p>
              <ul>
                <li><strong>Frontend:</strong> Next.js static site hosted on Vercel (deployed to vdc-mfa-demo.vercel.app)</li>
                <li><strong>Authentication:</strong> Amazon Cognito User Pool with TOTP MFA (SOFTWARE_TOKEN_MFA) for ALL users</li>
                <li><strong>API:</strong> API Gateway HTTP API with JWT Authorizer + AWS Lambda functions (Python 3.12)</li>
                <li><strong>Storage:</strong> Amazon S3 (documents with AES-256 SSE), DynamoDB (metadata + audit with AWS-managed encryption)</li>
                <li><strong>Audit Storage:</strong> S3 WORM bucket with Object Lock (COMPLIANCE mode) for long-term audit retention</li>
                <li><strong>Monitoring:</strong> CloudWatch Logs + CloudWatch Alarms</li>
              </ul>

              <h3 className="h3">4.1 Lambda Functions</h3>
              <ul>
                <li><strong>vdc-upload-init-prod:</strong> Generates documentId, S3 presigned URL, creates DRAFT document record</li>
                <li><strong>vdc-submit-prod:</strong> Calculates SHA-256 hash, updates document to SUBMITTED, creates audit + e-signature records</li>
                <li><strong>vdc-approvals-pending-prod:</strong> Queries SUBMITTED documents for approver review queue</li>
                <li><strong>vdc-approve-prod:</strong> Validates Approver role and MFA, prevents self-approval, updates status to APPROVED, creates audit record</li>
                <li><strong>vdc-reject-prod:</strong> Validates Approver role and MFA, requires rejection reason, updates status to REJECTED, creates audit record with reason</li>
                <li><strong>vdc-download-prod:</strong> Generates presigned S3 URL (5-minute expiration) for controlled document access</li>
                <li><strong>vdc-documents-list-prod:</strong> Returns all documents for authenticated user (role-based filtering)</li>
                <li><strong>vdc-document-audit-prod:</strong> Queries audit records by documentId, returns chronologically sorted events</li>
              </ul>

              <h3 className="h3">4.2 DynamoDB Schema</h3>
              <p><strong>VDC_Documents_&lbrace;EnvironmentName&rbrace; Table:</strong></p>
              <ul>
                <li>Primary Key: pk (HASH), sk (RANGE)</li>
                <li>GSI1: gsi1pk (HASH), gsi1sk (RANGE) - for status-based queries</li>
                <li>Document metadata: pk="DOC#&lbrace;documentId&rbrace;", sk="METADATA"</li>
                <li>Electronic signatures: pk="DOC#&lbrace;documentId&rbrace;", sk="ESIG#&lbrace;timestamp&rbrace;#&lbrace;sigId&rbrace;"</li>
                <li>Fields: documentId, title, description, status, submittedAt, sha256, ownerEmail, ownerDisplayName, s3Bucket, s3Key, s3VersionId, contentType</li>
              </ul>
              <p><strong>VDC_Audit_&lbrace;EnvironmentName&rbrace; Table:</strong></p>
              <ul>
                <li>Primary Key: docId (HASH), eventKey (RANGE)</li>
                <li>Fields: eventId, timestampUtc, eventType, actorEmail, actorUsername, actorUserId, actorGroups, details (JSON), integrity (S3 location + SHA-256)</li>
                <li>Immutable: IAM policy allows only PutItem, Query, GetItem (no UpdateItem, DeleteItem)</li>
              </ul>

              <h3 className="h3">4.3 Cognito Configuration</h3>
              <ul>
                <li><strong>User Pool:</strong> Email-based authentication, password policy (12+ chars, complexity), MFA OPTIONAL (enforced per user), Advanced Security ENFORCED</li>
                <li><strong>Groups:</strong> "Submitter" group (submitter1, submitter2), "Approver" group (approver1, approver2)</li>
                <li><strong>MFA:</strong> SOFTWARE_TOKEN_MFA (TOTP 6-digit codes) enabled for all users</li>
                <li><strong>Hosted UI:</strong> OAuth 2.0 authorization code flow, scopes: openid, email, profile</li>
              </ul>
            </section>

            <section className="section">
              <h2 className="h2">5. Traceability</h2>
              <p>All requirements in this URS are traced to:</p>
              <ul>
                <li><strong>Functional Specification:</strong> Design specifications implementing each requirement</li>
                <li><strong>Test Cases:</strong> IQ/OQ/PQ test protocols validating each requirement</li>
                <li><strong>Traceability Matrix:</strong> Complete bidirectional mapping (requirement ↔ test)</li>
                <li><strong>Code Implementation:</strong> Specific file paths and line numbers referenced in each requirement</li>
              </ul>
              <p>See: <Link href="/life-sciences/docs/traceability-matrix" className="inlineLink">Requirements Traceability Matrix</Link></p>
            </section>

            <section className="section">
              <h2 className="h2">6. Approval</h2>
              <div className="approvalTable">
                <div className="approvalRow">
                  <div className="approvalRole">Quality Assurance</div>
                  <div className="approvalName">William O''Connell</div>
                  <div className="approvalDate">January 2026</div>
                </div>
                <div className="approvalRow">
                  <div className="approvalRole">System Owner</div>
                  <div className="approvalName">William O''Connell</div>
                  <div className="approvalDate">January 2026</div>
                </div>
              </div>
            </section>

            <div className="docNav">
              <Link href="/life-sciences/evidence" className="navBtn">← Back to Evidence</Link>
              <Link href="/life-sciences/docs/functional-spec" className="navBtn">Next: Functional Spec →</Link>
            </div>
          </div>
        </main>

        <style jsx>{`
          .page { min-height: 100vh; background: #0a0f1e; color: rgba(255,255,255,0.92); }
          .topHeader { background: rgba(0,0,0,0.4); border-bottom: 1px solid rgba(255,255,255,0.1); padding: 14px 0; position: sticky; top: 0; z-index: 100; }
          .headerContainer { max-width: 1100px; margin: 0 auto; padding: 0 24px; display: flex; gap: 12px; align-items: center; font-size: 0.9rem; }
          .homeLink, .backLink { color: rgba(255,255,255,0.9); text-decoration: none; }
          .homeLink:hover, .backLink:hover { color: rgba(139,92,246,0.9); }
          .sep { color: rgba(255,255,255,0.3); }
          .mainContent { padding: 60px 0 100px; }
          .container { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
          .docHeader { margin-bottom: 48px; }
          .h1 { font-size: 2.5rem; font-weight: 800; margin-bottom: 20px; color: #fff; }
          .docMeta { display: flex; gap: 24px; flex-wrap: wrap; font-size: 0.9rem; color: rgba(255,255,255,0.7); }
          .metaItem { padding: 8px 16px; background: rgba(255,255,255,0.05); border-radius: 6px; }
          .section { margin-bottom: 48px; }
          .h2 { font-size: 1.8rem; font-weight: 700; margin-bottom: 24px; color: #fff; border-bottom: 2px solid rgba(139,92,246,0.3); padding-bottom: 12px; }
          .h3 { font-size: 1.3rem; font-weight: 600; margin: 32px 0 16px; color: rgba(255,255,255,0.95); }
          p { line-height: 1.7; margin-bottom: 16px; color: rgba(255,255,255,0.85); }
          ul { margin: 16px 0; padding-left: 24px; }
          li { margin-bottom: 12px; line-height: 1.7; color: rgba(255,255,255,0.85); }
          .reqTable { margin: 24px 0; }
          .reqRow { display: grid; grid-template-columns: 140px 1fr 100px; gap: 16px; padding: 16px; background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.1); }
          .reqHeader { background: rgba(59,130,246,0.15); font-weight: 700; color: #fff; }
          .reqId { font-family: monospace; color: rgba(139,92,246,0.9); font-weight: 700; }
          .reqDesc { color: rgba(255,255,255,0.85); line-height: 1.6; }
          .reqRationale { margin-top: 8px; padding: 8px 12px; background: rgba(59,130,246,0.1); border-left: 3px solid rgba(59,130,246,0.4); font-size: 0.9rem; color: rgba(255,255,255,0.8); }
          .reqImplementation { margin-top: 8px; padding: 8px 12px; background: rgba(34,197,94,0.1); border-left: 3px solid rgba(34,197,94,0.4); font-size: 0.85rem; color: rgba(255,255,255,0.75); font-family: ui-monospace, monospace; }
          .reqImplementation code { background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 4px; }
          .reqPriority { text-align: center; font-weight: 600; color: rgba(239,68,68,0.9); }
          .inlineLink { color: rgba(139,92,246,0.9); text-decoration: underline; }
          .inlineLink:hover { color: rgba(167,139,250,0.9); }
          .approvalTable { margin: 24px 0; }
          .approvalRow { display: grid; grid-template-columns: 200px 1fr 150px; gap: 16px; padding: 12px 16px; background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.1); }
          .approvalRole { font-weight: 600; color: rgba(255,255,255,0.9); }
          .approvalName { color: rgba(255,255,255,0.85); }
          .approvalDate { color: rgba(255,255,255,0.7); }
          .docNav { display: flex; justify-content: space-between; margin-top: 64px; padding-top: 32px; border-top: 1px solid rgba(255,255,255,0.1); }
          .navBtn { padding: 12px 24px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: rgba(255,255,255,0.9); text-decoration: none; font-weight: 600; }
          .navBtn:hover { background: rgba(139,92,246,0.2); border-color: rgba(139,92,246,0.4); }
          @media (max-width: 768px) {
            .reqRow { grid-template-columns: 1fr; }
            .approvalRow { grid-template-columns: 1fr; }
            .docNav { flex-direction: column; gap: 12px; }
          }
        `}</style>
      </div>
    </>
  );
}
