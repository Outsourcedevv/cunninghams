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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IE" className={rye.variable}>
      <head>
        {/* Arms the scroll reveal. Runs before the first paint, so hiding the sections never
            flashes; the class is what allows globals.css to hide them at all, which means no
            JavaScript means no hiding. The timer is the other half: if the page script has not
            taken over within 2.5s — bundle blocked, hydration failed, an older phone browser
            choking on the chunk — the gate drops and everything below the hero is simply
            readable. useScrollReveal clears it as soon as it owns the reveal. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){var r=document.documentElement;r.classList.add('js-reveal');" +
              "window.__revealFailsafe=setTimeout(function(){r.classList.remove('js-reveal')},2500)})()",
          }}
        />
      </head>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
        {children}
      </body>
    </html>
  );
}
