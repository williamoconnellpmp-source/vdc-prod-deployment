import Head from "next/head";
import Link from "next/link";

// Point to the production login page with MFA support (Cognito)
const VDC_LOGIN_URL = "/life-sciences/app/login?returnTo=%2Flife-sciences%2Fapp";

export default function VDCDemoPage() {
  return (
    <>
      <Head>
        <title>VDC Demo - Validated Document Control</title>
        <meta name="description" content="Validated Document Control demo on AWS" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="page">
        <div className="heroBg" aria-hidden="true" />

        {/* Evidence-style top header */}
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
              <a
                href="mailto:WilliamOConnellPMP@gmail.com"
                className="headerLink"
              >
                WilliamOConnellPMP@gmail.com
              </a>
              <span className="headerSep">|</span>
              <a
                href="https://www.linkedin.com/in/williamoconnell/"
                target="_blank"
                rel="noopener noreferrer"
                className="headerLink"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </header>

        <main className="mainContent">
          <div className="container">
            <section className="hero">
              <h1 className="h1">Validated Document Control (VDC) Demo</h1>

              <p className="subtitle">
                A live, serverless AWS implementation of a GxP-capable Validated Document Control system, including full FDA-ready documentation (URS, FS, RTM, IQ/OQ/PQ) and a production-grade identity and audit architecture.
              </p>

              {/* Purpose + GxP context */}
              <div className="contextBox">
                <p className="whiteText">
                  <strong>Purpose:</strong> In regulated Life Sciences environments, teams must be able to demonstrate who performed an action, when it occurred, under which role, and what controls enforced it. This VDC system shows how to implement those requirements on AWS using native, serverless services.
                </p>

                <p className="whiteText">
                  <strong>What this demo proves:</strong>
                </p>
                <ul className="bulletList">
                  <li>Controlled document submission and approval workflows (Submitter → Approver)</li>
                  <li>Role-based access control enforced by Amazon Cognito groups and API Gateway JWT authorizer</li>
                  <li>Immutable audit trail for all critical actions (SUBMIT, APPROVE, REJECT, DOWNLOAD)</li>
                  <li>Data integrity controls: SHA‑256 hashing, S3 versioning, DynamoDB + S3 WORM audit storage</li>
                  <li>ALCOA+ implementation: Attributable, Legible, Contemporaneous, Original, Accurate, Complete, Consistent, Enduring, Available</li>
                  <li>21 CFR Part 11 patterns for electronic records and signatures (MFA, JWT-backed identity, structured audit records)</li>
                </ul>

                <p className="whiteText">
                  <strong>How it is GxP-capable:</strong> The application is backed by a full validation set:
                  URS (User Requirements), FS (Functional Specification), RTM (Traceability Matrix), and IQ/OQ/PQ validation
                  results. Every requirement is traced to implementation (AWS resources + code) and to executed test cases.
                </p>

                <p className="whiteText">
                  <strong>Authentication model:</strong> This environment uses Amazon Cognito with TOTP MFA for all users.
                  Submitters and Approvers authenticate via the Cognito Hosted UI; JWT tokens (ID + Access) drive role detection and
                  authorization. The legacy non‑GxP demo login has been replaced by this production‑style identity flow.
                </p>
              </div>

              {/* CTA */}
              <section className="ctaSectionTop">
                <div className="ctaTopLeft">
                  <h2 className="ctaTitle">Run the end‑to‑end workflow</h2>
                  <p className="ctaText">
                    Sign in with a Submitter account to upload and submit a document, then sign in as an Approver to review, approve
                    or reject, and inspect the immutable audit trail.
                  </p>
                </div>

                <a href={VDC_LOGIN_URL} className="ctaButton">
                  Go to the Demo →
                </a>
              </section>

              {/* Validation docs */}
              <div className="docsBox">
                <h3 className="docsTitle">Validation &amp; Evidence</h3>
                <p className="docsDesc">
                  The VDC system includes full FDA-ready documentation showing how requirements map to architecture, code, and tests:
                </p>
                <div className="docsLinks">
                  <Link href="/life-sciences/docs/urs" className="docLink">
                    User Requirements Specification (URS)
                  </Link>
                  <Link href="/life-sciences/docs/functional-spec" className="docLink">
                    Functional Specification (FS)
                  </Link>
                  <Link href="/life-sciences/docs/traceability-matrix" className="docLink">
                    Requirements Traceability Matrix (RTM)
                  </Link>
                  <Link href="/life-sciences/docs/iq-oq-pq" className="docLink">
                    IQ/OQ/PQ Validation Results
                  </Link>
                </div>
              </div>

              {/* AWS Architecture Section */}
              <div className="awsBox">
                <h3 className="awsTitle">AWS Serverless Architecture</h3>
                <p className="awsDesc">
                  The production VDC system is built entirely on AWS serverless services, demonstrating how to meet GxP and 21 CFR Part 11 expectations using native cloud components:
                </p>
                <div className="awsGrid">
                  <div className="awsService">
                    <div className="awsServiceName">Amazon Cognito</div>
                    <div className="awsServiceDesc">
                      User authentication with TOTP MFA, password policy, Advanced Security Mode, and role separation via Cognito groups
                      (Submitter / Approver).
                    </div>
                  </div>
                  <div className="awsService">
                    <div className="awsServiceName">Amazon API Gateway (HTTP API)</div>
                    <div className="awsServiceDesc">
                      JWT authorizer validates Cognito tokens on every call, enforcing TLS 1.2+ and CORS. All business logic flows through this controlled API surface.
                    </div>
                  </div>
                  <div className="awsService">
                    <div className="awsServiceName">AWS Lambda (Python)</div>
                    <div className="awsServiceDesc">
                      Eight Lambda functions implement upload-init, submit, approvals-pending, approve, reject, download, documents-list,
                      and document-audit behavior with least‑privilege IAM policies.
                    </div>
                  </div>
                  <div className="awsService">
                    <div className="awsServiceName">Amazon DynamoDB</div>
                    <div className="awsServiceDesc">
                      Documents table stores metadata and workflow state; Audit table stores immutable audit records and electronic signature
                      events with point‑in‑time recovery enabled.
                    </div>
                  </div>
                  <div className="awsService">
                    <div className="awsServiceName">Amazon S3</div>
                    <div className="awsServiceDesc">
                      Documents bucket with AES‑256 SSE, versioning, and strict public access block; WORM audit bucket with Object Lock
                      in COMPLIANCE mode for long‑term, write‑once audit storage.
                    </div>
                  </div>
                  <div className="awsService">
                    <div className="awsServiceName">AWS IAM</div>
                    <div className="awsServiceDesc">
                      Fine‑grained, least‑privilege policies for each Lambda. Audit table explicitly denies UpdateItem/DeleteItem to
                      enforce immutability.
                    </div>
                  </div>
                  <div className="awsService">
                    <div className="awsServiceName">AWS CloudFormation</div>
                    <div className="awsServiceDesc">
                      Infrastructure as Code templates define Cognito, API Gateway, Lambdas, DynamoDB, S3, IAM, and CloudWatch resources
                      for reproducible, validated deployments.
                    </div>
                  </div>
                  <div className="awsService">
                    <div className="awsServiceName">Amazon CloudFront</div>
                    <div className="awsServiceDesc">
                      CDN fronting the static Next.js frontend, enforcing TLS and providing global, low‑latency delivery.
                    </div>
                  </div>
                  <div className="awsService">
                    <div className="awsServiceName">Amazon CloudWatch</div>
                    <div className="awsServiceDesc">
                      Centralized logs, metrics, and alarms for Lambda functions and API Gateway, supporting ongoing monitoring and inspection readiness.
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <footer className="footer">
              <Link href="/" className="footerLink">← Back to home</Link>
            </footer>
          </div>
        </main>

        <style jsx>{`
          .page {
            min-height: 100vh;
            position: relative;
            background: #0a0f1e;
            color: #ffffff;
          }

          .heroBg {
            position: absolute;
            inset: 0;
            background-image: linear-gradient(
                180deg,
                rgba(5, 12, 22, 0.96) 0%,
                rgba(5, 12, 22, 0.88) 30%,
                rgba(5, 12, 22, 0.7) 55%,
                rgba(5, 12, 22, 0.45) 75%,
                rgba(5, 12, 22, 0.3) 100%
              ),
              url("/images/heroes/landing-gxp.png");
            background-size: cover;
            background-position: 70% center;
          }

          .topHeader {
            position: relative;
            z-index: 3;
            background: rgba(0,0,0,0.4);
            border-bottom: 1px solid rgba(255,255,255,0.1);
            padding: 14px 0;
          }

          .headerContainer {
            max-width: 1100px;
            margin: 0 auto;
            padding: 0 24px;
            display: flex;
            align-items: center;
            gap: 16px;
            font-size: 0.87rem;
          }

          .homeLink {
            color: #ffffff;
            text-decoration: none;
            font-weight: 600;
          }

          .homeLink:hover {
            color: rgba(139,92,246,0.95);
          }

          .headerDivider {
            color: rgba(255,255,255,0.35);
          }

          .headerInfo {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
            color: #ffffff;
          }

          .headerName {
            font-weight: 700;
            color: #ffffff;
          }

          .headerSep {
            color: rgba(255,255,255,0.35);
          }

          .headerLink {
            color: #ffffff;
            text-decoration: underline;
          }

          .headerLink:hover {
            color: rgba(139,92,246,0.95);
          }

          .mainContent {
            position: relative;
            z-index: 2;
            padding: 34px 0 70px;
          }

          .container {
            max-width: 1100px;
            margin: 0 auto;
            padding: 0 24px;
          }

          .h1 {
            font-size: clamp(2.0rem, 3.8vw, 3.0rem);
            font-weight: 800;
            margin-bottom: 12px;
            color: #ffffff;
            letter-spacing: -0.02em;
          }

          .subtitle {
            font-size: 1.05rem;
            line-height: 1.6;
            margin-bottom: 18px;
            color: #ffffff;
          }

          .whiteText {
            color: #ffffff !important;
            opacity: 1 !important;
          }

          .contextBox {
            background: rgba(10,15,30,0.72);
            border: 1px solid rgba(255,255,255,0.18);
            border-radius: 18px;
            padding: 22px;
            margin-bottom: 16px;
          }

          .contextBox p {
            margin: 0 0 14px;
            line-height: 1.7;
            color: #ffffff;
          }

          .ctaSectionTop {
            background: rgba(10,15,30,0.72);
            border: 1px solid rgba(255,255,255,0.18);
            border-radius: 18px;
            padding: 18px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 18px;
            margin-bottom: 12px;
          }

          .ctaTitle {
            font-size: 1.05rem;
            font-weight: 800;
            margin: 0 0 6px;
            color: #ffffff;
          }

          .ctaText {
            margin: 0;
            color: #ffffff;
            line-height: 1.5;
          }

          .ctaButton {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 8px 16px;
            border-radius: 999px;
            background: rgb(99,102,241);
            color: #ffffff;
            font-weight: 700;
            text-decoration: none;
            white-space: nowrap;
          }

          .ctaButton:hover {
            background: rgb(79,70,229);
          }

          .updateBox {
            background: rgba(10,15,30,0.72);
            border: 1px solid rgba(255,255,255,0.18);
            border-radius: 18px;
            padding: 16px 18px;
            margin-bottom: 14px;
          }

          .techStack {
            margin-top: 8px;
            font-size: 0.92rem;
            color: #ffffff;
            opacity: 1;
            font-style: italic;
          }

          .footer {
            margin-top: 30px;
            padding-top: 18px;
            border-top: 1px solid rgba(255,255,255,0.16);
          }

          .footerLink {
            color: #ffffff;
            text-decoration: underline;
          }

          @media (max-width: 768px) {
            .ctaSectionTop {
              flex-direction: column;
              align-items: flex-start;
            }
            .ctaButton {
              width: 100%;
            }
          }
        `}</style>
      </div>
    </>
  );
}
