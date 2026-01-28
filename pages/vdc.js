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
              <p className="subtitle awsCallout">
                Built entirely on Amazon Cognito, Amazon API Gateway, AWS Lambda, Amazon DynamoDB, Amazon S3 (with Object Lock for WORM audit storage), AWS IAM, AWS CloudFormation, Amazon CloudFront, and Amazon CloudWatch.
              </p>

              {/* Purpose + GxP context */}
              <div className="contextBox">
                <p className="whiteText">
                  <strong>Purpose:</strong> In regulated Life Sciences environments, teams must be able to demonstrate who performed an action, when it occurred, under which role, and what controls enforced it. This VDC system shows how to implement those requirements on AWS using native, serverless services.
                </p>

                <p className="whiteText">
                  <strong>What this demo proves:</strong> On‑premise GxP document control is no longer the only option. A
                  modern AWS serverless stack can deliver the same GxP‑grade controls (workflow, identity, audit trail,
                  data integrity, ALCOA+, 21 CFR Part 11 patterns) at a fraction of the cost and operational overhead of
                  traditional infrastructure.
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

          .awsCallout {
            margin-top: -6px;
            font-size: 0.98rem;
            color: rgba(219, 234, 254, 0.96);
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
