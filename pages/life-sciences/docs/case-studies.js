import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function CaseStudiesPage() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    function onScroll() {
      setShowTop(window.scrollY > 500);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const companies = useMemo(
    () => [
      { id: "roche", name: "Roche" },
      { id: "genentech", name: "Genentech" },
      { id: "digital-pathology", name: "Roche + AWS (Digital Pathology)" },
      { id: "industry-risks", name: "Industry risk stories" },
    ],
    []
  );

  return (
    <>
      <Head>
        <title>Case Studies - Life Sciences Cloud Adoption | William O&apos;Connell</title>
        <meta
          name="description"
          content="Well-known Life Sciences and Big Pharma examples of cloud adoption, plus risk lessons relevant to regulated workloads."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div id="top" className="page">
        <div className="heroBg" aria-hidden="true" />

        {/* Top header */}
        <header className="topHeader">
          <div className="headerContainer">
            <Link href="/" className="homeLink">
              Home
            </Link>
            <div className="headerDivider">|</div>
            <div className="headerInfo">
              <span className="headerName">William O&apos;Connell</span>
              <span className="headerSep">|</span>
              <span>Seattle, WA</span>
              <span className="headerSep">|</span>
              <span>(206) 551-5524</span>
              <span className="headerSep">|</span>
              <a href="mailto:WilliamOConnellPMP@gmail.com" className="headerLink">
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
            {/* Hero */}
            <section className="hero">
              <p className="kicker">Life Sciences</p>
              <h1 className="h1">Big Pharma Case Studies</h1>
              <p className="subtitle">
                Curated, well-known examples of regulated cloud adoption — plus the operational risk lessons
                that matter for GxP, CSV, and 21 CFR Part 11 programs.
              </p>

              {/* Company chips / breadcrumbs */}
              <div className="chips" aria-label="Jump to company stories">
                {companies.map((c) => (
                  <a key={c.id} href={`#${c.id}`} className="chip">
                    {c.name}
                  </a>
                ))}
                <Link href="/life-sciences/evidence" className="chip secondary">
                  ← Back to Evidence
                </Link>
              </div>
            </section>

            {/* Content grid */}
            <section className="grid">
              {/* Left column: Roche / Genentech */}
              <div className="col">
                <section id="roche" className="card">
                  <div className="cardHeader">
                    <h2 className="cardTitle">Roche</h2>
                    <span className="pill">Well-known</span>
                  </div>
                  <p className="cardDesc">
                    Public examples of Roche using cloud platforms to accelerate digital health and
                    personalized healthcare programs.
                  </p>

                  <div className="bullets">
                    <a
                      className="link"
                      href="https://aws.amazon.com/solutions/case-studies/roche-video-new-case-study/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      AWS case study: Roche digital health acceleration →
                    </a>
                    <a
                      className="link"
                      href="https://aws.amazon.com/blogs/industries/roche-advances-personalized-healthcare-using-multi-modal-data-on-aws/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      AWS blog: multi-modal data + personalized healthcare →
                    </a>
                    <a
                      className="link"
                      href="https://aws.amazon.com/solutions/case-studies/roche-healthomics-case-study/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      AWS HealthOmics case study →
                    </a>
                  </div>

                  <div className="rowActions">
                    <a href="#top" className="topLink">
                      ↑ Back to top
                    </a>
                  </div>
                </section>

                <section id="genentech" className="card">
                  <div className="cardHeader">
                    <h2 className="cardTitle">Genentech (Roche Group)</h2>
                    <span className="pill">Well-known</span>
                  </div>
                  <p className="cardDesc">
                    Examples of Genentech using cloud + AI to improve insight discovery and scientific workflows
                    (useful recruiter signal for modern regulated delivery).
                  </p>

                  <div className="bullets">
                    <a
                      className="link"
                      href="https://aws.amazon.com/blogs/industries/genentech-reimagines-insights-from-unstructured-data-using-generative-artificial-intelligence/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      AWS blog: Deepsense (GenAI insights from unstructured data) →
                    </a>
                    <a
                      className="link"
                      href="https://aws.amazon.com/solutions/case-studies/genentech-generativeai-case-study/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      AWS case study: Genentech + generative AI →
                    </a>
                  </div>

                  <div className="rowActions">
                    <a href="#top" className="topLink">
                      ↑ Back to top
                    </a>
                  </div>
                </section>

                <section id="digital-pathology" className="card">
                  <div className="cardHeader">
                    <h2 className="cardTitle">Roche + AWS (Digital Pathology)</h2>
                    <span className="pill">Well-known</span>
                  </div>
                  <p className="cardDesc">
                    Roche’s digital pathology ecosystem running on AWS (strong “regulated-scale platform”
                    story). Useful for your “proof, not claims” positioning.
                  </p>

                  <div className="bullets">
                    <a
                      className="link"
                      href="https://diagnostics.roche.com/global/en/news-listing/2023/roche-collaborates-with-ibex-and-amazon-web-services-to-accelera.html"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Roche press release: Roche + Ibex + AWS →
                    </a>
                    <a
                      className="link"
                      href="https://radiologybusiness.com/topics/health-it/enterprise-imaging/roche-ibex-aws-partnership-digital-pathology-ai"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Industry coverage: digital pathology + AI on AWS →
                    </a>
                  </div>

                  <div className="rowActions">
                    <a href="#top" className="topLink">
                      ↑ Back to top
                    </a>
                  </div>
                </section>
              </div>

              {/* Right column: risk lessons */}
              <div className="col">
                <section id="industry-risks" className="card">
                  <div className="cardHeader">
                    <h2 className="cardTitle">Industry Risk Stories (Cloud can hurt)</h2>
                    <span className="pill warn">Lessons</span>
                  </div>
                  <p className="cardDesc">
                    These are widely reported incidents that matter to regulated workloads: outage resilience,
                    third-party dependency risk, and data exposure via misconfiguration.
                  </p>

                  <div className="riskBlock">
                    <h3 className="riskTitle">Outage dependency</h3>
                    <p className="riskText">
                      Major cloud outages have caused broad downstream disruption across thousands of companies —
                      a reminder to design for regional failure, implement graceful degradation, and validate DR.
                    </p>
                    <div className="bullets">
                      <a
                        className="link"
                        href="https://www.theguardian.com/technology/2025/oct/20/amazon-web-services-aws-outage-hits-dozens-websites-apps"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        AWS outage (2025) reporting →
                      </a>
                      <a
                        className="link"
                        href="https://www.mobihealthnews.com/news/google-cloud-outage-disrupts-ai-services-used-healthcare"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Google Cloud outage impacted healthcare AI services →
                      </a>
                    </div>
                  </div>

                  <div className="riskBlock">
                    <h3 className="riskTitle">Data exposure (misconfiguration)</h3>
                    <p className="riskText">
                      A common cloud failure mode is not the provider — it’s configuration drift, overly-broad
                      permissions, and public storage exposure.
                    </p>
                    <div className="bullets">
                      <a
                        className="link"
                        href="https://www.cyera.com/blog/data-security-for-pharma-companies-safeguarding-r-d-and-ip-data"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Pharma example: Pfizer exposure reported (public cloud storage) →
                      </a>
                    </div>
                  </div>

                  <div className="rowActions">
                    <a href="#top" className="topLink">
                      ↑ Back to top
                    </a>
                  </div>
                </section>

                <section className="card subtle">
                  <h2 className="cardTitle">How to use this page (recruiter-friendly)</h2>
                  <p className="cardDesc">
                    Keep it tight: 3–6 high-signal links + a short “why it matters” line under each section.
                    This shows credibility without reading like a blog.
                  </p>
                  <div className="rowActions">
                    <Link className="cta" href="/life-sciences/app">
                      Open the VDC demo →
                    </Link>
                    <a href="#top" className="topLink">
                      ↑ Back to top
                    </a>
                  </div>
                </section>
              </div>
            </section>
          </div>
        </main>

        {/* Sticky Top button */}
        <button
          type="button"
          className={`topBtn ${showTop ? "show" : ""}`}
          onClick={() => {
            try {
              window.scrollTo({ top: 0, behavior: "smooth" });
            } catch {
              window.scrollTo(0, 0);
            }
          }}
          aria-label="Back to top"
        >
          ↑ Top
        </button>

        <style jsx>{`
          .page {
            min-height: 100vh;
            position: relative;
            background: #0a0f1e;
            color: rgba(255, 255, 255, 0.92);
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
            background: rgba(0, 0, 0, 0.4);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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
            color: rgba(255, 255, 255, 0.9);
            text-decoration: none;
            font-weight: 600;
          }
          .homeLink:hover {
            color: rgba(139, 92, 246, 0.9);
          }
          .headerDivider {
            color: rgba(255, 255, 255, 0.3);
          }
          .headerInfo {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
            color: rgba(255, 255, 255, 0.75);
          }
          .headerName {
            font-weight: 600;
            color: rgba(255, 255, 255, 0.9);
          }
          .headerSep {
            color: rgba(255, 255, 255, 0.3);
          }
          .headerLink {
            color: rgba(255, 255, 255, 0.75);
            text-decoration: none;
          }
          .headerLink:hover {
            color: rgba(139, 92, 246, 0.9);
          }

          .mainContent {
            position: relative;
            z-index: 2;
            padding: 44px 0 80px;
          }
          .container {
            max-width: 1100px;
            margin: 0 auto;
            padding: 0 24px;
          }

          .hero {
            text-align: center;
            margin-bottom: 18px;
          }
          .kicker {
            margin: 0 0 8px;
            font-size: 0.85rem;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: rgba(255, 255, 255, 0.7);
          }
          .h1 {
            font-size: clamp(2.0rem, 4vw, 2.8rem);
            font-weight: 850;
            line-height: 1.1;
            margin: 0 0 12px;
            color: #fff;
            letter-spacing: -0.02em;
          }
          .subtitle {
            font-size: 1.03rem;
            line-height: 1.5;
            color: rgba(255, 255, 255, 0.75);
            max-width: 820px;
            margin: 0 auto 18px;
          }

          .chips {
            display: flex;
            gap: 10px;
            justify-content: center;
            flex-wrap: wrap;
            margin-bottom: 6px;
          }
          .chip {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 14px;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.14);
            color: rgba(255, 255, 255, 0.9);
            text-decoration: none;
            font-weight: 700;
            font-size: 0.9rem;
            transition: all 0.2s;
          }
          .chip:hover {
            background: rgba(59, 130, 246, 0.16);
            border-color: rgba(139, 92, 246, 0.35);
            transform: translateY(-1px);
          }
          .chip.secondary {
            background: rgba(255, 255, 255, 0.05);
            font-weight: 650;
          }

          .grid {
            display: grid;
            grid-template-columns: 1.25fr 0.95fr;
            gap: 16px;
            align-items: start;
            margin-top: 16px;
          }
          .col {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .card {
            background: rgba(10, 15, 30, 0.62);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 18px;
            padding: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.22);
          }
          .card.subtle {
            background: rgba(10, 15, 30, 0.5);
          }
          .cardHeader {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 10px;
          }
          .cardTitle {
            margin: 0;
            font-size: 1.05rem;
            font-weight: 800;
            color: #fff;
            letter-spacing: -0.01em;
          }
          .pill {
            font-size: 0.78rem;
            font-weight: 800;
            padding: 7px 10px;
            border-radius: 999px;
            background: rgba(59, 130, 246, 0.16);
            border: 1px solid rgba(59, 130, 246, 0.32);
            color: rgba(255, 255, 255, 0.9);
            white-space: nowrap;
          }
          .pill.warn {
            background: rgba(245, 158, 11, 0.14);
            border-color: rgba(245, 158, 11, 0.35);
          }

          .cardDesc {
            margin: 0 0 14px;
            font-size: 0.95rem;
            line-height: 1.55;
            color: rgba(255, 255, 255, 0.76);
          }

          .bullets {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          .link {
            display: inline-flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            text-decoration: none;
            color: rgba(255, 255, 255, 0.86);
            padding: 10px 12px;
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.10);
            transition: all 0.2s;
          }
          .link:hover {
            background: rgba(139, 92, 246, 0.14);
            border-color: rgba(139, 92, 246, 0.32);
            transform: translateY(-1px);
          }

          .riskBlock {
            margin-top: 14px;
            padding: 14px;
            border-radius: 14px;
            background: rgba(255, 255, 255, 0.045);
            border: 1px solid rgba(255, 255, 255, 0.10);
          }
          .riskTitle {
            margin: 0 0 8px;
            font-size: 0.92rem;
            font-weight: 900;
            color: rgba(255, 255, 255, 0.92);
          }
          .riskText {
            margin: 0 0 12px;
            font-size: 0.92rem;
            line-height: 1.55;
            color: rgba(255, 255, 255, 0.74);
          }

          .rowActions {
            margin-top: 14px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
          }
          .topLink {
            color: rgba(255, 255, 255, 0.72);
            text-decoration: none;
            font-weight: 700;
            font-size: 0.9rem;
          }
          .topLink:hover {
            color: rgba(139, 92, 246, 0.95);
          }
          .cta {
            color: rgba(255, 255, 255, 0.92);
            text-decoration: none;
            font-weight: 850;
            font-size: 0.92rem;
            padding: 10px 12px;
            border-radius: 999px;
            background: rgba(139, 92, 246, 0.20);
            border: 1px solid rgba(139, 92, 246, 0.35);
            transition: all 0.2s;
          }
          .cta:hover {
            transform: translateY(-1px);
            background: rgba(139, 92, 246, 0.28);
          }

          .topBtn {
            position: fixed;
            right: 18px;
            bottom: 18px;
            z-index: 50;
            opacity: 0;
            pointer-events: none;
            transform: translateY(6px);
            transition: all 0.2s;
            border: 1px solid rgba(255, 255, 255, 0.14);
            background: rgba(10, 15, 30, 0.75);
            color: rgba(255, 255, 255, 0.92);
            border-radius: 999px;
            padding: 10px 14px;
            font-weight: 900;
            cursor: pointer;
            backdrop-filter: blur(8px);
          }
          .topBtn.show {
            opacity: 1;
            pointer-events: auto;
            transform: translateY(0);
          }
          .topBtn:hover {
            border-color: rgba(139, 92, 246, 0.35);
            background: rgba(10, 15, 30, 0.9);
          }

          @media (max-width: 980px) {
            .grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    </>
  );
}
