import termsHtml from "../assets/terms.html?raw";
import {
  LegalPageLayout,
  EmbeddedLegalHtml,
} from "../components/legal/LegalPageLayout";

export default function TermsPage() {
  return (
    <LegalPageLayout bare>
      <EmbeddedLegalHtml html={termsHtml} />
    </LegalPageLayout>
  );
}
