// pages/life-sciences/app/index.js

import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  getCurrentUser,
  requireAuthOrRedirect,
  logout,
} from "@/lib/life_sciences_app_lib/auth";

function normalizeRole(role) {
  return String(role || "").trim().toLowerCase();
}

function roleIsApprover(role) {
  const r = normalizeRole(role);
  return r === "approver";
}

export default function VdcOverviewPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);

  // nav message (used for submitter clicking Pending Approvals)
  const [navMsg, setNavMsg] = useState(null);

  useEffect(() => {
    const ok = requireAuthOrRedirect(router, "/life-sciences/app");
    if (!ok) return;

    setMounted(true);

    try {
      const u = getCurrentUser();
      setUser(u || null);
    } catch {
      setUser(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayName = user?.displayName || "Demo User";
  const role = user?.role || "—";
  const isApprover = roleIsApprover(role);

  function onLogout() {
    logout(router);
  }

  function onClickPendingApprovals(e) {
    if (isApprover) return;
    e.preventDefault();
    setNavMsg("Only Approvers can view Pending Approval documents");
    setTimeout(() => setNavMsg(null), 2600);
  }

  const auditTrailExampleText = useMemo(() => {
    // Keep this SHORT. The goal is to show the audit trail pattern without forcing scroll.
    // Also: never call it a "receipt".
    return [
      "AUDIT TRAIL EXAMPLE (UTC)",
      "----------------------------------------",
      "Document Title: SOP-014 — Deviation Management",
      "Document ID: 6d16aabf-a8c0-44c4-9251-bf7cd926cf9b",
      "Current Status: APPROVED",
      "",
      "EVENTS (UTC)",
      "2026-01-17T22:33:35.412663Z | Submitted for Review | Actor: Avery Chen",
      "2026-01-17T22:34:10.120004Z | Review Opened        | Actor: Morgan Patel",
      "2026-01-17T22:35:00.557385Z | Approved             | Actor: Morgan Patel",
      "",
      "Note: For the real record, use Documents → Audit Trail.",
    ].join("\n");
  }, []);

  return (
    <>
      <Head>
        <title>VDC Demo — Overview</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="page">
        <div className="heroBg" aria-hidden="true" />

        {/* Top header (standard) */}
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
              <span>WilliamOConnellPMP@gmail.com</span>
              <span className="headerSep">|</span>
              <span>LinkedIn</span>
            </div>
          </div>
        </header>

        {/* App nav + user strip (standard) */}
        <div className="navWrap">
          <nav className="appNav" aria-label="VDC demo navigation">
            <div className="navLeft">
              <Link href="/life-sciences/app" className="navLink active">
                Overview
              </Link>
              <Link href="/life-sciences/app/upload" className="navLink">
                Upload
              </Link>
              <Link href="/life-sciences/app/submissions" className="navLink">
                Submissions
              </Link>
              <Link href="/life-sciences/app/documents" className="navLink">
                Documents
              </Link>

              {/* Always visible. Submitters get the message instead of navigating. */}
              <Link
                href="/life-sciences/app/approval/approvals"
                className={`navLink ${isApprover ? "" : "disabledNav"}`}
                aria-disabled={!isApprover}
                onClick={onClickPendingApprovals}
              >
                Pending Approvals
              </Link>
            </div>

            <div className="navRight">
              <div className="userName">{mounted ? displayName : "Loading…"}</div>
              <div className="rolePill">{mounted ? role : "—"}</div>
              <button className="logoutBtn" onClick={onLogout} type="button">
                Logout
              </button>
            </div>
          </nav>

          {navMsg ? <div className="navMsg">{navMsg}</div> : null}
        </div>

        <main className="content">
          {/* Keep the page tight */}
          <h1 className="h1">Overview</h1>

          <section className="grid2">
            {/* Left */}
            <div className="card">
              <div className="cardTitle">How to run this demo:</div>

              <ol className="steps">
                <li>As a Submitter, start with Upload.</li>
                <li>Your document appears in Submissions with its status.</li>
                <li>
                  An Approver reviews in Pending Approvals and approves/rejects
                  (reject requires a reason).
                </li>
                <li>
                  Use Documents to find a record and review the audit trail.
                </li>
              </ol>

              <div className="ctaBlock">
                <div className="ctaTitle">Upload a Document</div>
                <Link className="primaryBtn" href="/life-sciences/app/upload">
                  Upload
                </Link>
                <div className="ctaHint">
                  Signed in as <span className="pill">{displayName}</span>{" "}
                  <span className="pill">{role}</span>
                </div>
              </div>

              <div className="ruleBox">
                <div className="ruleTitle">Access rule (demo)</div>
                <div className="ruleText">
                  Submitters can view documents they own. Approvers can review
                  and approve/reject submitted documents. All timestamps are
                  recorded and displayed as UTC.
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="card">
              <div className="cardTitle">Audit Trail Example</div>
              <div className="lead">
                This shows what an audit trail looks like (who did what, when).
                For the real record, use Documents → Audit Trail.
              </div>

              <pre className="audit" aria-label="Audit trail example output">
{auditTrailExampleText}
              </pre>

              <div className="rightLinks">
                <Link className="miniLink" href="/life-sciences/app/documents">
                  Go to Documents
                </Link>
              </div>
            </div>
          </section>
        </main>

        <style jsx>{`
          .page {
            min-height: 100vh;
            position: relative;
            background: radial-gradient(
                1100px 520px at 40% 18%,
                rgba(31, 83, 167, 0.22),
                rgba(0, 0, 0, 0)
              ),
              linear-gradient(180deg, #050b14 0%, #071427 55%, #061326 100%);
            color: #fff;
          }

          .heroBg {
            position: absolute;
            inset: 0;
            pointer-events: none;
          }

          /* Top header */
          .topHeader {
            position: sticky;
            top: 0;
            z-index: 50;
            background: rgba(0, 0, 0, 0.35);
            backdrop-filter: blur(8px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }

          .headerContainer {
            max-width: 1180px;
            margin: 0 auto;
            padding: 10px 18px;
            display: flex;
            align-items: center;
            gap: 14px;
          }

          .homeLink {
            text-decoration: none;
            font-weight: 800;
            color: #fff;
            opacity: 0.95;
          }

          .headerDivider {
            opacity: 0.35;
          }

          .headerInfo {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            align-items: center;
            font-size: 14px;
            opacity: 0.95;
          }

          .headerName {
            font-weight: 900;
          }

          .headerSep {
            opacity: 0.35;
          }

          /* App nav */
          .navWrap {
            max-width: 1180px;
            margin: 14px auto 0 auto;
            padding: 0 18px;
          }

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

          .navLeft {
            display: flex;
            align-items: center;
            gap: 18px;
            flex-wrap: wrap;
          }

          .navLink {
            text-decoration: none;
            font-weight: 800;
            color: #fff;
            opacity: 0.92;
          }

          .navLink.active {
            text-decoration: underline;
            text-underline-offset: 6px;
          }

          .disabledNav {
            opacity: 0.65;
            cursor: not-allowed;
          }

          .navRight {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
            justify-content: flex-end;
          }

          .userName {
            font-weight: 900;
            opacity: 0.95;
          }

          .rolePill {
            padding: 6px 10px;
            border-radius: 999px;
            border: 1px solid rgba(120, 170, 255, 0.35);
            background: rgba(30, 60, 140, 0.35);
            font-weight: 900;
            white-space: nowrap;
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

          .logoutBtn:hover {
            background: rgba(255, 255, 255, 0.1);
          }

          .navMsg {
            margin-top: 10px;
            padding: 10px 12px;
            border-radius: 14px;
            border: 1px solid rgba(99, 132, 255, 0.35);
            background: rgba(99, 132, 255, 0.12);
            font-weight: 900;
            color: #fff;
          }

          /* Content */
          .content {
            max-width: 1180px;
            margin: 0 auto;
            padding: 14px 18px 26px 18px;
          }

          .h1 {
            margin: 10px 0 12px;
            font-size: 40px;
            font-weight: 950;
            letter-spacing: -0.02em;
          }

          .grid2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            align-items: start;
          }

          .card {
            border-radius: 18px;
            border: 1px solid rgba(255, 255, 255, 0.14);
            background: rgba(3, 10, 20, 0.55);
            padding: 16px;
            backdrop-filter: blur(10px);
          }

          .cardTitle {
            font-weight: 950;
            font-size: 20px;
            margin-bottom: 10px;
          }

          .steps {
            margin: 0;
            padding-left: 18px;
            line-height: 1.7;
            font-weight: 800;
            opacity: 0.95;
          }

          .ctaBlock {
            margin-top: 14px;
            border-radius: 16px;
            border: 1px solid rgba(255, 255, 255, 0.12);
            background: rgba(255, 255, 255, 0.04);
            padding: 14px;
            display: grid;
            gap: 10px;
            justify-items: start;
          }

          .ctaTitle {
            font-weight: 950;
            font-size: 18px;
          }

          .primaryBtn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 10px 16px;
            border-radius: 14px;
            border: 1px solid rgba(120, 170, 255, 0.35);
            background: rgba(30, 60, 140, 0.55);
            color: #fff;
            text-decoration: none;
            font-weight: 950;
            min-width: 120px;
          }

          .primaryBtn:hover {
            background: rgba(30, 60, 140, 0.7);
          }

          .ctaHint {
            opacity: 0.9;
            font-weight: 800;
          }

          .pill {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 999px;
            border: 1px solid rgba(255, 255, 255, 0.16);
            background: rgba(255, 255, 255, 0.06);
            margin-left: 6px;
            font-weight: 950;
          }

          .ruleBox {
            margin-top: 14px;
            border-radius: 16px;
            border: 1px solid rgba(255, 255, 255, 0.12);
            background: rgba(255, 255, 255, 0.04);
            padding: 14px;
          }

          .ruleTitle {
            font-weight: 950;
            font-size: 16px;
            margin-bottom: 6px;
          }

          .ruleText {
            opacity: 0.92;
            line-height: 1.6;
          }

          .lead {
            opacity: 0.92;
            line-height: 1.6;
            margin: 0 0 10px 0;
          }

          .audit {
            margin: 0;
            padding: 12px;
            border-radius: 16px;
            background: rgba(255, 255, 255, 0.94);
            color: #0b1220;
            border: 1px solid rgba(0, 0, 0, 0.08);
            overflow: auto;
            white-space: pre-wrap;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
              "Liberation Mono", "Courier New", monospace;
            font-size: 13px;
            line-height: 1.45;
            max-height: 260px; /* keeps it above the fold */
          }

          .rightLinks {
            margin-top: 10px;
            display: flex;
            justify-content: flex-end;
          }

          .miniLink {
            display: inline-flex;
            padding: 10px 12px;
            border-radius: 14px;
            border: 1px solid rgba(255, 255, 255, 0.18);
            background: rgba(255, 255, 255, 0.06);
            color: #fff;
            text-decoration: none;
            font-weight: 950;
          }

          .miniLink:hover {
            background: rgba(255, 255, 255, 0.1);
          }

          @media (max-width: 980px) {
            .grid2 {
              grid-template-columns: 1fr;
            }
            .h1 {
              font-size: 36px;
            }
            .rightLinks {
              justify-content: flex-start;
            }
          }
        `}</style>
      </div>
    </>
  );
}
