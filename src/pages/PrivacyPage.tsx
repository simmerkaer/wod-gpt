import { Link } from "react-router-dom";
import { LegalPageLayout, Placeholder } from "../components/legal/LegalPageLayout";

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="REPLACE WITH DATE">
      <p>
        This policy explains how WOD-GPT, operated by{" "}
        <Placeholder>[Business / sole-proprietor name]</Placeholder> (the "data
        controller"), processes your personal data under the GDPR. Contact:{" "}
        <Placeholder>[support email]</Placeholder>.
      </p>

      <h2>1. What we collect</h2>
      <ul>
        <li>
          <strong>Account data</strong>: your email address and an identifier
          from your sign-in provider.
        </li>
        <li>
          <strong>Usage data</strong>: workouts you generate and save, your
          daily generation count, and completion/streak data.
        </li>
        <li>
          <strong>Billing data</strong>: subscription status and a Stripe
          customer identifier. Card details are handled by Stripe and never
          reach our servers.
        </li>
        <li>
          <strong>Technical/diagnostic data</strong>: error and performance
          telemetry via Azure Application Insights.
        </li>
      </ul>

      <h2>2. Why we process it (legal basis)</h2>
      <ul>
        <li>To provide the Service and your account — performance of a contract.</li>
        <li>To process subscriptions and payments — performance of a contract.</li>
        <li>
          To keep the Service secure and working — our legitimate interests.
        </li>
        <li>
          For optional analytics/telemetry — your consent, where required.
        </li>
      </ul>

      <h2>3. Sub-processors</h2>
      <p>We share data with the following providers strictly to run the Service:</p>
      <ul>
        <li>
          <strong>Auth0 (Okta)</strong> — authentication / sign-in.
        </li>
        <li>
          <strong>Stripe</strong> — subscription billing and payments.
        </li>
        <li>
          <strong>Microsoft Azure</strong> — hosting, storage of your workout
          and subscription data, and Application Insights telemetry.
        </li>
        <li>
          <strong>Azure OpenAI</strong> — generating workout content from your
          selections.
        </li>
      </ul>

      <h2>4. International transfers</h2>
      <p>
        Data is primarily processed in the EU (Azure West Europe). Some
        processing (e.g. AI generation, or Stripe/Auth0 infrastructure) may
        occur outside the EU/EEA, in which case appropriate safeguards such as
        the EU Standard Contractual Clauses apply.{" "}
        <Placeholder>
          [Confirm your actual regions and update this section.]
        </Placeholder>
      </p>

      <h2>5. Retention</h2>
      <p>
        We keep your account and workout data while your account exists. Billing
        records are retained as required by accounting/tax law.{" "}
        <Placeholder>[State your retention periods.]</Placeholder>
      </p>

      <h2>6. Your rights</h2>
      <p>
        You have the right to access, correct, delete, restrict, or export your
        data, and to object to certain processing. To exercise these rights —
        including account deletion — email{" "}
        <Placeholder>[support email]</Placeholder>. You can also complain to the
        Danish Data Protection Agency (Datatilsynet).
      </p>

      <h2>7. Cookies</h2>
      <p>
        See our <Link to="/cookies">Cookie Policy</Link> for details on cookies
        and similar technologies.
      </p>

      <h2>8. Changes</h2>
      <p>
        We may update this policy; the "Last updated" date above reflects the
        latest version.
      </p>
    </LegalPageLayout>
  );
}
