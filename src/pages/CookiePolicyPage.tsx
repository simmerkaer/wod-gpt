import { Link } from "react-router-dom";
import { LegalPageLayout } from "../components/legal/LegalPageLayout";

export default function CookiePolicyPage() {
  return (
    <LegalPageLayout title="Cookie Policy" lastUpdated="May 27, 2026">
      <p>
        This page explains the cookies and similar technologies WOD-GPT uses.
        For how we handle personal data generally, see our{" "}
        <Link to="/privacy">Privacy Policy</Link>. Questions:{" "}
        <a href="mailto:simmerkaer@gmail.com">simmerkaer@gmail.com</a>.
      </p>

      <h2>Strictly necessary</h2>
      <ul>
        <li>
          <strong>Authentication</strong>: when you sign in, our auth provider
          (Auth0) and the hosting platform set cookies needed to keep you logged
          in. These are required for the Service to function and do not require
          consent.
        </li>
      </ul>

      <h2>Functional</h2>
      <ul>
        <li>
          <strong>Preferences</strong>: we use your browser's local storage to
          remember settings such as theme and your daily free-generation count.
          This stays on your device and is not used for tracking.
        </li>
      </ul>

      <h2>Analytics (consent required)</h2>
      <ul>
        <li>
          <strong>Google Analytics</strong>: we use Google Analytics to
          understand how the site is used. It sets cookies (such as{" "}
          <code>_ga</code>) to distinguish visitors. These load{" "}
          <strong>only after you accept</strong> on the cookie banner, and you
          can change your choice any time via "Cookie settings" in the footer.
        </li>
      </ul>
      <p>
        We also collect server-side diagnostic telemetry (Azure Application
        Insights) to keep the Service running. This happens on our servers and
        does not set cookies in your browser.
      </p>

      <h2>Managing cookies</h2>
      <p>
        You can clear or block cookies in your browser settings. Blocking
        strictly necessary cookies may break sign-in and parts of the Service.
      </p>
    </LegalPageLayout>
  );
}
