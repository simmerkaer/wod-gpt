import { Link } from "react-router-dom";
import { LegalPageLayout, Placeholder } from "../components/legal/LegalPageLayout";

export default function CookiePolicyPage() {
  return (
    <LegalPageLayout title="Cookie Policy" lastUpdated="REPLACE WITH DATE">
      <p>
        This page explains the cookies and similar technologies WOD-GPT uses.
        For how we handle personal data generally, see our{" "}
        <Link to="/privacy">Privacy Policy</Link>.
      </p>

      <h2>Strictly necessary</h2>
      <ul>
        <li>
          <strong>Authentication</strong>: when you sign in, our auth provider
          (Auth0) and the hosting platform set cookies needed to keep you logged
          in. These are required for the Service to function and do not need
          consent.
        </li>
      </ul>

      <h2>Functional</h2>
      <ul>
        <li>
          <strong>Preferences</strong>: we use your browser's local storage to
          remember settings such as theme and your daily free-generation count.
        </li>
      </ul>

      <h2>Analytics</h2>
      <p>
        <Placeholder>
          [If Azure Application Insights is configured to collect client-side
          telemetry tied to users, list it here and load it only after consent.
          If you only collect anonymous server-side telemetry, state that and
          remove this section's consent requirement.]
        </Placeholder>
      </p>

      <h2>Managing cookies</h2>
      <p>
        You can clear or block cookies in your browser settings. Blocking
        strictly necessary cookies may break sign-in and parts of the Service.
      </p>

      <h2>Contact</h2>
      <p>
        Questions: <Placeholder>[support email]</Placeholder>.
      </p>
    </LegalPageLayout>
  );
}
