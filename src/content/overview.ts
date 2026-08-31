/**
 * Copy for the Overview / welcome screen (Row A, node 8474:11927).
 * All user-facing strings for this screen live here — nothing inline in JSX.
 * Spec: wizard-spec-files/WIZARD-SPEC.md §1.
 *
 * Every string below was transcribed directly off
 * wizard-spec-files/screens/A1_overview__8474-11927.png (character by character, via
 * cropped/upscaled reads), not copied from the spec's §1 copy table, which is a
 * cleaned paraphrase. The Figma source contains real typos and they are reproduced
 * here verbatim — do not "fix" them.
 *
 * Typos present, as verified against the PNG:
 *   - intro: "confgure" (missing "i") and "felds" (missing "i" in "fields" — this
 *     second one is NOT called out in the task brief's copy table, but it is present
 *     in the rendered Figma frame, so it is reproduced here too).
 *   - account-number body: "notifed"
 *   - user-email body: "data fow"
 *   - company-name body: "identifer"
 *   - company-logo body: "refect"
 *   - contract-type body: "service ofer"
 */
import {
  CircleUser,
  Factory,
  GraduationCap,
  Hash,
  Handshake,
  Image,
  Mail,
  type LucideIcon,
} from 'lucide-react'

export interface OverviewField {
  id: string
  label: string
  icon: LucideIcon
  body: string
}

export const OVERVIEW_COPY = {
  title: 'Dashboard Settings',
  intro:
    "Welcome to the VisibilityIQ Dashboard Settings wizard! This wizard helps you quickly create and confgure your " +
    "new dashboard's basic settings. For a smooth setup, please review the information below to familiarize yourself " +
    'with the input felds before you begin.',
  fields: [
    {
      id: 'account-number',
      label: 'Account Number',
      icon: Hash,
      body:
        "The end customer's Siebel account number, as stated in their VisibilityIQ contract. " +
        'Enter this number manually to initiate the dashboard setup. If an existing dashboard is ' +
        'found for this account or a related account under the same Standard Name, you will be ' +
        'notifed. In such cases, consider using the existing dashboard instead of creating a new one',
    },
    {
      id: 'user-email',
      label: 'User Email',
      icon: Mail,
      body:
        'The email address of the primary customer contact who will receive the initial welcome ' +
        'letter and dashboard access once the data fow is validated. Make sure the email domain ' +
        'name matches the company name before adding a user.',
    },
    {
      id: 'company-name',
      label: 'Company Name',
      icon: Factory,
      body:
        "This is the dashboard's core identifer within the VIQ system and cannot be changed once " +
        'set. Upon entering the Siebel account ID, you can choose from the Account Name, ' +
        'Subsidiary Standard Name (if available), or the global Standard Name.',
    },
    {
      id: 'learning-series',
      label: 'Sign Up For Learning Series',
      icon: GraduationCap,
      body:
        'Check this box to subscribe the customer user to the VIQ learning series. This provides ' +
        'them with training videos to enhance their understanding and utilization of the ' +
        'VisibilityIQ product.',
    },
    {
      id: 'display-name',
      label: 'Display Name',
      icon: CircleUser,
      body:
        'This name will be visible to users on their dashboard when they log in. While it defaults ' +
        'to the chosen Company Name, you can customize it for rebranding or other preferences. ' +
        'This setting can be updated at any time.',
    },
    {
      id: 'company-logo',
      label: 'Company Logo',
      icon: Image,
      body:
        "Use this button to upload your company's logo, which will be prominently displayed on the " +
        'dashboard when customers log in. It can be updated at any time to refect branding changes ' +
        'or preferences',
    },
    {
      id: 'contract-type',
      label: 'Contract Type',
      icon: Handshake,
      body:
        "This field determines the dashboard's data source, as well as the automatically generated " +
        'roles and user groups. It is pre-populated based on the purchased service ofer ' +
        '(represented by service SKU), but can be updated manually if needed.',
    },
  ] satisfies OverviewField[],
}
