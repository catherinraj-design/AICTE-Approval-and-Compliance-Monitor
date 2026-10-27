# AICTE Approval & Compliance Monitor

A secure, unified prototype web application that automates and monitors AICTE approval workflows, institutional compliance, expert visiting committee (EVC) inspections, and time-bound undertakings.

> **Statutory Safeguard Notice:**
> Automated alerts and workflow actions support the approval process; scrutiny, verification, inspections and decisions remain with the competent authority.
> System architecture strictly enforces human-in-the-loop decisions: no application, inspection report, or compliance undertaking is ever auto-approved or auto-rejected by the algorithm.
> *(Prototype Demonstration Platform. Fictional institutional records for demonstration purposes only. Not an official AICTE portal).*

---

## 🛠 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server & Client Components)
- **Language**: TypeScript (Strict typing)
- **Styling**: Tailwind CSS with custom Indian Government design palette
- **Icons**: Lucide React
- **Data Visualizations**: Recharts (Pie charts, Ageing distribution, Bar charts, Caseload distribution)
- **Database & ORM**: SQLite with [Prisma ORM](https://www.prisma.io/) (`prisma/dev.db` - zero configuration)
- **Date Formatting**: Strict Indian date format (`DD-MM-YYYY` / `DD-MM-YYYY HH:mm IST`)

---

## 🚀 Quick Setup & Running

### 1. Install Dependencies
```bash
npm install
```

### 2. Generate Prisma Client & Push Database Schema
```bash
npx prisma generate
npx prisma db push
```

### 3. Seed Realistic Dummy Data
Resets and seeds the SQLite database with 16 fictional institutions across 5 regions (North, South, West, East, Central), 50 applications across all stages and paths, 15 time-bound undertakings, 20 lease/clearance records, 10 EVC records, and 10 configurable prototype rules:
```bash
npm run seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your web browser.

---

## 👥 Role-Based Mock Authentication

Use the **Role Switcher** located in the top-right header to switch instantly between 5 personas without logging in:

| Role Persona | Simulated User | Default Scope & Capabilities |
| :--- | :--- | :--- |
| **Institution User** | Dr. Suresh Verma (Registrar) | Sees only **Apex Institute of Technology, Bhopal** (Central). Submits new proposals, uploads undertaking proofs, submits lease renewals. |
| **Regional Officer** | Shri Rajeshwar Rao / Dr. Meenakshi Sundaram | Scoped to **North / Central Region**. Clears scrutiny, returns for deficiency with mandatory reasons, schedules EVCs, verifies compliance. |
| **Bureau Officer** | Dr. Sunita Deshmukh (Advisor HQ) | Pan-India overview across all 5 regions. Reviews bottleneck stages, monitors overdue cases, renders decisions. |
| **Committee Member** | Prof. (Dr.) Amitabh Sen (EVC Chairman) | Inspects assigned EVC campus visits, submits inspection reports and committee recommendations. |
| **Senior Authority / Admin** | Member Secretary / Admin | Full administrative control, configurable workflow stage paths, edits notification rules & escalation thresholds. |

---

## ⏰ Interactive Demo Clock & Escalation Engine

Located in the top header:
- **Simulated Date Indicator**: Displays the current active system date in `DD-MM-YYYY`.
- **`+7d` / `+30d` / `+60d` Buttons**: Advance the simulated clock forward in time.
- **`↺` Reset Button**: Resets the clock to the base date (`26-10-2026`).
- **`⚡ Run Rules` Button**: Immediately evaluates the autonomous rule engine against the simulated date.

When the clock moves forward, `runRules(asOfDate)` executes live:
1. **Pre-deadline reminders** fire at 30, 15, and 7 days.
2. **Overdue undertakings** escalate:
   - Overdue by 1 day $\rightarrow$ **Regional Officer Alert (L1)**
   - Overdue by 15 days $\rightarrow$ **Bureau Officer Alert (L2)**
   - Overdue by 30 days $\rightarrow$ **Senior Authority / Admin Alert (L3)**
3. **Delayed EVC inspections** update dynamically to `DELAYED` and issue reminders.
4. **Expiring documents** transition to `EXPIRING_SOON` or `EXPIRED`.
5. All triggered alerts generate **in-app notifications**, **mock email logs**, and **append-only audit entries**.

---

## 🎬 5-Minute End-to-End Demo Script

Follow these 6 steps to demonstrate the complete workflow lifecycle:

### Step 1: Submit Application Proposal (Institution Persona)
1. In the header role switcher, select **`INSTITUTION`** (*Apex Institute of Technology*).
2. Click **`Submit New Proposal`** in the sidebar (or navigate to `/applications/new`).
3. Fill out the proposal:
   - **Legal Name**: Apex Institute of Technology, Bhopal
   - **Category**: Extension of Approval (EoA)
   - **Stage Movement Pathway**: Select `Scrutiny + EVC`
   - **Intake**: 120 seats
4. Click **`Submit Application Dossier`**.
5. The application auto-routes to stage **`Scrutiny`** with an auto-generated Electronic Case Summary Draft and Communication Draft marked *"Draft: requires officer review"*.

### Step 2: Complete Scrutiny (Regional Officer Persona)
1. In the header role switcher, switch to **`REGIONAL_OFFICER`** (*Central Region*).
2. Open the application you just submitted (from the dashboard table or `/applications`).
3. Review the dossier, then click **`Complete & Advance Stage`**.
4. Enter verification remarks: *"Statutory documents verified compliant. Dispatched for physical inspection."*
5. Click **Confirm & Advance Stage**.
6. The application automatically advances to stage **`EVC`**, and an inspection docket is created in the **EVC Queue**.

### Step 3: Schedule EVC & Advance Demo Clock
1. Navigate to **`EVC Inspections Queue`** in the sidebar (`/evc`).
2. Locate the application in the queue and click **`Schedule`**.
3. Choose an inspection date (e.g. 10 days ahead) and select committee members. Click **Confirm Schedule**.
4. Now look at the header **Demo Clock** and click **`+30d`**.
5. Notice the live green notification banner: the system date advances by 30 days.
6. The inspection date has now elapsed! The EVC status automatically updates from `UPCOMING` to **`DELAYED`** (rose badge), an automated delayed escalation triggers, and the in-app notification bell counter increments.

### Step 4: Undertaking Goes Overdue & Escalates
1. Click **`Time-Bound Undertakings`** in the sidebar (`/undertakings`).
2. Observe the compliance register:
   - Undertakings due in the elapsed window have automatically shifted from `PENDING` to **`OVERDUE`** or **`ESCALATED`**.
   - Notice the **Escalation Tier** badges: `RO_ALERT`, `BO_ALERT`, and `SENIOR_ALERT`.
   - Check the **Notification Center** (bell icon in header) to inspect the escalated notice.

### Step 5: Lease Renewal Upload & Officer Verification
1. Switch role back to **`INSTITUTION`**.
2. Navigate to **`Lease & Document Validity`** (`/documents`).
3. Locate the **Registered Land Lease Deed** that is `EXPIRED` or `EXPIRING_SOON`.
4. Click **`Submit Renewal`**. Enter `Apex_Registered_Lease_Renewal_30Years.pdf` and submit.
5. Status changes to **`RENEWAL_SUBMITTED`**.
6. Switch role to **`REGIONAL_OFFICER`**.
7. Click **`Verify`** on the document renewal. Enter officer remarks, select **30 Years Extension**, and click **Endorse & Extend Validity**.
8. Status updates to **`VERIFIED`** (emerald chip) with new validity extended.

### Step 6: Verify Append-Only Audit Trail
1. Switch role to **`ADMIN`** or **`REGIONAL_OFFICER`**.
2. Navigate to **`Append-Only Audit Trail`** in the sidebar (`/audit`).
3. Verify that every single action performed above is permanently logged:
   - `SUBMITTED` (Institution submission)
   - `STAGE_ADVANCED` (Regional officer scrutiny clearance)
   - `EVC_SCHEDULED` (Committee allocation)
   - `DEMO_CLOCK_ADVANCED` & `RULE_ESCALATION` (Automated rule triggers)
   - `DOCUMENT_RENEWAL_SUBMITTED` & `DOCUMENT_VERIFIED`
4. Click **`View State`** on any row to inspect the JSON Before/After snapshot.
5. Notice the persistent security banner: **"Statutory Integrity: Record edit or delete prohibited"**.

---

## 📊 Modules & Verification Matrix

| Module | Features Included |
| :--- | :--- |
| **A. Approval Workflow** | Configurable stage paths (5 standard paths), auto-stage advance, "Ready for decision" state, manual human decision modal (Approve / Reject / Conditional Approval), deficiency return with mandatory recorded reason, electronic case summary generator, standard communication drafts. |
| **B. Dashboard & Monitoring** | 4 KPI cards (Total, Pending, Overdue, Due in 7 days), Recharts pipeline chart, region breakdown, ageing distribution (0-15, 16-30, 31-60, 60+), officer caseload chart, automated bottleneck stage detector, filterable interactive table. |
| **C. EVC Scheduling** | Queue of applications cleared for inspection, scheduling modal, upcoming/due/delayed status indicators, special new institution priority tracking, delayed inspection escalation. |
| **D. Undertakings Register** | Conditional EoA tracking, institution proof upload, officer verify/reject workflow with remarks, multi-tier escalation chain (`RO_ALERT`, `BO_ALERT`, `SENIOR_ALERT`). |
| **E. Document Validity** | Land lease deed (30-year), Fire NOC, Building Safety Certificate expiry tracking, renewal upload, officer verification, validity extension. |
| **F. Rule Engine & Reports** | Configurable rule catalog, threshold days adjustment, `runRules(asOfDate)` execution, in-app notification center, mock email dispatch log, reports tab with CSV download and print-ready stylesheet. |
| **G. Audit Trail** | Immutable append-only log (`AuditLog` table), before/after state capture, mandatory justification, search by actor/action/entity. |
