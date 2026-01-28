// pages/life-sciences/app/documents/index.js

import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { apiFetch } from "@/lib/life_sciences_app_lib/api";
import {
  getCurrentUser,
  requireAuthOrRedirect,
  logout,
} from "@/lib/life_sciences_app_lib/auth";

function normalizeText(x) {
  return String(x || "").toLowerCase();
}

function truncateMiddle(s, max = 44) {
  const str = String(s || "");
  if (str.length <= max) return str;
  const left = Math.ceil((max - 3) / 2);
  const right = Math.floor((max - 3) / 2);
  return `${str.slice(0, left)}...${str.slice(str.length - right)}`;
}

// Best-effort owner display (order matters)
// Prioritize human-readable fields (email, displayName) over UUIDs
function pickOwner(it) {
  // First try display names and emails (human-readable)
  const humanReadable = 
    it?.ownerDisplayName ||
    it?.ownerName ||
    it?.ownerEmail ||
    it?.submittedByDisplayName ||
    it?.submittedByName ||
    it?.submittedByEmail;
  
  if (humanReadable) return humanReadable;
  
  // Then try usernames
  const username = it?.ownerUsername;
  if (username) return username;
  
  // Check if submittedBy looks like an email (contains @)
  const submittedBy = it?.submittedBy;
  if (submittedBy && typeof submittedBy === "string" && submittedBy.includes("@")) {
    return submittedBy;
  }
  
  // Skip UUIDs (long alphanumeric strings without @) - show fallback instead
  // UUIDs are typically 36 chars with dashes: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  if (submittedBy && typeof submittedBy === "string" && submittedBy.length > 30 && !submittedBy.includes("@")) {
    return "—"; // Don't show UUID
  }
  
  // Last resort: show submittedBy if it's short or looks like a name
  if (submittedBy && typeof submittedBy === "string" && submittedBy.length < 30) {
    return submittedBy;
  }
  
  return "—";
}

function pickDocId(it) {
  return it?.documentId || it?.id || it?.docId || it?.pk || "—";
}

function pickTitle(it) {
  return it?.title || it?.documentTitle || it?.name || "Untitled";
}

function pickUpdatedUtc(it) {
  return (
    it?.lastActionAt ||
    it?.updatedAt ||
    it?.submittedAt ||
    it?.createdAt ||
    "—"
  );
}

function StatusPill({ status }) {
  const s = String(status || "—").toUpperCase();
  const isSubmitted = s === "SUBMITTED";
  const isApproved = s === "APPROVED";
  const isRejected = s === "REJECTED";

  const bg = isSubmitted
    ? "rgba(168, 85, 247, 0.18)" // purple
    : isApproved
    ? "rgba(16, 185, 129, 0.18)" // green
    : isRejected
    ? "rgba(239, 68, 68, 0.18)" // red
    : "rgba(255,255,255,0.06)";

  const border = isSubmitted
    ? "rgba(168, 85, 247, 0.50)"
    : isApproved
    ? "rgba(16, 185, 129, 0.50)"
    : isRejected
    ? "rgba(239, 68, 68, 0.50)"
    : "rgba(255,255,255,0.18)";

  return (
    <span
      style={{
        display: "inline-block",
        padding: "0.2rem 0.6rem",
        borderRadius: 999,
        border: `1px solid ${border}`,
        background: bg,
        fontSize: "0.85rem",
        fontWeight: 900,
        letterSpacing: "0.01em",
        color: "#fff",
        whiteSpace: "nowrap",
      }}
    >
      {s}
    </span>
  );
}

export default function DocumentsRegisterPage() {
  const router = useRouter();

  const [user, setUser] = useState({ displayName: "Demo User", role: "—" });

  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const [q, setQ] = useState("");
  const [navMsg, setNavMsg] = useState(null);

  const [sortKey, setSortKey] = useState("updatedAt");
  const [sortDir, setSortDir] = useState("desc");

  const roleLower = String(user?.role || "").toLowerCase();
  const isApprover = roleLower === "approver";

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setBusy(true);
    setError(null);

    try {
      const u = getCurrentUser();
      if (!u) throw new Error("Not signed in.");

      const data = await apiFetch("/documents", { method: "GET" }, router);

      const list = Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.documents)
        ? data.documents
        : Array.isArray(data)
        ? data
        : [];

      // Document register is GLOBAL (per your requirement): show all docs
      setItems(list);
    } catch (e) {
      setItems([]);
      setError(e?.message || "Failed to load documents.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onClickPendingApprovals(e) {
    if (isApprover) return;
    e.preventDefault();
    setNavMsg("Only Approvers can see that screen.");
    setTimeout(() => setNavMsg(null), 2500);
  }

  function toggleSort(nextKey) {
    if (sortKey === nextKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(nextKey);
    setSortDir("asc");
  }

  const filteredAndSorted = useMemo(() => {
    const query = normalizeText(q).trim();

    let out = items;

    if (query) {
      out = out.filter((it) => {
        const hay = [
          pickTitle(it),
          pickOwner(it),
          pickDocId(it),
          it?.status,
          pickUpdatedUtc(it),
        ]
          .map(normalizeText)
          .join(" | ");
        return hay.includes(query);
      });
    }

    const dirMul = sortDir === "asc" ? 1 : -1;

    const sorted = [...out].sort((a, b) => {
      if (sortKey === "title") {
        return (
          String(pickTitle(a)).localeCompare(String(pickTitle(b))) * dirMul
        );
      }
      if (sortKey === "owner") {
        return (
          String(pickOwner(a)).localeCompare(String(pickOwner(b))) * dirMul
        );
      }
      if (sortKey === "status") {
        return (
          String(a?.status || "").localeCompare(String(b?.status || "")) * dirMul
        );
      }
      // default: updatedAt-like fields (UTC strings)
      return (
        String(pickUpdatedUtc(a)).localeCompare(String(pickUpdatedUtc(b))) *
        dirMul
      );
    });

    return sorted;
  }, [items, q, sortKey, sortDir]);

  function sortIndicator(key) {
    if (sortKey !== key) return "↕";
    return sortDir === "asc" ? "↑" : "↓";
  }

  return (
    <>
      <Head>
        <title>Documents - VDC Demo</title>
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
              <Link href="/life-sciences/app" className="navLink">
                Overview
              </Link>
              <Link href="/life-sciences/app/upload" className="navLink">
                Upload
              </Link>
              <Link href="/life-sciences/app/submissions" className="navLink">
                Submissions
              </Link>
              <Link
                href="/life-sciences/app/documents"
                className="navLink active"
              >
                Documents
              </Link>

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
              <div className="userName">{user.displayName || "Demo User"}</div>
              <div className="rolePill">{String(user.role || "—")}</div>
              <button
                className="logoutBtn"
                onClick={() => logout(router)}
                type="button"
              >
                Logout
              </button>
            </div>
          </nav>

          {navMsg ? <div className="navMsg">{navMsg}</div> : null}
        </div>

        <main className="content">
          <h1 className="h1">Document Register</h1>

          <div className="subtitle">
            Global register of documents in the demo workspace. The register is
            searchable and sortable. All timestamps are recorded in UTC.
          </div>

          <section className="panel">
            <div className="panelHead">
              <div>
                <div className="panelTitle">All documents</div>
                <div className="panelSub">
                  Action available here: <strong>Audit Trail</strong> (no document
                  download from the register).
                </div>
              </div>

              <div className="panelActions">
                <input
                  className="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by title, owner, id, status, or UTC timestamp…"
                  disabled={busy}
                />
                <button
                  className="ghostBtn"
                  type="button"
                  onClick={load}
                  disabled={busy}
                >
                  Refresh
                </button>
              </div>
            </div>

            {busy ? (
              <div className="muted" style={{ marginTop: 12 }}>
                Loading…
              </div>
            ) : null}

            {error ? (
              <div className="errorBox">
                <strong>Problem:</strong> {error}
                <div className="errorHint">
                  Confirm API Gateway has <code>GET /documents</code> wired
                  correctly and returning <code>items</code>.
                </div>
              </div>
            ) : null}

            {!busy && !error && filteredAndSorted.length === 0 ? (
              <div className="muted" style={{ marginTop: 12 }}>
                No documents found.
              </div>
            ) : null}

            {!busy && !error && filteredAndSorted.length > 0 ? (
              <div className="tableWrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="colTitle">
                        <button
                          className="thBtn"
                          type="button"
                          onClick={() => toggleSort("title")}
                        >
                          Title <span className="sort">{sortIndicator("title")}</span>
                        </button>
                      </th>
                      <th className="colOwner">
                        <button
                          className="thBtn"
                          type="button"
                          onClick={() => toggleSort("owner")}
                        >
                          Owner <span className="sort">{sortIndicator("owner")}</span>
                        </button>
                      </th>
                      <th className="colStatus">
                        <button
                          className="thBtn"
                          type="button"
                          onClick={() => toggleSort("status")}
                        >
                          Status <span className="sort">{sortIndicator("status")}</span>
                        </button>
                      </th>
                      <th className="colUpdated">
                        <button
                          className="thBtn"
                          type="button"
                          onClick={() => toggleSort("updatedAt")}
                        >
                          Updated (UTC){" "}
                          <span className="sort">{sortIndicator("updatedAt")}</span>
                        </button>
                      </th>
                      <th className="colActions">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredAndSorted.map((it) => {
                      const id = pickDocId(it);
                      const title = pickTitle(it);
                      const owner = pickOwner(it);
                      const updatedUtc = pickUpdatedUtc(it);
                      const status = String(it?.status || "").toUpperCase();

                      return (
                        <tr key={String(id)}>
                          <td>
                            <div className="docTitle">{title}</div>
                            <div className="docMeta">
                              Document ID:{" "}
                              <span className="mono">{truncateMiddle(id, 52)}</span>
                            </div>
                          </td>

                          <td className="cellWrap">
                            <span className="wrapAny">{truncateMiddle(owner, 54)}</span>
                          </td>

                          <td>
                            <StatusPill status={status} />
                          </td>

                          <td className="cellWrap">
                            <span className="wrapAny">{updatedUtc}</span>
                          </td>

                          <td>
                            <div className="actions">
                              <Link
                                className="link"
                                href={`/life-sciences/app/documents/${encodeURIComponent(
                                  String(id)
                                )}`}
                              >
                                Audit Trail
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : null}
          </section>
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

        .homeLink {
          text-decoration: none;
          font-weight: 800;
          color: #fff;
          opacity: 0.95;
        }

        .headerDivider {
          opacity: 0.35;
          color: #fff;
        }

        .headerInfo {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
          font-size: 14px;
          color: #fff;
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
        }

        .userName {
          font-weight: 900;
          color: #fff;
          opacity: 0.95;
        }

        .rolePill {
          padding: 6px 10px;
          border-radius: 999px;
          border: 1px solid rgba(120, 170, 255, 0.35);
          background: rgba(30, 60, 140, 0.35);
          font-weight: 900;
          color: #fff;
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
          padding: 18px 18px 30px 18px;
        }

        .h1 {
          font-size: 44px;
          line-height: 1.05;
          margin: 18px 0 8px 0;
          font-weight: 950;
          color: #fff;
        }

        .subtitle {
          font-size: 16px;
          opacity: 0.9;
          color: #fff;
          margin-bottom: 14px;
          max-width: 110ch;
          line-height: 1.6;
        }

        .panel {
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(3, 10, 20, 0.55);
          padding: 16px;
          backdrop-filter: blur(10px);
        }

        .panelHead {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .panelTitle {
          font-weight: 950;
          font-size: 18px;
          margin-bottom: 6px;
          color: #fff;
        }

        .panelSub {
          opacity: 0.78;
          color: #fff;
          max-width: 90ch;
          line-height: 1.5;
        }

        .panelActions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .search {
          min-width: 360px;
          max-width: 520px;
          width: 42vw;
          padding: 10px 12px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(0, 0, 0, 0.22);
          color: #fff;
          outline: none;
        }

        .ghostBtn {
          padding: 10px 14px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.06);
          font-weight: 900;
          color: #fff;
          cursor: pointer;
        }

        .ghostBtn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .errorBox {
          margin-top: 12px;
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid rgba(255, 80, 80, 0.45);
          background: rgba(255, 30, 30, 0.12);
          color: #fff;
        }

        .errorHint {
          margin-top: 8px;
          opacity: 0.85;
          color: #fff;
        }

        .muted {
          opacity: 0.8;
          color: #fff;
        }

        .tableWrap {
          margin-top: 14px;
          overflow: hidden;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(6, 12, 28, 0.35);
        }

        .table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }

        th,
        td {
          text-align: left;
          padding: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          vertical-align: top;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        th {
          color: rgba(255, 255, 255, 0.85);
          font-weight: 900;
          background: rgba(255, 255, 255, 0.03);
        }

        .thBtn {
          display: inline-flex;
          gap: 8px;
          align-items: center;
          background: transparent;
          border: none;
          padding: 0;
          color: rgba(255, 255, 255, 0.92);
          font-weight: 950;
          cursor: pointer;
        }

        .thBtn:hover {
          text-decoration: underline;
          text-underline-offset: 4px;
        }

        .sort {
          opacity: 0.75;
          font-weight: 950;
        }

        .colTitle {
          width: 40%;
        }
        .colOwner {
          width: 22%;
        }
        .colStatus {
          width: 14%;
        }
        .colUpdated {
          width: 16%;
        }
        .colActions {
          width: 8%;
        }

        .docTitle {
          font-weight: 950;
          font-size: 16px;
          color: #fff;
        }

        .docMeta {
          margin-top: 6px;
          color: rgba(255, 255, 255, 0.72);
          font-size: 12px;
        }

        .mono {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
            "Liberation Mono", "Courier New", monospace;
        }

        .cellWrap {
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .wrapAny {
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: flex-start;
        }

        .link {
          color: rgba(255, 255, 255, 0.92);
          font-weight: 900;
          text-decoration: none;
          border-bottom: 1px solid rgba(255, 255, 255, 0.25);
          padding-bottom: 2px;
        }

        .link:hover {
          border-bottom-color: rgba(255, 255, 255, 0.6);
        }

        @media (max-width: 900px) {
          .search {
            min-width: 260px;
            width: 70vw;
          }
          .h1 {
            font-size: 40px;
          }
        }

        @media (max-width: 720px) {
          .colUpdated,
          td:nth-child(4) {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
