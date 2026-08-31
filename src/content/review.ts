/**
 * Copy for review mode and edit-from-review mode (E1, R3, E2, E3).
 * All user-facing strings for these screens live here — nothing inline in
 * JSX — kept independent from src/content/dashboardSettings.ts (owned by a
 * different task in this parallel build) even though several field labels
 * are the same underlying copy.
 *
 * The boxed review layout (E1) labels its seven read-only cards from
 * `fields.labels`, the same strings edit mode uses, because it shows the
 * same seven fields. `rows` is R3's own shorter set — that layout drops
 * Account number and Company name into its logo panel instead.
 *
 * Spec: wizard-spec-files/screens/E1_review__8901-9551.png,
 *       wizard-spec-files/screens/R3_review-logo-left__10680-16436.png,
 *       wizard-spec-files/screens/E2_edit__10489-80942.png,
 *       wizard-spec-files/screens/E3_edit-variant__10489-80741.png
 */
export const REVIEW_COPY = {
  title: 'Dashboard Settings',

  /** R3 right-column rows, label above value. */
  rows: {
    displayName: 'Display name',
    validCompanyNames: 'Valid company names',
    contractType: 'Contract type',
    userEmail: 'User email',
  },

  /**
   * R3 drops the "Automatically add contracts" row entirely and instead
   * shows this as a right-aligned note on the Display name value line when
   * form.automaticallyAddContracts === 'yes'.
   */
  contractsAutoAddedNote: 'Contracts automatically added',

  /** Placeholder shown in the logo card when no file has been uploaded. */
  logoPlaceholder: {
    brand: 'logoipsum',
  },

  /**
   * E1's caption beside the logo card. `fileName` is the frame's literal
   * copy: an uploaded logo is held as an object URL with no filename
   * attached, so there is no real name to substitute here.
   */
  logoCard: {
    label: 'Account Logo',
    fileName: 'File Name',
  },

  buttons: {
    /** R3's only footer button in the frame. */
    done: 'Done',
    /**
     * NOT in the R3 frame. R3 ships with only a "Done" button, yet edit mode
     * (E2/E3) exists and is otherwise unreachable — the Figma dev note on
     * 9082:6667 says "editing will be possible through edit button". This is
     * a deliberate, approved addition to the frame (flagged to the client
     * via docs/figma-capture.md), not an oversight.
     */
    enterEdit: 'Edit',
    /** E2/E3 outline footer button, restores the pre-edit snapshot. */
    cancel: 'Cancel',
    /**
     * E2/E3 primary footer button. The Figma genuinely labels this "Edit",
     * not "Save", even though it commits the changes — spec §7.6 calls this
     * a likely designer slip. Reproduced verbatim; do not rename to "Save".
     */
    saveEdit: 'Edit',
  },

  /**
   * Edit-from-review mode (E2/E3) reuses the same field set as the initial
   * Dashboard Settings form (B01), just under a Cancel/Edit footer instead
   * of Back/Submit. Copy here is transcribed from the verified B-row spec
   * text so this task's rendering stays self-contained.
   */
  fields: {
    labels: {
      accountNumber: 'Account number',
      companyName: 'Company name',
      displayName: 'Display name',
      automaticallyAddContracts: 'Automatically add contracts',
      validCompanyNames: 'Valid company names',
      contractType: 'Contract type',
      userEmail: 'User email',
      signUpForLearningSeries: 'Sign up for learning series',
    },
    placeholders: {
      accountNumber: 'Type your account number...',
      // TYPO in the Figma source, spec §3 / §7.5 — "compony", not "company".
      companyName: 'Select compony name...',
      displayName: 'Create a display name...',
      validCompanyNames: 'Select all valid names',
      contractType: 'Select contract types',
      userEmail: 'Enter your email...',
    },
    tooltips: {
      accountNumber:
        "Enter the customer's Siebel account number as it appears on their VIQF contract.",
      companyName:
        'Select the core identifier for your dashboard; this name cannot be changed once set.',
      displayName: 'Choose the name shown for this dashboard throughout the app.',
      automaticallyAddContracts:
        'When enabled, new contracts on this account are added to the dashboard automatically.',
      validCompanyNames: 'Select every company name that should be treated as valid for this account.',
      contractType: 'Select which contract types this dashboard should track.',
      userEmail: 'Enter the email address that should receive dashboard notifications.',
    },
    radio: { yes: 'Yes', no: 'No' },
    uploadLogo: 'Upload Logo',
  },
} as const
