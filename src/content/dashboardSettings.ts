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
   * Tooltip copy — **only the strings that are legible in a Row D frame**.
   *
   * Spec §3 says every label carries a 16px info icon whose tooltip explains
   * the field, and §3 offers two ways to fill the gaps it leaves ("reuse the
   * Overview copy from §Row A, or ask the designer"). Neither is taken: on
   * the client's instruction, copy that cannot be read off a frame is not
   * shipped at all. So the five fields below have no entry here, and their
   * info icon renders with nothing behind it (`FieldLabel` keeps drawing the
   * icon, because every B- and D-row frame shows one on every label — it is
   * the *text* that is unverified, not the icon):
   *
   *   Display name · Automatically add contracts · Valid company names ·
   *   Contract type · User email
   *
   * There is also no `submit` entry, and there never should have been: the
   * frame named `D3_tooltip-submit-hover` shows the **Company name** tooltip
   * open (the same string as `D2`) next to a Submit button in its hover
   * state — not a tooltip on Submit. The earlier `submit` string here was
   * written from the frame's *name*; reading the frame itself disproves it.
   * `screens.ts`'s D3 entry reproduces what the frame actually shows.
   *
   * Both survivors were transcribed from their frame, character by character.
   */
  tooltips: {
    // Verbatim, spec §3 — verified against D1 (`10489:80202`), and re-read
    // off the frame at 3x when the placeholders around it were removed.
    accountNumber:
      "Enter the customer's Siebel account number as it appears on their VIQF contract.",
    // Verbatim, spec §3 — verified against D2 (`10489:80363`) and again in
    // D3, which shows the same tooltip.
    companyName:
      'Select the core identifier for your dashboard; this name cannot be changed once set.',
  },
} as const
