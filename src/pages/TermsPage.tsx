import { Link } from "react-router-dom";
import { LegalPageLayout, Placeholder } from "../components/legal/LegalPageLayout";

export default function TermsPage() {
  return (
    <LegalPageLayout title="Terms of Service" lastUpdated="REPLACE WITH DATE">
      <p>
        These Terms govern your use of WOD-GPT (the "Service"), operated by{" "}
        <Placeholder>[Business / sole-proprietor name]</Placeholder>,{" "}
        <Placeholder>[address]</Placeholder>, CVR{" "}
        <Placeholder>[CVR number]</Placeholder>, contact{" "}
        <Placeholder>[support email]</Placeholder>. By using the Service you
        agree to these Terms.
      </p>

      <h2>1. The Service</h2>
      <p>
        WOD-GPT generates CrossFit-style workouts using AI. Workouts are
        generated automatically and are provided for general informational
        purposes only.
      </p>

      <h2>2. Not medical or fitness advice</h2>
      <p>
        The Service does not provide medical, health, or professional fitness
        advice. Exercise carries inherent risks. Consult a qualified
        professional before starting any new exercise program. You use generated
        workouts at your own risk, and{" "}
        <Placeholder>[Business name]</Placeholder> is not liable for injury or
        loss arising from your use of the Service to the maximum extent
        permitted by law.
      </p>

      <h2>3. Accounts</h2>
      <p>
        Some features require an account, which you create by signing in through
        a supported identity provider. You are responsible for activity under
        your account.
      </p>

      <h2>4. Free tier and subscriptions</h2>
      <ul>
        <li>
          Free users may generate up to a limited number of workouts per day.
        </li>
        <li>
          A paid subscription removes that limit. The current price, billing
          interval, and currency are shown before you pay, on the Stripe
          Checkout page.
        </li>
        <li>
          Subscriptions renew automatically each billing period until canceled.
        </li>
        <li>
          Payments are processed by Stripe. We do not store your card details.
        </li>
      </ul>

      <h2>5. Cancellation and right of withdrawal</h2>
      <p>
        You can cancel any time from the customer portal (linked in your
        profile). Access continues until the end of the current paid period;{" "}
        <Placeholder>
          [state your refund policy — e.g. "we do not provide partial refunds
          for the current period"]
        </Placeholder>
        .
      </p>
      <p>
        As an EU consumer you normally have a 14-day right of withdrawal for
        online purchases. By subscribing and ticking the consent box at
        checkout, you request that the Service begins immediately and you
        acknowledge that you lose the right of withdrawal for the part of the
        Service already delivered.
      </p>

      <h2>6. Acceptable use</h2>
      <p>
        Do not misuse the Service, attempt to disrupt it, or access it in
        violation of applicable law. We may suspend or terminate accounts that
        do.
      </p>

      <h2>7. Changes</h2>
      <p>
        We may update these Terms. Material changes will be reflected by the
        "Last updated" date above. Continued use after changes constitutes
        acceptance.
      </p>

      <h2>8. Governing law</h2>
      <p>
        These Terms are governed by the laws of Denmark, without regard to
        conflict-of-law rules, and subject to any mandatory consumer-protection
        rights you have where you live.
      </p>

      <h2>9. Contact</h2>
      <p>
        Questions about these Terms:{" "}
        <Placeholder>[support email]</Placeholder>. See also our{" "}
        <Link to="/privacy">Privacy Policy</Link> and{" "}
        <Link to="/cookies">Cookie Policy</Link>.
      </p>
    </LegalPageLayout>
  );
}
