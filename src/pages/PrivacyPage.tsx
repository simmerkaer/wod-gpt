import { Link } from "react-router-dom";
import { LegalPageLayout } from "../components/legal/LegalPageLayout";

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="May 27, 2026">
      <p>
        This policy explains how WOD-GPT ("wod-gpt", "we", "us") processes your
        personal data under the GDPR. WOD-GPT is operated as a personal project
        by a private individual based in Denmark (Frederikssundsvej 66), who
        acts as the data controller. For any privacy question or request,
        contact{" "}
        <a href="mailto:simmerkaer@gmail.com">simmerkaer@gmail.com</a>.
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
          <strong>Technical/diagnostic data</strong>: server-side error and
          performance telemetry via Azure Application Insights.
        </li>
        <li>
          <strong>Analytics data</strong>: if you consent, Google Analytics
          collects usage statistics in your browser (see our{" "}
          <Link to="/cookies">Cookie Policy</Link>).
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
          For analytics/telemetry that relies on cookies or similar
          technologies — your consent.
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
        <li>
          <strong>Google (Analytics)</strong> — usage analytics, only if you
          consent to analytics cookies.
        </li>
      </ul>

      <h2>4. International transfers</h2>
      <p>
        Your workout and account data are stored in the EU (Azure West Europe).
        Workout generation uses an Azure OpenAI endpoint located in the United
        States (East US 2), so the selections you submit for generation are
        processed outside the EU/EEA. Other providers (e.g. Stripe, Auth0) may
        also process limited data outside the EU/EEA. Where this happens, the
        transfer relies on appropriate safeguards such as the EU Standard
        Contractual Clauses.
      </p>

      <h2>5. Retention</h2>
      <p>
        We keep your account and workout data for as long as your account
        exists. When you delete your account, that data is removed within 30
        days. Billing records are retained as long as required by applicable
        accounting and tax law.
      </p>

      <h2>6. Your rights</h2>
      <p>
        You have the right to access, correct, delete, restrict, or export your
        data, and to object to certain processing. To exercise these rights —
        including account deletion — email{" "}
        <a href="mailto:simmerkaer@gmail.com">simmerkaer@gmail.com</a>. You can
        also complain to the Danish Data Protection Agency (Datatilsynet).
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
