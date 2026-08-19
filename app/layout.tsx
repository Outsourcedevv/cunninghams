import type { Metadata } from "next";
import { Rye } from "next/font/google";
import "./globals.css";

// Matches the Victorian signwriting on the pub frontage. Name only, never body copy.
const rye = Rye({ weight: "400", subsets: ["latin"], display: "swap", variable: "--font-sign" });

// A share card needs an absolute URL — a scraper on Facebook or WhatsApp has no page to
// resolve a relative one against. Overridable so a move to a custom domain is one variable.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://outsourcedevv.github.io/cunninghams";

const SHARE_DESCRIPTION =
  "Award winning gastro pub on Kildare's Market Square since 1916. Thai and European cooking, live trad music, and ten boutique rooms.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Cunninghams Kildare | Bar, Restaurant & Rooms",
  description:
    "Award winning gastro pub in the Round Tower House on Kildare's Market Square since 1916. Thai and European cooking, live trad music, and ten boutique rooms.",
  keywords: ["Cunninghams Kildare", "restaurant Kildare", "gastro pub Kildare", "live music Kildare", "Thai food Kildare", "rooms Kildare Town"],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Cunninghams Kildare | Bar, Restaurant & Rooms",
    description: SHARE_DESCRIPTION,
    type: "website",
    locale: "en_IE",
    siteName: "Cunninghams",
    url: "/",
    // Without this, a link shared to WhatsApp or Facebook — which is how a pub actually
    // travels — arrives as a bare grey box. 1200x630 is what the scrapers crop to.
    images: [{ url: "/og-card.jpg", width: 1200, height: 630, alt: "The dining room at Cunninghams, Market Square, Kildare" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cunninghams Kildare | Bar, Restaurant & Rooms",
    description: SHARE_DESCRIPTION,
    images: ["/og-card.jpg"],
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "Cunninghams",
  description: "Award winning gastro pub, supper clubs and rooms in Kildare Town.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Market Square",
    addressLocality: "Kildare",
    addressRegion: "County Kildare",
    postalCode: "R51 FA07",
    addressCountry: "IE",
  },
  telephone: "+353-45-521780",
  email: "info@cunninghamskildare.com",
  servesCuisine: ["Thai", "European", "Irish"],
  openingHours: ["Mo-Th 17:00-23:30", "Fr 17:00-00:30", "Sa 13:00-00:30", "Su 13:00-23:00"],
};

// Runs before the first paint, so gating the sections never flashes. Injected as a style
// element rather than a class on <html>, which React renders and would flag as a hydration
// mismatch. No script means no gate, so a blocked bundle leaves the page readable rather
// than blank, and the timer covers the case where the page script never takes over.
const HEAD_SCRIPT = `
(function () {
  if (window.__revealGateInstalled) return;
  window.__revealGateInstalled = true;

  var gate = document.createElement('style');
  gate.id = 'reveal-gate';
  gate.textContent = '@media (prefers-reduced-motion: no-preference){[data-reveal]{opacity:0;transform:translateY(28px)}}';
  document.head.appendChild(gate);

  // Dropping the gate is the failure path — a dead observer, a bundle that never ran, or a
  // visitor who asked for reduced motion. Forcing the end state beats removing the rule and
  // waiting on a 0.7s transition that a struggling browser may never actually run.
  window.__dropRevealGate = function () {
    gate.textContent = '[data-reveal]{opacity:1 !important;transform:none !important;transition:none !important}';
  };
  window.__revealFailsafe = setTimeout(window.__dropRevealGate, 2500);

  // Collapses the link list into a menu, in its own element so dropping the reveal gate
  // above cannot take it with it. Same bargain: no script, no collapsing, and the links
  // stay in the bar exactly as they were.
  var navGate = document.createElement('style');
  navGate.id = 'nav-gate';
  navGate.textContent = '@media (max-width:1150px){.nav-links:not([data-open="true"]){display:none}.nav-toggle{display:inline-flex}}';
  document.head.appendChild(navGate);
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IE" className={rye.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: HEAD_SCRIPT }} />
      </head>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
        {children}
      </body>
    </html>
  );
}
