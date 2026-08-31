/**
 * Copy for the Dashboard Settings step (B-row, plus the Row D tooltips).
 * All user-facing strings for this step live here — nothing inline in JSX.
 * Spec: wizard-spec-files/WIZARD-SPEC.md §3.
 */
export const DASHBOARD_SETTINGS_COPY = {
  title: 'Dashboard Settings',
  labels: {
    accountNumber: 'Account number',
    companyName: 'Company name',
    displayName: 'Display name',
    automaticallyAddContracts: 'Automatically add contracts',
    validCompanyNames: 'Valid company names',
    contractType: 'Contract type',
    userEmail: 'User email',
    signUpForLearningSeries: 'Sign up for learning series',
    companyLogo: 'Company logo',
  },
  placeholders: {
    accountNumber: 'Type your account number...',
    // TYPO in the Figma source, spec §3 / §7.5 — "compony", not "company". Reproduce as-is.
    companyName: 'Select compony name...',
    displayName: 'Create a display name...',
    validCompanyNames: 'Select all valid names',
    contractType: 'Select contract types',
    userEmail: 'Enter your email...',
    treeSearch: 'Search',
  },
  buttons: {
    back: 'Back',
    // NOT 'Next' on this step — spec §3: "Footer button on this step is labelled Submit".
    submit: 'Submit',
    uploadLogo: 'Upload Logo',
    save: 'Save',
    cancel: 'Cancel',
  },
  radio: { yes: 'Yes', no: 'No' },
  /**
   * One tooltip per field, spec §3 ("Every label carries a 16px info icon →
   * tooltip"). Only two of these were verified against a Row D frame — the
   * other five never appear in any exported screenshot in
   * wizard-spec-files/screens/, so spec §3 says to "reuse the Overview copy
   * from §Row A, or ask the designer."
   *
   * This task (Task 6) does NOT import OVERVIEW_COPY — src/content/overview
   * is owned by Task 4 and does not exist yet at the time this file was
   * written, and the brief explicitly forbids importing it here. The five
   * placeholders below are this task's best-effort, transcription-shaped
   * copy (matching the terse, second-person register of the two verified
   * strings) and are flagged for Task 4/a later pass to replace with the
   * real Overview explainer text once that module exists.
   */
  tooltips: {
    // Verbatim, spec §3 — verified against D1 (`10489:80202`).
    accountNumber:
      "Enter the customer's Siebel account number as it appears on their VIQF contract.",
    // Verbatim, spec §3 — verified against D2 (`10489:80363`).
    companyName:
      'Select the core identifier for your dashboard; this name cannot be changed once set.',
    // PLACEHOLDER — not shown in any Row D frame. Derive from OVERVIEW_COPY once Task 4 lands.
    displayName: 'Choose the name shown for this dashboard throughout the app.',
    // PLACEHOLDER — not shown in any Row D frame. Derive from OVERVIEW_COPY once Task 4 lands.
    automaticallyAddContracts:
      'When enabled, new contracts on this account are added to the dashboard automatically.',
    // PLACEHOLDER — not shown in any Row D frame. Derive from OVERVIEW_COPY once Task 4 lands.
    validCompanyNames: 'Select every company name that should be treated as valid for this account.',
    // PLACEHOLDER — not shown in any Row D frame. Derive from OVERVIEW_COPY once Task 4 lands.
    contractType: 'Select which contract types this dashboard should track.',
    // PLACEHOLDER — not shown in any Row D frame. Derive from OVERVIEW_COPY once Task 4 lands.
    userEmail: 'Enter the email address that should receive dashboard notifications.',
    // PLACEHOLDER — D3 (`10489:76248`) shows the Submit button in a hover
    // state with a tooltip open, but the tooltip copy wasn't legible in
    // that frame's export. Best-effort text pending a designer check.
    submit: 'Submit your dashboard settings to create this dashboard.',
  },
} as const
