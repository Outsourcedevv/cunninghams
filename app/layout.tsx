import type { Metadata } from "next";
import { Rye } from "next/font/google";
import "./globals.css";

// Matches the Victorian signwriting on the pub frontage. Name only, never body copy.
const rye = Rye({ weight: "400", subsets: ["latin"], display: "swap", variable: "--font-sign" });

export const metadata: Metadata = {
  title: "Cunninghams Kildare | Bar, Restaurant & Rooms",
  description:
    "Award winning gastro pub in the Round Tower House on Kildare's Market Square since 1916. Thai and European cooking, live trad music, and ten boutique rooms.",
  keywords: ["Cunninghams Kildare", "restaurant Kildare", "gastro pub Kildare", "live music Kildare", "Thai food Kildare", "rooms Kildare Town"],
  openGraph: {
    title: "Cunninghams Kildare | Bar, Restaurant & Rooms",
    description:
      "Award winning gastro pub on Kildare's Market Square since 1916. Thai and European cooking, live trad music, and ten boutique rooms.",
    type: "website",
    locale: "en_IE",
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "Cunninghams",
  description: "Award winning gastro pub, supper clubs and rooms in Kildare Town.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "1 Castle Wall, Market Square",
    addressLocality: "Kildare",
    addressRegion: "County Kildare",
    postalCode: "R51 TW80",
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
