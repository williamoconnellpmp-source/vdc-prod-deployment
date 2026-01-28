import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function EvidencePage() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    function onScroll() {
      try {
        setShowTop(window.scrollY > 600);
      } catch {}
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goTop = () => {
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      window.scrollTo(0, 0);
    }
  };

  return (
    <>
      <Head>
        <title>Regulated Documentation & Cloud Evidence - William O&apos;Connell</title>
        <meta
          name="description"
          content="Audit-driven validation, compliance resources, and enterprise cloud transformations."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div id="top" className="page">
        <div className="heroBg" aria-hidden="true" />

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
            <section className="hero">
              <h1 className="h1">Regulated Documentation &amp; Cloud Evidence</h1>
              <p className="subtitle">
                How I turn GxP / CSV / 21 CFR Part 11 expectations into AWS-native controls, validation artifacts, and
                inspection-ready systems.
              </p>

              <div className="credLine">
                PMP (2005) · Prosci (2017) · AWS Solutions Architect (2025) · 9 years consulting experience · 10 years
                senior delivery leadership
              </div>

              <div className="summaryStrip" aria-label="Portfolio highlights">
                <span className="summaryItem">End-to-end validation: URS → FS → RTM → IQ/OQ/PQ</span>
                <span className="summaryItem">AWS-native identity, audit trail, and data integrity patterns</span>
                <span className="summaryItem">$100M+ programs · 100K+ users · $20M+ savings</span>
              </div>

              <div className="badges">
                <span className="badge">GxP</span>
                <span className="badge">21 CFR Part 11</span>
                <span className="badge">CSV</span>
                <span className="badge">IQ / OQ / PQ</span>
              </div>
            </section>

            <section className="cardsGrid">
              {/* BOX 1 */}
              <div className="card">
                <div className="cardHeader">
                  <h2 className="cardTitle">Validated Document Control (VDC)</h2>
                  <Link href="/life-sciences/app" className="tag green tagButton">
                    Live demo →
                  </Link>
                </div>
                <p className="cardDesc">
                  Live AWS prototype that shows exactly how 21 CFR Part 11-style controls look on a serverless AWS stack
                  (workflow states, role separation, integrity controls, and auditability).
                </p>

                <div className="cardLinks">
                  <Link href="/life-sciences/docs/urs" className="cardLink">
                    URS (User Requirements) →
                  </Link>
                  <Link href="/life-sciences/docs/functional-spec" className="cardLink">
                    Functional Specification →
                  </Link>
                  <Link href="/life-sciences/docs/traceability-matrix" className="cardLink">
                    Traceability Matrix →
                  </Link>
                  <Link href="/life-sciences/docs/iq-oq-pq" className="cardLink">
                    IQ / OQ / PQ Results →
                  </Link>
                </div>
              </div>

              {/* BOX 2 */}
              <div className="card">
                <div className="cardHeader">
                  <h2 className="cardTitle">Staying Compliant with the FDA</h2>
                  <span className="tag purple">Authority</span>
                </div>
                <p className="cardDesc">
                  Practical ways to interpret regulations and map them to concrete cloud controls (audit trails,
                  identity, integrity, change control, validation strategy).
                </p>
                <div className="cardLinks">
                  <Link href="/life-sciences/docs/21-cfr-practice" className="cardLink">
                    21 CFR Part 11 in Practice →
                  </Link>
                  <Link href="/life-sciences/docs/gxp-csv-aws" className="cardLink">
                    GxP &amp; CSV in AWS →
                  </Link>
                  <Link href="/life-sciences/docs/risk-validation" className="cardLink">
                    Risk-Based Validation →
                  </Link>
                  <Link href="/life-sciences/docs/inspection-qa" className="cardLink">
                    Inspection Readiness Q&amp;A →
                  </Link>
                </div>
              </div>

              {/* BOX 3 — REPLACED PANEL */}
              <div className="card">
                <div className="cardHeader">
                  <h2 className="cardTitle">Who&apos;s Made the Move</h2>
                  <span className="tag blue">Enterprise proof</span>
                </div>
                <p className="cardDesc">
                  Well-known Life Sciences organizations adopting cloud at scale — and the outcomes and lessons that
                  shaped how I approach regulated delivery.
                </p>

                {/* Company chips */}
                <div className="chips" aria-label="Jump to company stories">
                  <a className="chip" href="#cs-roche">
                    Roche
                  </a>
                  <a className="chip" href="#cs-genentech">
                    Genentech
                  </a>
                  <a className="chip" href="#cs-moderna">
                    Moderna
                  </a>
                  <a className="chip" href="#cs-pfizer">
                    Pfizer
                  </a>
                  <a className="chip" href="#cs-novartis">
                    Novartis
                  </a>
                </div>

                {/* Company mini-cards */}
                <div className="storyList">
                  <div id="cs-roche" className="storyCard">
                    <div className="storyTop">
                      <div className="storyName">Roche</div>
                      <a className="backTop" href="#top">
                        ↑
                      </a>
                    </div>
                    <div className="storyRow">
                      <span className="k">What:</span> Cloud adoption for digital health, diagnostics, and data-driven
                      personalized healthcare.
                    </div>
                    <div className="storyRow">
                      <span className="k">Outcome:</span> Scalable compute and faster iteration across global teams and
                      datasets.
                    </div>
                    <div className="storyRow">
                      <span className="k">Lesson:</span> Data governance, traceability, and validated controls must scale
                      with the platform.
                    </div>
                  </div>

                  <div id="cs-genentech" className="storyCard">
                    <div className="storyTop">
                      <div className="storyName">Genentech (Roche Group)</div>
                      <a className="backTop" href="#top">
                        ↑
                      </a>
                    </div>
                    <div className="storyRow">
                      <span className="k">What:</span> Advanced analytics / AI initiatives to unlock insights from complex
                      scientific and clinical data.
                    </div>
                    <div className="storyRow">
                      <span className="k">Outcome:</span> Shorter insight cycles and better use of unstructured data across
                      research workflows.
                    </div>
                    <div className="storyRow">
                      <span className="k">Lesson:</span> Auditability + model/data governance becomes mandatory as complexity
                      increases.
                    </div>
                  </div>

                  <div id="cs-moderna" className="storyCard">
                    <div className="storyTop">
                      <div className="storyName">Moderna</div>
                      <a className="backTop" href="#top">
                        ↑
                      </a>
                    </div>
                    <div className="storyRow">
                      <span className="k">What:</span> Cloud-scale compute for R&amp;D and clinical/biotech workloads.
                    </div>
                    <div className="storyRow">
                      <span className="k">Outcome:</span> Faster experimentation and improved collaboration at global scale.
                    </div>
                    <div className="storyRow">
                      <span className="k">Lesson:</span> CI/CD, data pipelines, and validation evidence must be designed up
                      front to avoid rework.
                    </div>
                  </div>

                  <div id="cs-pfizer" className="storyCard">
                    <div className="storyTop">
                      <div className="storyName">Pfizer</div>
                      <a className="backTop" href="#top">
                        ↑
                      </a>
                    </div>
                    <div className="storyRow">
                      <span className="k">What:</span> Cloud use for analytics and regulated data processing at enterprise
                      scale.
                    </div>
                    <div className="storyRow">
                      <span className="k">Outcome:</span> Elastic scale and global availability for data-driven operations.
                    </div>
                    <div className="storyRow">
                      <span className="k">Lesson:</span> Security posture management and least-privilege IAM prevent the most
                      common cloud failures.
                    </div>
                  </div>

                  <div id="cs-novartis" className="storyCard">
                    <div className="storyTop">
                      <div className="storyName">Novartis</div>
                      <a className="backTop" href="#top">
                        ↑
                      </a>
                    </div>
                    <div className="storyRow">
                      <span className="k">What:</span> Hybrid/multi-cloud approaches to support global R&amp;D and operations.
                    </div>
                    <div className="storyRow">
                      <span className="k">Outcome:</span> Flexibility and improved access for distributed teams and platforms.
                    </div>
                    <div className="storyRow">
                      <span className="k">Lesson:</span> Multi-cloud increases operational complexity — governance and tooling
                      must be strong.
                    </div>
                  </div>
                </div>

                {/* Lessons Learned */}
                <div className="lessons">
                  <div className="lessonsTitle">Lessons Learned (Cloud Migrations)</div>

                  {/* Top 6 (always visible) */}
                  <ul className="lessonList">
                    <li>
                      <b>Vendor lock-in:</b> proprietary services can make exit slow/expensive.
                    </li>
                    <li>
                      <b>Cost overruns:</b> lift-and-shift without FinOps becomes permanent burn.
                    </li>
                    <li>
                      <b>IAM sprawl:</b> over-permissioning is the #1 cloud security failure mode.
                    </li>
                    <li>
                      <b>Misconfiguration exposure:</b> storage/public access mistakes happen frequently.
                    </li>
                    <li>
                      <b>Audit logging gaps:</b> if logs aren’t centralized + retained, you can’t prove control.
                    </li>
                    <li>
                      <b>Resiliency assumptions:</b> cloud isn’t HA by default — you must design for failure.
                    </li>
                  </ul>

                  {/* Expandable Top 25 */}
                  <details className="details">
                    <summary className="summary">View all Top 25 →</summary>
                    <ol className="lessonList ol">
                      <li>Vendor lock-in (services + APIs)</li>
                      <li>Data gravity</li>
                      <li>Egress fees and network cost surprises</li>
                      <li>Cost overruns from “always on” resources</li>
                      <li>Overprovisioning for peak and never right-sizing</li>
                      <li>No tagging discipline = no cost attribution</li>
                      <li>Poor multi-account strategy / weak blast-radius design</li>
                      <li>IAM sprawl / over-permissioning</li>
                      <li>Misconfigured storage exposure</li>
                      <li>Secrets management failures</li>
                      <li>Inconsistent encryption standards</li>
                      <li>Audit logging gaps / weak retention</li>
                      <li>Change control doesn’t keep pace with cloud</li>
                      <li>Environment separation gaps (DEV/TEST/PROD)</li>
                      <li>Configuration drift (console changes vs IaC)</li>
                      <li>Weak CI/CD approvals and traceability</li>
                      <li>No app rationalization (migrating what should be retired)</li>
                      <li>Underestimating data migration complexity</li>
                      <li>Legacy integration surprises (LIMS/MES/ERP)</li>
                      <li>Latency/performance regressions</li>
                      <li>Resiliency assumptions (cloud ≠ HA by default)</li>
                      <li>Incident response not updated for cloud ops</li>
                      <li>Skills gap and unclear operating model / RACI</li>
                      <li>Compliance interpretation mismatch across stakeholders</li>
                      <li>No reversibility plan / exit criteria</li>
                    </ol>
                  </details>

                  <div className="moreRow">
                    <Link href="/life-sciences/docs/case-studies" className="moreLink">
                      Big Pharma Case Studies →
                    </Link>
                    <Link href="/life-sciences/docs/aws-whitepapers" className="moreLink">
                      AWS Life Sciences Whitepapers →
                    </Link>
                  </div>
                </div>
              </div>

              {/* BOX 4 */}
              <div className="card">
                <div className="cardHeader">
                  <h2 className="cardTitle">Delivery Experience</h2>
                  <span className="tag pink">Scale</span>
                </div>
                <p className="cardDesc">
                  Enterprise regulated delivery outcomes — governance, vendors, validation alignment — translated into
                  hands-on AWS demos and evidence.
                </p>

                <div className="metricsGrid">
                  <div className="metric">
                    <div className="metricBig">$100M+</div>
                    <div className="metricSmall">Programs</div>
                  </div>
                  <div className="metric">
                    <div className="metricBig">100K+</div>
                    <div className="metricSmall">Users</div>
                  </div>
                  <div className="metric">
                    <div className="metricBig">$20M+</div>
                    <div className="metricSmall">Savings</div>
                  </div>
                  <div className="metric">
                    <div className="metricBig">100+</div>
                    <div className="metricSmall">Contrib.</div>
                  </div>
                </div>

                {/* Links removed per request */}
              </div>
            </section>
          </div>
        </main>

        {/* Sticky “Top” button */}
        <button
          type="button"
          className={`topBtn ${showTop ? "show" : ""}`}
          onClick={goTop}
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
            padding: 46px 0 80px;
          }
          .container {
            max-width: 1100px;
            margin: 0 auto;
            padding: 0 24px;
          }

          .hero {
            text-align: center;
            margin-bottom: 28px;
          }
          .h1 {
            font-size: clamp(1.95rem, 3.5vw, 2.7rem);
            font-weight: 850;
            line-height: 1.12;
            margin: 0 0 14px;
            color: #fff;
            letter-spacing: -0.02em;
          }
          .subtitle {
            font-size: 1.03rem;
            line-height: 1.55;
            color: rgba(255, 255, 255, 0.75);
            max-width: 860px;
            margin: 0 auto 8px;
          }
          .credLine {
            margin: 0 auto 10px;
            max-width: 980px;
            font-size: 0.86rem;
            font-weight: 750;
            color: rgba(255, 255, 255, 0.72);
            letter-spacing: 0.01em;
          }

          .summaryStrip {
            margin: 0 auto 14px;
            max-width: 980px;
            font-size: 0.84rem;
            color: rgba(255, 255, 255, 0.8);
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }

          .summaryItem {
            padding: 4px 9px;
            border-radius: 999px;
            border: 1px solid rgba(255, 255, 255, 0.16);
            background: rgba(6, 20, 40, 0.85);
          }

          .badges {
            display: flex;
            justify-content: center;
            gap: 10px;
            flex-wrap: wrap;
          }
          .badge {
            padding: 10px 16px;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 999px;
            font-size: 0.86rem;
            font-weight: 700;
            color: rgba(255, 255, 255, 0.9);
          }

          /* GRID */
          .cardsGrid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 14px;
            align-items: stretch;
          }

          .card {
            background: rgba(10, 15, 30, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 20px;
            padding: 18px;
            box-shadow: 0 18px 38px rgba(0, 0, 0, 0.24);
          }

          .cardHeader {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            margin-bottom: 10px;
          }
          .cardTitle {
            font-size: 1.02rem;
            font-weight: 850;
            margin: 0;
            color: #fff;
            letter-spacing: -0.01em;
          }
          .tag {
            font-size: 0.76rem;
            font-weight: 850;
            padding: 7px 10px;
            border-radius: 999px;
            border: 1px solid rgba(255, 255, 255, 0.14);
            background: rgba(255, 255, 255, 0.06);
            color: rgba(255, 255, 255, 0.92);
            white-space: nowrap;
          }
          .tag.green {
            border-color: rgba(34, 197, 94, 0.35);
            background: rgba(34, 197, 94, 0.12);
          }
          .tag.tagButton {
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            cursor: pointer;
          }
          .tag.purple {
            border-color: rgba(139, 92, 246, 0.35);
            background: rgba(139, 92, 246, 0.12);
          }
          .tag.blue {
            border-color: rgba(59, 130, 246, 0.35);
            background: rgba(59, 130, 246, 0.12);
          }
          .tag.pink {
            border-color: rgba(236, 72, 153, 0.35);
            background: rgba(236, 72, 153, 0.12);
          }

          .cardDesc {
            font-size: 0.92rem;
            line-height: 1.5;
            color: rgba(255, 255, 255, 0.74);
            margin: 0 0 12px;
          }

          .primaryCtaRow {
            margin: 10px 0 12px;
          }
          .primaryCta {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 10px 14px;
            border-radius: 999px;
            background: rgba(139, 92, 246, 0.24);
            border: 1px solid rgba(139, 92, 246, 0.38);
            color: rgba(255, 255, 255, 0.94);
            text-decoration: none;
            font-weight: 900;
          }
          .primaryCta:hover {
            background: rgba(139, 92, 246, 0.32);
            transform: translateY(-1px);
          }

          .cardLinks {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-top: 10px;
          }
          .cardLink {
            color: rgba(255, 255, 255, 0.86);
            text-decoration: none;
            font-size: 0.88rem;
            padding: 9px 10px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            transition: all 0.2s;
          }
          .cardLink:hover {
            background: rgba(59, 130, 246, 0.14);
            border-color: rgba(139, 92, 246, 0.32);
            transform: translateY(-1px);
          }

          .note {
            margin-top: 12px;
            padding: 10px 12px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.045);
            border: 1px dashed rgba(255, 255, 255, 0.18);
            color: rgba(255, 255, 255, 0.78);
            font-size: 0.88rem;
            line-height: 1.4;
          }

          /* Box 3: companies */
          .chips {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin: 10px 0 12px;
          }
          .chip {
            display: inline-flex;
            align-items: center;
            padding: 8px 10px;
            border-radius: 999px;
            font-weight: 850;
            font-size: 0.82rem;
            text-decoration: none;
            color: rgba(255, 255, 255, 0.9);
            background: rgba(255, 255, 255, 0.07);
            border: 1px solid rgba(255, 255, 255, 0.12);
          }
          .chip:hover {
            background: rgba(59, 130, 246, 0.14);
            border-color: rgba(139, 92, 246, 0.3);
          }

          .storyList {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          .storyCard {
            padding: 10px 12px;
            border-radius: 14px;
            background: rgba(255, 255, 255, 0.045);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          .storyTop {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            margin-bottom: 6px;
          }
          .storyName {
            font-weight: 950;
            color: rgba(255, 255, 255, 0.94);
            font-size: 0.92rem;
          }
          .backTop {
            text-decoration: none;
            color: rgba(255, 255, 255, 0.65);
            font-weight: 900;
          }
          .backTop:hover {
            color: rgba(139, 92, 246, 0.95);
          }
          .storyRow {
            font-size: 0.86rem;
            line-height: 1.45;
            color: rgba(255, 255, 255, 0.76);
            margin-top: 6px;
          }
          .k {
            font-weight: 900;
            color: rgba(255, 255, 255, 0.92);
            margin-right: 6px;
          }

          /* Lessons */
          .lessons {
            margin-top: 12px;
            padding-top: 10px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
          }
          .lessonsTitle {
            font-weight: 950;
            color: rgba(255, 255, 255, 0.92);
            margin: 0 0 8px;
            font-size: 0.95rem;
          }
          .lessonList {
            margin: 0;
            padding-left: 18px;
            color: rgba(255, 255, 255, 0.78);
            font-size: 0.86rem;
            line-height: 1.5;
          }
          .lessonList li {
            margin: 6px 0;
          }
          .lessonList.ol {
            padding-left: 22px;
          }
          .details {
            margin-top: 10px;
            padding: 10px 10px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.035);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          .summary {
            cursor: pointer;
            font-weight: 900;
            color: rgba(255, 255, 255, 0.88);
            font-size: 0.88rem;
          }
          .summary:hover {
            color: rgba(139, 92, 246, 0.95);
          }

          .moreRow {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            margin-top: 10px;
          }
          .moreLink {
            text-decoration: none;
            font-weight: 850;
            font-size: 0.86rem;
            padding: 8px 10px;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.06);
            border: 1px solid rgba(255, 255, 255, 0.12);
            color: rgba(255, 255, 255, 0.88);
          }
          .moreLink:hover {
            background: rgba(59, 130, 246, 0.14);
            border-color: rgba(139, 92, 246, 0.3);
          }

          /* Metrics */
          .metricsGrid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin: 12px 0;
          }
          .metric {
            padding: 12px 10px;
            border-radius: 14px;
            background: rgba(255, 255, 255, 0.045);
            border: 1px solid rgba(255, 255, 255, 0.1);
            text-align: center;
          }
          .metricBig {
            font-size: 1.05rem;
            font-weight: 950;
            color: rgba(255, 255, 255, 0.94);
          }
          .metricSmall {
            margin-top: 2px;
            font-size: 0.82rem;
            font-weight: 800;
            color: rgba(255, 255, 255, 0.75);
          }

          /* Sticky Top button */
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
            background: rgba(10, 15, 30, 0.78);
            color: rgba(255, 255, 255, 0.92);
            border-radius: 999px;
            padding: 10px 14px;
            font-weight: 950;
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
            background: rgba(10, 15, 30, 0.92);
          }

          @media (max-width: 1200px) {
            .cardsGrid {
              grid-template-columns: repeat(2, 1fr);
            }
          }
          @media (max-width: 968px) {
            .cardsGrid {
              grid-template-columns: 1fr;
            }
            .headerInfo {
              font-size: 0.8rem;
            }
          }
        `}</style>
      </div>
    </>
  );
}
