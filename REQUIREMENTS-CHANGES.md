# Requirements Changes Log

**Project**: VDC Production Deployment - Cognito MFA Implementation  
**Date Started**: 2026-01-26

## Change Log

### 2026-01-26: MFA Requirement Scope Change

**Original Requirement:**
- MFA required only for **Approver** role users
- Submitters do not require MFA

**Updated Requirement:**
- MFA required for **ALL users** (both Submitters and Approvers)
- This simplifies Cognito configuration and is acceptable for the demonstration

**Reason for Change:**
- Simplifies Cognito User Pool configuration (no need for group-based MFA enforcement)
- Easier to implement and maintain
- Acceptable for demonstration purposes

**Impact:**
- All 4 demo users (Submitter 1, Submitter 2, Approver 1, Approver 2) will need MFA enrolled
- All users will see MFA codes on the login page
- All users will be prompted for MFA during login
- Login page UI already supports this (MFA codes displayed for all users)

**Status:** ✅ Approved by user

**Implementation:**
- Cognito User Pool MFA configuration: Set to `ON` for all users
- Login page: Already displays MFA codes for all users
- TOTP Generator: Already available for all users
- Next step: Configure Cognito and enroll MFA for all demo accounts

---

### 2026-01-27: Simplified Login UX & Sticky MFA Panel

**Original Requirement / Behavior:**
- Custom login page displayed:
  - GxP disclaimer
  - Two large role cards (Submitter / Approver) with:
    - All four demo users’ emails and passwords
    - Embedded MFA code widgets
    - “Login as …” buttons per user
- Approver login:
  - Opened Cognito Hosted UI in a popup
  - Sticky MFA panel showed **only the MFA code** (no credentials)
- Submitter login:
  - Redirected full window to Cognito (no popup)
  - Users had to remember/copy credentials from the large cards section.

**Updated Requirement:**
- **Login page content is simplified**:
  - Shows **GxP Compliance Notice**.
  - Shows **one compact “Authorized Users Only” section** with **four small role buttons**:
    - `Submitter 1`, `Submitter 2`, `Approver 1`, `Approver 2`.
  - No longer shows the full credential grids for each user on the main page.
- **Role button behavior** (all four users):
  - Clicking any role button must:
    - Open the **Cognito Hosted UI login page in a popup window** (blank fields; user copies credentials).
    - Show a **sticky panel** on the top‑right of the login page titled  
      “MFA Code for \<Display Name\>”.
    - Keep the sticky panel visible for the entire Cognito login + MFA flow.
  - The sticky panel must display for the selected role:
    - **Email** (with a copy‑to‑clipboard button).
    - **Password** (with a copy‑to‑clipboard button).
    - **Live MFA code** (TOTP, 6 digits, 30‑second step).
    - A warning to verify that the email shown in the Cognito popup matches the expected email.
    - Clear instructions to keep the page open and copy email, password, and MFA code into Cognito.
  - After successful authentication and callback:
    - The Cognito popup window must close.
    - The sticky panel must disappear (login page cleans up its state).
- **Security / correctness guardrail**:
  - The system must **validate in the OAuth callback** that:
    - The email in the ID token returned by Cognito matches the email for the role that was selected on the login page.
  - If there is a mismatch (e.g., user selected Submitter 2 but logged in as Approver 1):
    - Login must be rejected.
    - Tokens must be cleared.
    - A clear error message must be displayed indicating:
      - Which account Cognito actually logged the user in as.
      - That it does not match the selected role.
      - That the user should log out of Cognito and retry with the correct account.
    - The error view must provide:
      - A button to **go back to the login page** (`/life-sciences/app/login?force=true`) and clear local tokens.
      - A button to **log out from Cognito** (calls Cognito `/logout` with the configured `logout_uri`).
      - An automatic redirect to Cognito logout after a short delay.

**Reason for Change:**
- Make the demo workflow easier and less visually cluttered:
  - Users pick a role, see only the information relevant to that role.
  - Credentials and MFA are kept together in a single sticky panel.
- Reduce cognitive load and copying errors when switching between users.
- Enforce that **the Cognito account actually used** matches the **role selected** on the demo login page.

**Impact:**
- Main login page:
  - Only GxP disclaimer + four role buttons + brief instructions; no large credential grid.
- All four roles (Submitter 1/2, Approver 1/2):
  - Share a **common UX pattern**: role button → Cognito popup + sticky credentials/MFA panel.
- Error handling:
  - Clear separation between “selected” role and “actual Cognito account used”.
  - Mismatches are now surfaced explicitly and blocked.

**Status:** ✅ Approved by user; implementation in `pages/life-sciences/app/login.js` and `pages/life-sciences/app/callback.js`.

**Notes for URS / FS:**
- URS should explicitly state:
  - The need for a **single, simplified login landing page** with:
    - GxP disclaimer text.
    - Four role buttons for the demo accounts.
  - The requirement for a **sticky credentials + MFA panel** per role during authentication.
  - The requirement to **prevent cross‑role logins** (e.g., selecting Submitter 2 but logging in as Approver 1).
- FS should describe:
  - The event flows between login page, Cognito popup, sticky panel, and callback page.
  - The exact fields shown in the sticky panel (email, password, MFA, warnings).
  - The mismatch detection logic and error handling behavior.

---

## Related Documents

- `COGNITO-MFA-SETUP.md` - Technical setup instructions
- `LOGIN-FIXES-SUMMARY.md` - Implementation status
- `pages/life-sciences/app/login.js` - Login page implementation
