import { Link } from "react-router-dom";
import { ArrowLeft, Rss, ExternalLink, Copy } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { brand } from "@/config/brand";

const FEED_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/rss`;

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  toast.success("Copied to clipboard");
};

const CodeBlock = ({ children, label }: { children: string; label?: string }) => (
  <div className="relative group">
    {label && <span className="text-[0.7rem] uppercase tracking-wider text-muted-foreground font-ui">{label}</span>}
    <pre className="bg-muted border border-border rounded-md p-4 text-xs leading-relaxed overflow-x-auto font-mono text-foreground mt-1">
      <code>{children}</code>
    </pre>
    <button
      onClick={() => copyToClipboard(children)}
      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded bg-background border border-border hover:bg-accent"
      title="Copy"
    >
      <Copy className="h-3.5 w-3.5 text-muted-foreground" />
    </button>
  </div>
);

const RssFeed = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-[820px] mx-auto px-6 pt-10 pb-20">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 font-ui text-[0.85rem] text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Back
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <Rss className="h-7 w-7 text-primary" />
          <h1 className="font-heading text-3xl font-bold text-foreground">RSS Feed Integration</h1>
        </div>

        <div className="font-body text-lg leading-relaxed text-body space-y-8">
          <p>
            {brand.name} provides a public RSS 2.0 feed that third parties can use to stay up to date
            with our latest news and integrate our content into their own platforms.
          </p>

          {/* What the feed provides */}
          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-foreground">What's Included</h2>
            <p>The feed returns the <strong>50 most recent published articles</strong>, each containing:</p>
            <ul className="list-disc list-inside space-y-1 text-base text-muted-foreground">
              <li>Article title</li>
              <li>Short description / subtitle</li>
              <li>Direct link to the full article</li>
              <li>Publication date</li>
              <li>Cover image (as an RSS enclosure)</li>
            </ul>
          </section>

          {/* Feed URL */}
          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-foreground">Feed URL</h2>
            <div className="flex flex-col sm:flex-row gap-3 items-start">
              <code className="bg-muted border border-border rounded-md px-3 py-2 text-sm font-mono break-all flex-1">
                {FEED_URL}
              </code>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="outline" onClick={() => copyToClipboard(FEED_URL)}>
                  <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy
                </Button>
                <Button size="sm" asChild>
                  <a href={FEED_URL} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Open Feed
                  </a>
                </Button>
              </div>
            </div>
          </section>

          {/* Feed readers */}
          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-foreground">Feed Readers</h2>
            <p>
              Paste the feed URL into any RSS reader to receive automatic updates. Popular options include{" "}
              <strong>Feedly</strong>, <strong>Inoreader</strong>, <strong>NewsBlur</strong>, and{" "}
              <strong>Thunderbird</strong>.
            </p>
          </section>

          {/* Auto-discovery */}
          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-foreground">Auto-Discovery</h2>
            <p>
              To let browsers and crawlers automatically detect the feed, add this tag to your{" "}
              <code className="text-sm bg-muted px-1.5 py-0.5 rounded">&lt;head&gt;</code>:
            </p>
            <CodeBlock label="HTML">{`<link
  rel="alternate"
  type="application/rss+xml"
  title="${brand.name} News"
  href="${FEED_URL}"
/>`}</CodeBlock>
          </section>

          {/* Programmatic access */}
          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-foreground">Programmatic Access</h2>
            <p>Fetch the feed from any backend or script:</p>
            <CodeBlock label="cURL">{`curl -s "${FEED_URL}"`}</CodeBlock>
            <CodeBlock label="JavaScript (fetch)">{`const res = await fetch("${FEED_URL}");
const xml = await res.text();
// Parse XML with DOMParser or a library like 'fast-xml-parser'`}</CodeBlock>
          </section>

          {/* CMS / Widget */}
          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-foreground">CMS &amp; Widget Embedding</h2>
            <p>
              Most CMS platforms (WordPress, Webflow, Notion, etc.) offer RSS widget blocks. Simply paste
              the feed URL into the widget configuration to display our latest articles on your site.
            </p>
          </section>

          {/* Contact */}
          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-foreground">Questions?</h2>
            <p>
              For integration support, reach out to{" "}
              <a href={`mailto:${brand.contactEmail}`} className="text-primary hover:underline">
                {brand.contactEmail}
              </a>.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RssFeed;
