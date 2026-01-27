import Head from "next/head";
import Link from "next/link";

export default function VdcNonGxpEvidencePage() {
  const meta = {
    title: "VDC Demonstration – Non-GxP Verification & Test Evidence",
    docId: "VDC-EVID-001",
    version: "1.0",
    date: "2025-01-08",
    status: "Approved",
  };

  return (
    <>
      <Head>
        <title>{meta.title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="page">
        <div className="heroBg" aria-hidden="true" />

        <header className="topHeader">
          <div className="headerContainer">
            <Link href="/" className="homeLink">Home</Link>
            <div className="headerDivider">|</div>
            <Link href="/life-sciences/docs/evidence" className="backLink">
              ← Back to Evidence
            </Link>
          </div>
        </header>

        <main className="content">
          <h1 className="pageTitle">{meta.title}</h1>

          <div className="chipsRow" role="group" aria-label="Document metadata">
            <div className="chip"><span className="chipLabel">Document ID:</span><span className="chipValue">{meta.docId}</span></div>
            <div className="chip"><span className="chipLabel">Version:</span><span className="chipValue">{meta.version}</span></div>
            <div className="chip"><span className="chipLabel">Date:</span><span className="chipValue">{meta.date}</span></div>
            <div className="chip"><span className="chipLabel">Status:</span><span className="chipValue">{meta.status}</span></div>
          </div>

          <section className="section">
            <h2 className="sectionTitle">Important Demonstration Disclaimer</h2>
            <div className="callout">
              <p className="p"><strong>Non-GxP demonstration instance</strong> for illustrative and educational purposes only.</p>
              <p className="p">Not a validated production system. Must not be used for regulated decisions or GxP records.</p>
              <p className="p">Formal IQ/OQ/PQ applies only to customer production implementations.</p>
            </div>
          </section>

          <section className="section">
            <h2 className="sectionTitle">Purpose</h2>
            <p className="p">Summarizes verification activities confirming workflow behavior, role separation, audit integrity, and evidence capture.</p>
            <p className="p">Testing mirrors IQ/OQ/PQ methodology for demonstration purposes.</p>
          </section>

          <section className="section">
            <h2 className="sectionTitle">Summary of Verification Activities</h2>

            <h3 className="subTitle">Installation Qualification (IQ)</h3>
            <ul className="list">
              <li>AWS-native services used (API Gateway, Lambda, DynamoDB, S3)</li>
              <li>Infrastructure-as-code configuration</li>
              <li>Controlled document storage demonstrated</li>
            </ul>

            <h3 className="subTitle">Operational Qualification (OQ)</h3>
            <ul className="list">
              <li>Role-based access enforced</li>
              <li>Workflow transitions verified</li>
              <li>Mandatory rejection reason</li>
              <li>UTC timestamps</li>
              <li>SHA-256 integrity hashes</li>
              <li>Immutable audit trail at datastore level</li>
            </ul>

            <h3 className="subTitle">Performance Qualification (PQ)</h3>
            <ul className="list">
              <li>End-to-end persona testing</li>
              <li>Evidence capture validated</li>
            </ul>
          </section>

          <section className="section">
            <h2 className="sectionTitle">References</h2>
            <ul className="list">
              <li><a className="link" href="/life-sciences/docs/iq-oq-pq">IQ/OQ/PQ Results Page</a></li>
              <li><a className="link" href="/life-sciences/docs/vdc-validation">Validation PDFs</a></li>
            </ul>

            <div className="footerNote">
              Formal regulatory compliance claims are not made.
            </div>
          </section>
        </main>

        <footer className="pageFooter">
          <div className="footerInner">
            <span className="muted">VDC Demonstration • Non-GxP • Evidence Page</span>
          </div>
        </footer>
      </div>

      <style jsx>{`
        .page { min-height:100vh; background:#070b14; color:#e9eefc; position:relative; }
        .heroBg { position:absolute; inset:0; background:
          radial-gradient(900px 400px at 20% 10%, rgba(92,124,250,0.20), transparent 60%),
          radial-gradient(700px 380px at 80% 0%, rgba(16,185,129,0.14), transparent 60%),
          radial-gradient(800px 520px at 60% 80%, rgba(168,85,247,0.10), transparent 60%);
        }
        .topHeader { position:sticky; top:0; background:rgba(7,11,20,.85); border-bottom:1px solid rgba(255,255,255,.08); }
        .headerContainer { max-width:1100px; margin:auto; padding:14px 18px; display:flex; gap:12px; }
        .homeLink,.backLink { color:#dbe7ff; font-weight:600; text-decoration:none; }
        .headerDivider { color:rgba(255,255,255,.4); }

        .content { max-width:1100px; margin:auto; padding:36px 18px 56px; position:relative; z-index:2; }

        .pageTitle { font-size:48px; color:#f5f8ff; margin:18px 0; }

        .chipsRow { display:flex; gap:12px; flex-wrap:wrap; margin-bottom:28px; }
        .chip { background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.08); padding:10px 12px; border-radius:10px; }
        .chipLabel { color:#b9c6e6; font-weight:600; }
        .chipValue { color:#fff; font-weight:700; }

        .section { border-top:1px solid rgba(255,255,255,.1); padding:22px 0; }
        .sectionTitle { color:#f0f4ff; font-size:26px; margin-bottom:14px; }
        .subTitle { color:#e6ecff; font-size:18px; margin-top:18px; }

        .p { color:#e9eefc; line-height:1.6; max-width:920px; }

        .list { color:#e9eefc; margin-left:18px; line-height:1.6; }

        .callout { background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1); padding:16px; border-radius:14px; }

        .link { color:#9fc2ff; }

        .footerNote { margin-top:14px; background:rgba(255,255,255,.04); padding:12px; border-radius:12px; }

        .pageFooter { border-top:1px solid rgba(255,255,255,.08); padding:18px; }
        .footerInner { max-width:1100px; margin:auto; color:rgba(233,238,252,.6); }

        @media (max-width:720px){ .pageTitle{font-size:34px;} }
      `}</style>
    </>
  );
}
