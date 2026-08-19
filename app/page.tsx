"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// Set by the head script in layout.tsx, cleared by useScrollReveal once it owns the reveal.
declare global {
  interface Window {
    __revealFailsafe?: ReturnType<typeof setTimeout>;
    __dropRevealGate?: () => void;
  }
}

const COLORS = {
  darkBlue: "#050F32",
  darkRed: "#6B1515",
  offWhite: "#F5EFE0",
  gold: "#C9A84C",
  goldLight: "#E0C06A",
};

const BOOKING_URL = "https://dishcult.com/restaurant/cunninghamsbar?sortOrder=0&page=1";
const ROOMS_URL = "https://www.booking.com/hotel/ie/cunningham-39-s-guesthouse.html";
const ENQUIRY_EMAIL = "info@cunninghamskildare.com";
const DIRECTIONS_URL = "https://www.google.com/maps/search/?api=1&query=Cunninghams%20Bar%20Market%20Square%20Kildare%20R51%20FA07";

const REVIEW_SOURCES: { name: string; rating?: number; detail: string; url: string }[] = [
  {
    name: "Google",
    rating: 4.7,
    detail: "The largest pool of reviews, and the one most people check first.",
    url: "https://www.google.com/maps/search/?api=1&query=Cunninghams%20Bar%20Market%20Square%20Kildare",
  },
  {
    name: "Tripadvisor",
    rating: 4.5,
    detail: "Where the ranking comes from, with the full history of visits.",
    url: "https://www.tripadvisor.ie/Restaurant_Review-g656612-d5308481-Reviews-Cunninghams_Bar-Kildare_County_Kildare.html",
  },
  {
    name: "Dish Cult",
    rating: 4.9,
    detail: "Diners who booked through Dish Cult, where you can reserve a table too.",
    url: BOOKING_URL,
  },
];
const PHONE_DISPLAY = "(045) 521 780";

// Drinks is deliberately absent: it is the section directly below Menu, so one link covers
// both and the nav loses a row on the narrow screens where every row is fixed overhead. The
// #drinks section keeps its id and stays linkable.
const NAV_ITEMS = ["About", "Video", "Menu", "Pavillion", "Music", "Rooms", "Hours", "Contact"];

const PAVILION_PHOTOS = [
  {
    src: "/pavilion-interior.webp",
    alt: "The Pavillion's timber-roofed room at Cunninghams, with buttoned leather banquettes, cast iron tables and glazed sides opening onto greenery",
    caption: "Under the timber roof",
  },
  {
    src: "/pavilion-fireside.webp",
    alt: "Buttoned leather booths, framed racing prints and wall-mounted screens beside the stove in the Pavillion",
    caption: "Booths, screens and the stove",
  },
  {
    src: "/pavilion-roof.webp",
    alt: "Looking up at the Pavillion's painted timber roof, its overhead heaters, a vintage Player's Please sign and a mounted wooden propeller",
    caption: "Player's Please, and an old propeller",
  },
];

// Every claim below is sourced: the building from the National Inventory of Architectural
// Heritage (record 11817051), the tower and cathedral from St Brigid's own records, the
// business from IntoKildare. Do not add to this without a source — it is a real history.
const FULL_STORY = [
  {
    heading: "The house came first",
    body: "Round Tower House was built around 1830, a three-bay, two-storey merchant's house of graceful Georgian proportions at the edge of Market Square, and it has been a place of business since the early 1800s. Ireland's National Inventory of Architectural Heritage records it as a building of regional importance, listed for its architectural, artistic, historical and social interest, and singles out the decorative render work and raised lettering along the parapet as the work of local craftsmen.",
  },
  {
    heading: "Named for the tower across the square",
    body: "Kildare's round tower rises 33 metres beside St Brigid's Cathedral — the second tallest in Ireland, and the tallest that visitors can still climb. Its base is cut from Wicklow granite hauled more than forty miles; the storeys above it are local limestone. St Brigid founded her monastery on that ground in 480 AD, and the cathedral standing there today was built in 1223.",
  },
  {
    heading: "A bar since 1916",
    body: "Cunninghams has traded here since 1916. What began as a village bar now runs as a bar, dining room, music venue and guesthouse under one roof, with the upstairs room given over to private events for up to fifty guests.",
  },
  {
    heading: "The kitchen and the bar today",
    body: "The kitchen serves an extensive Thai menu alongside European and Irish classics, all cooked to order. A lively crowd of local trad musicians gathers in the bar several nights a week, and there is piano on Saturdays. Upstairs, ten adults-only rooms are decorated in a classic, timeless style drawn from the owners' love of travel.",
  },
  {
    heading: "Where you are",
    body: "Market Square puts St Brigid's Cathedral and the round tower a short walk from the door, with Kildare Village, the Irish National Stud and Japanese Gardens, and the Curragh Racecourse all a short drive away.",
  },
];

// Transcribed from the dine-in menu card, prices included. The card writes them without a
// currency symbol and to one decimal (9.5), which is fine on a table but not on a page, so
// they are set here as euro to two places. Nothing is inferred: dishes priced by the protein
// you choose carry the choice as a note instead of a price, exactly as the card does.
const MENU: { category: string; note?: string; items: { name: string; price?: string; desc?: string }[] }[] = [
  {
    category: "To Start / Soups",
    items: [
      { name: "Spring Rolls", price: "€9.50 veg · €11.50 duck", desc: "We hand roll our Spring Rolls." },
      { name: "Spicy Chicken or Prawn Broth", price: "€9.50", desc: "A kick of Thai herbs and spices." },
      { name: "Crispy Won Tons", price: "€9.50", desc: "Freshly made won tons with a chicken filling." },
      { name: "Chicken Satay", price: "€10.00", desc: "Marinated chicken served with peanut sauce." },
      { name: "Buffalo Wings", price: "€11.50", desc: "Crisp fried wings lightly coated in hot sauce, served with a blue cheese dip." },
      { name: "Seafood Chowder", price: "€10.50", desc: "The goodness of the sea, select vegetables with the richness of cream." },
      { name: "Butterfly Prawns", price: "€11.50", desc: "Fresh prawns in a crisp panko crumb with our own recipe chilli jam." },
      { name: "Blackbean Ribs", price: "€11.50", desc: "Marinated in black bean sauce and slow cooked." },
      { name: "Mixed Starter for Two", price: "€19.00", desc: "Chef's selection." },
    ],
  },
  {
    category: "Salads",
    note: "Starter / main",
    items: [
      { name: "Duck / Prawn Noodle Salad", price: "€11.50 / €21.00", desc: "Fresh garden salads above wok fried noodles." },
      { name: "Caesar Salad with Chicken", price: "€10.50 / €20.00", desc: "Drizzled with our homemade dressing." },
      { name: "Chicken Cashew", price: "€10.50 / €20.00", desc: "Served in our sweet and nutty dressing." },
    ],
  },
  {
    category: "Above the Charcoal",
    items: [
      { name: "10oz Rib Eye", price: "€33.00", desc: "Prime dry aged rib eye. Butterfly prawns add €7. Choice of pepper, red wine or garlic butter sauce." },
      { name: "The Beef Burger", price: "€20.50", desc: "Homemade 100% Irish beef burger with crispy onions." },
      { name: "Half Crispy Duck", price: "€25.50", desc: "With a tamarind jus. Noodles recommended." },
      { name: "Chargrilled Chicken Fillet", price: "€21.50", desc: "Served with a fresh garden salad topped with a poached egg." },
      { name: "Cajun Fillet Burger", price: "€20.50", desc: "Marinated in cajun spices, charcoal grilled, stacked on a floury bap." },
    ],
  },
  {
    category: "Gone Fishing",
    items: [
      { name: "Fillet Sea Bass", price: "€23.00", desc: "Pan fried and served with wok fried veg and a side of your choice." },
      { name: "Beer Battered Cod", price: "€22.00", desc: "Served with home cut fries, side salad and home recipe tartare sauce." },
      { name: "Chicken / King Prawn Tagliatelle", price: "€21.00 / €23.00", desc: "Sautéed with garlic, shallots, white wine and basil reduction." },
      { name: "Cod and Ginger", price: "€23.00", desc: "Fresh battered cod, wok fried veggies, crisp fried ginger and chilli sauce." },
      { name: "Healthy Option", price: "€23.00", desc: "Wok fried market veggies, fresh prawns and chilli infused grilled cod." },
    ],
  },
  {
    category: "From the Wok",
    items: [
      { name: "Chicken and Cashew", price: "€22.00", desc: "Lightly fried chicken in a soy, garlic, vegetable and cashew sauce." },
      { name: "Nasi Goreng", price: "€21.00", desc: "Rice with chicken, shrimp, peppers, shallots and garlic, topped with a fried egg and a side of chicken on a stick." },
      { name: "Chilli and Basil Chicken", price: "€22.00", desc: "Birds eye chillis, onions, peppers and green beans, finished with basil." },
      { name: "Bangkok Beef", price: "€24.50", desc: "Marinated Irish fillet beef with garlic and chilli reduction." },
      { name: "Fillet Beef Black Pepper", price: "€25.00", desc: "Wok fried with onions and mushrooms in our own black pepper sauce." },
    ],
  },
  {
    category: "Oodles of Noodles",
    note: "Chicken €22 · beef or duck €24.50 · prawns €25.50 · combo €25.50 · vegetarian €18.50",
    items: [
      { name: "Pad Thai", desc: "Rice noodles, thai spices blended in a tangy sauce." },
      { name: "Spicy Noodles", desc: "Fine thread noodles, stir fried with veggies and our own chilli paste." },
      { name: "Phuket Noodles", desc: "Egg noodles, crispy veggies and our own recipe satay and curry blend sauce." },
      { name: "Koy Soy", price: "€23.00", desc: "Crisp fried chicken, crunchy veggies and egg noodles in our curry sauce." },
      { name: "Won Ton Pad Thai", price: "€23.00", desc: "A twist on our favourite street food with the addition of crispy won tons." },
    ],
  },
  {
    category: "The Curry Station",
    note: "Chicken €22 · fillet beef €24.50 · duck €24.50 · prawns €25.50 · combo €25.50 · vegetarian €18.50. Sides: boiled rice, fried rice, home cut fries or egg noodles",
    items: [
      { name: "Massaman", desc: "Mild, with peanuts and potatoes." },
      { name: "Green", desc: "Mild, with thai herbs, green chillies and coconut milk." },
      { name: "Red", desc: "Hot, with thai herbs, red chillies and coconut milk." },
      { name: "Panaeng", desc: "Fiery hot curry with coconut milk, topped with peanuts and fried shallots." },
      { name: "Duck", desc: "Succulent duck breast combined with fruity pineapple and red grapes in a creamy red curry." },
    ],
  },
];

const DRINKS = [
  { group: "White Wine", items: ["Pinot Grigio", "Chardonnay", "Sauvignon Blanc", "Albariño", "Petit Chablis", "Sancerre", "Non-Alcoholic White"] },
  { group: "Red Wine", items: ["Montepulciano", "Rioja", "Merlot", "Cabernet Sauvignon", "Malbec", "Chianti", "Valpolicella", "Pinot Noir", "Shiraz"] },
  { group: "Rosé", items: ["Fontareche Corbières"] },
  { group: "Sparkling", items: ["Prosecco Frizzante", "Prosecco Spumante", "Non-Alcoholic Sparkling"] },
  {
    group: "On Draught",
    items: ["Guinness", "Heineken", "Carlsberg", "Coors", "Smithwick's", "Hop House 13", "O'Hara's IPA", "Orchard Thieves", "Rock Shore Cider", "Rock Shore Lager"],
  },
  { group: "Gin", items: ["Beefeater", "Tanqueray", "Bombay Sapphire", "Hendrick's", "Dingle", "Drumshanbo Gunpowder", "Boatyard", "Monkey 47"] },
  { group: "Whiskey", items: ["Jameson", "Jameson 18", "Redbreast 12", "Southern Comfort", "Tyrconnell Single Malt", "Madeira Cask", "Port Cask", "Sherry Cask"] },
  { group: "Vodka", items: ["Smirnoff", "Dingle"] },
  { group: "Rum & Brandy", items: ["Bacardi White", "Captain Morgan", "Hennessy VS"] },
  { group: "Liqueurs", items: ["Baileys", "Cointreau", "Tia Maria", "Drambuie"] },
];

const BAR_HOURS = [
  { days: "Monday – Thursday", hours: "17:00 – 23:30" },
  { days: "Friday", hours: "17:00 – 00:30" },
  { days: "Saturday", hours: "13:00 – 00:30" },
  { days: "Sunday", hours: "13:00 – 23:00" },
];

const KITCHEN_HOURS = [
  { days: "Wednesday – Thursday", hours: "17:00 – 21:00" },
  { days: "Friday – Saturday", hours: "17:00 – 21:30" },
  { days: "Sunday", hours: "13:00 – 19:00" },
  { days: "Sunday Roast", hours: "13:00 – 15:00" },
];

const MUSIC = [
  { day: "Monday", act: "Trad Session", desc: "Local musicians gather by the open fire" },
  { day: "Wednesday", act: "Trad Session", desc: "A lively night of traditional Irish music" },
  { day: "Saturday", act: "Live Piano", desc: "Weekend evenings with live piano" },
];

const ROOM_FEATURES = [
  "Twin & double rooms",
  "Soundproofed with private entrances",
  "Flat-screen TV & coffee machine",
  "Walk-in shower & free toiletries",
  "Free private parking on site",
  "Adults only",
];

const label = (color: string) => ({
  color,
  letterSpacing: "3px",
  fontSize: "12px",
  textTransform: "uppercase" as const,
  marginBottom: "16px",
});

const divider = { width: "60px", height: "2px", background: COLORS.gold, margin: "0 auto 40px" };

const HERO_SHADOW = "0 2px 10px rgba(0,0,0,0.85), 0 1px 3px rgba(0,0,0,0.9)";

const SIGN_FONT = "var(--font-sign), Georgia, serif";

// next/image applies basePath on its own, but a plain <source> tag and a CSS url() do not,
// so these two need it applied by hand or they 404 wherever the site is not at the root.
const ASSETS = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// Each clip is paired with a still lifted from its own footage, so a player that has not
// decoded a frame yet shows the room rather than the section colour behind it. Both paths
// take the prefix by hand for the same reason: a plain <video> tag never gets basePath.
const VIDEOS = ["dining-room", "kitchen", "sunday-roast", "rooms"].map((name) => ({
  src: `${ASSETS}/${name}.mp4`,
  poster: `${ASSETS}/${name}-poster.webp`,
}));

const MENU_PHOTOS = [
  { src: "/menu-charcoal.webp", caption: "Above the Charcoal", alt: "Beef burger with melted cheese and crispy onions, served with a bowl of chunky chips" },
  { src: "/menu-wok.webp", caption: "From the Wok", alt: "Thai red curry with chicken, coconut cream, fresh basil and red chilli" },
  { src: "/menu-noodles.webp", caption: "Oodles of Noodles", alt: "Noodles with peppers, greens and crispy chicken in a curry sauce" },
  { src: "/menu-dessert.webp", caption: "To Finish", alt: "Warm sponge pudding with custard and a scoop of vanilla ice cream" },
];

function VenueVideo() {
  const frameRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const players = Array.from(frame.querySelectorAll("video"));

    // Set defensively: the attribute is in the markup, but a muted player is the whole
    // basis on which a phone allows autoplay at all, so it is not left to chance.
    players.forEach((player) => {
      player.muted = true;
    });

    const onScreen = new Set<HTMLVideoElement>();

    const start = (player: HTMLVideoElement) => {
      // The blurred backdrop is dropped on phones to save a decode, and a display:none
      // player can never play — asking anyway would report a false autoplay refusal.
      if (!onScreen.has(player) || !player.offsetParent || !player.paused) return;
      // A refusal needs no handling: the player keeps showing its poster, which is a still
      // from the clip itself, and the listeners below retry on the next gesture.
      player.play().catch(() => {});
    };

    const startAll = () => players.forEach(start);

    let delivered = false;

    // Each player is watched separately: on mobile they stack into a block far
    // taller than the viewport, so a threshold on the whole row never fires.
    const observer = new IntersectionObserver(
      (entries) => {
        delivered = true;
        entries.forEach((entry) => {
          const player = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            onScreen.add(player);
            start(player);
          } else {
            onScreen.delete(player);
            player.pause();
          }
        });
      },
      // Starts a screenful early so that on a phone — where the players stack and are met
      // one at a time — a clip is already running by the time it is scrolled into view.
      { threshold: 0, rootMargin: "200px 0px 200px 0px" },
    );

    // Same throttling trap as the scroll reveal: a mobile browser that stops delivering
    // these callbacks would leave every player parked on its poster forever. Falling back
    // to playing the lot beats showing nothing; off-screen ones pause on the next scroll.
    const watchdog = setTimeout(() => {
      if (delivered) return;
      players.forEach((player) => onScreen.add(player));
      startAll();
    }, 1000);

    // A phone that refused autoplay will honour the next genuine gesture, and scrolling
    // down to the videos is itself a gesture — so playback starts on its own rather than
    // waiting for the visitor to find a button.
    const unlock = () => {
      players.forEach((player) => {
        player.muted = true;
      });
      startAll();
    };
    document.addEventListener("touchstart", unlock, { passive: true });
    document.addEventListener("pointerdown", unlock, { passive: true });

    // iOS pauses media when the app is backgrounded, and leaves it paused on return.
    const onVisible = () => {
      if (!document.hidden) startAll();
    };
    document.addEventListener("visibilitychange", onVisible);

    const retry = (event: Event) => start(event.currentTarget as HTMLVideoElement);
    players.forEach((player) => {
      observer.observe(player);
      player.addEventListener("loadeddata", retry);
      player.addEventListener("canplay", retry);
    });

    return () => {
      clearTimeout(watchdog);
      observer.disconnect();
      document.removeEventListener("touchstart", unlock);
      document.removeEventListener("pointerdown", unlock);
      document.removeEventListener("visibilitychange", onVisible);
      players.forEach((player) => {
        player.removeEventListener("loadeddata", retry);
        player.removeEventListener("canplay", retry);
      });
    };
  }, []);

  return (
    <section id="video" style={{ background: COLORS.darkBlue, padding: "100px 0" }}>
      <div data-reveal style={{ textAlign: "center", padding: "0 40px" }}>
        <p style={label(COLORS.gold)}>Take a Look</p>
        <h2 style={{ fontSize: "clamp(27px, 4.4vw, 40px)", fontWeight: 300, marginBottom: "20px", color: COLORS.offWhite }}>Inside Cunninghams</h2>
        <div style={divider} />
      </div>

      <div
        ref={frameRef}
        data-reveal
        className="video-frame"
        style={{
          position: "relative",
          width: "100%",
          overflow: "hidden",
          borderTop: "1px solid rgba(201, 168, 76, 0.35)",
          borderBottom: "1px solid rgba(201, 168, 76, 0.35)",
        }}
      >
        {/* Purely a wash of colour behind the row, and a fifth thing for a phone to decode.
            CSS drops it below 820px, where it is mostly hidden behind the stacked players. */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          tabIndex={-1}
          className="video-backdrop"
          poster={VIDEOS[0].poster}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "blur(36px) brightness(0.42) saturate(1.15)",
            transform: "scale(1.18)",
            pointerEvents: "none",
          }}
        >
          <source src={VIDEOS[0].src} type="video/mp4" />
        </video>

        <div className="video-row">
          {VIDEOS.map((video) => (
            <div key={video.src} className="video-cell">
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                className="video-player"
                poster={video.poster}
                style={{ objectFit: "cover", boxShadow: "0 0 70px rgba(0, 0, 0, 0.65)", pointerEvents: "none" }}
              >
                <source src={video.src} type="video/mp4" />
                Your browser does not support video playback.
              </video>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}

function Stars({ rating, size = "15px" }: { rating: number; size?: string }) {
  return (
    <span role="img" aria-label={`${rating} out of 5`} style={{ position: "relative", display: "inline-block", lineHeight: 1, whiteSpace: "nowrap", fontSize: size }}>
      <span aria-hidden="true" style={{ color: "rgba(245, 239, 224, 0.3)" }}>★★★★★</span>
      <span
        aria-hidden="true"
        style={{ position: "absolute", left: 0, top: 0, width: `${(rating / 5) * 100}%`, overflow: "hidden", color: COLORS.gold }}
      >
        ★★★★★
      </span>
    </span>
  );
}

function MoreReviews() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ marginTop: "26px" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="more-reviews"
        style={{
          font: "inherit",
          padding: "12px 30px",
          minHeight: "44px",
          border: `1px solid ${COLORS.gold}`,
          background: "transparent",
          color: COLORS.gold,
          fontSize: "12px",
          letterSpacing: "2px",
          textTransform: "uppercase",
          cursor: "pointer",
        }}
      >
        {open ? "Hide reviews" : "See more reviews"}
      </button>

      <div
        id="more-reviews"
        style={{
          display: open ? "grid" : "none",
          gap: "14px",
          maxWidth: "820px",
          margin: "26px auto 0",
          textAlign: "left",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        }}
      >
        {REVIEW_SOURCES.map((source) => (
          <a
            key={source.name}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              padding: "20px",
              border: "1px solid rgba(201, 168, 76, 0.45)",
              background: "rgba(5, 15, 50, 0.22)",
              color: COLORS.offWhite,
              textDecoration: "none",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px", marginBottom: "8px" }}>
              <span style={{ color: COLORS.gold, fontSize: "13px", letterSpacing: "2px", textTransform: "uppercase" }}>{source.name}</span>
              {source.rating !== undefined && (
                <>
                  <Stars rating={source.rating} />
                  <span style={{ color: "rgba(245, 239, 224, 0.75)", fontSize: "13px" }}>{source.rating.toFixed(1)}</span>
                </>
              )}
            </span>
            <span style={{ display: "block", fontSize: "15px", lineHeight: 1.6, marginBottom: "12px" }}>{source.detail}</span>
            <span style={{ display: "block", color: COLORS.gold, fontSize: "13px", letterSpacing: "1px" }}>Read reviews &rarr;</span>
          </a>
        ))}
      </div>
    </div>
  );
}

// The panel is always in the markup and only hidden with display, so search engines index the
// history even while it is collapsed. Nothing inside carries data-reveal: the reveal observer
// only ever runs on mount, and a hidden element never intersects, so it would stay invisible
// at opacity 0 after being expanded.
function FullStory() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ marginTop: "56px" }}>
      <div data-reveal style={{ textAlign: "center" }}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="full-story"
          style={{
            font: "inherit",
            padding: "14px 40px",
            border: `1px solid ${COLORS.darkRed}`,
            background: "transparent",
            color: COLORS.darkRed,
            letterSpacing: "2px",
            fontSize: "13px",
            textTransform: "uppercase",
            cursor: "pointer",
            transition: "background 0.3s, color 0.3s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = COLORS.darkRed;
            e.currentTarget.style.color = COLORS.offWhite;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = COLORS.darkRed;
          }}
        >
          {open ? "Show Less" : "Our Full Story"}
        </button>
      </div>

      <div
        id="full-story"
        style={{
          display: open ? "block" : "none",
          maxWidth: "760px",
          margin: "44px auto 0",
          textAlign: "left",
          borderTop: `1px solid rgba(107, 21, 21, 0.25)`,
          paddingTop: "44px",
        }}
      >
        {FULL_STORY.map((part) => (
          <div key={part.heading} style={{ marginBottom: "34px" }}>
            <h3 style={{ fontSize: "20px", fontWeight: 400, color: COLORS.darkBlue, marginBottom: "12px" }}>{part.heading}</h3>
            <p style={{ fontSize: "17px", lineHeight: 1.9, color: "#333" }}>{part.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// There is no mail server behind this site, so the form hands the finished message to the
// visitor's own email client rather than pretending to send it. The address is shown in the
// confirmation too, because a browser with no mail client configured does nothing visible.
// Same rule as FullStory: no data-reveal inside the panel, the observer only runs on mount.
function EventEnquiry() {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [guests, setGuests] = useState("");
  const [details, setDetails] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [handedOff, setHandedOff] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [open]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const found: Record<string, string> = {};
    if (!firstName.trim()) found.firstName = "Please enter your first name.";
    if (!surname.trim()) found.surname = "Please enter your surname.";
    if (!email.trim()) found.email = "Please enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) found.email = "That email address does not look right.";
    // A digit rather than a strict number: "about 30" and "20-30" are how people actually
    // answer this, and rejecting them would cost an enquiry to gain nothing.
    if (!guests.trim()) found.guests = "Please give us a rough number of guests.";
    else if (!/[0-9]/.test(guests)) found.guests = "Please include a number, even an approximate one.";
    if (!details.trim()) found.details = "Please tell us what you have in mind.";
    setErrors(found);
    if (Object.keys(found).length > 0) {
      const firstBad = ["firstName", "surname", "email", "guests", "details"].find((key) => found[key]);
      document.getElementById(`enquiry-${firstBad}`)?.focus();
      return;
    }

    const body = [
      `Name: ${firstName.trim()} ${surname.trim()}`,
      `Email: ${email.trim()}`,
      `Number of people: ${guests.trim()}`,
      "",
      "Enquiry:",
      details.trim(),
    ].join("\r\n");
    window.location.href = `mailto:${ENQUIRY_EMAIL}?subject=${encodeURIComponent("Event enquiry — The Pavillion")}&body=${encodeURIComponent(body)}`;
    setHandedOff(true);
  };

  const field = (
    key: string,
    label: string,
    value: string,
    set: (v: string) => void,
    type = "text",
    inputMode?: "numeric",
  ) => (
    <div className="enquiry-field">
      <label htmlFor={`enquiry-${key}`}>{label}</label>
      <input
        id={`enquiry-${key}`}
        type={type}
        inputMode={inputMode}
        value={value}
        autoComplete={key === "firstName" ? "given-name" : key === "surname" ? "family-name" : key === "email" ? "email" : "off"}
        aria-invalid={errors[key] ? true : undefined}
        aria-describedby={errors[key] ? `enquiry-${key}-error` : undefined}
        onChange={(e) => set(e.target.value)}
      />
      {errors[key] && (
        <span className="enquiry-error" id={`enquiry-${key}-error`}>
          {errors[key]}
        </span>
      )}
    </div>
  );

  return (
    <div style={{ marginTop: "56px" }}>
      <div data-reveal style={{ textAlign: "center" }}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="event-enquiry"
          style={{
            font: "inherit",
            padding: "14px 40px",
            border: `1px solid ${COLORS.darkRed}`,
            background: "transparent",
            color: COLORS.darkRed,
            letterSpacing: "2px",
            fontSize: "13px",
            textTransform: "uppercase",
            cursor: "pointer",
            transition: "background 0.3s, color 0.3s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = COLORS.darkRed;
            e.currentTarget.style.color = COLORS.offWhite;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = COLORS.darkRed;
          }}
        >
          {open ? "Close" : "Enquire About Events"}
        </button>
      </div>

      <div id="event-enquiry" ref={panelRef} className="enquiry-panel" style={{ display: open ? "block" : "none" }}>
        <p style={{ fontSize: "16px", lineHeight: 1.8, color: "#333", marginBottom: "28px" }}>
          Birthdays, parties, race days, work get-togethers &mdash; tell us what you have in mind and we will come back to you.
        </p>

        <form onSubmit={submit} noValidate>
          <div className="enquiry-row">
            {field("firstName", "First name", firstName, setFirstName)}
            {field("surname", "Surname", surname, setSurname)}
          </div>
          {field("email", "Email", email, setEmail, "email")}
          {field("guests", "How many people?", guests, setGuests, "text", "numeric")}

          <div className="enquiry-field">
            <label htmlFor="enquiry-details">What are you enquiring about?</label>
            <textarea
              id="enquiry-details"
              value={details}
              aria-invalid={errors.details ? true : undefined}
              aria-describedby={errors.details ? "enquiry-details-error" : undefined}
              onChange={(e) => setDetails(e.target.value)}
            />
            {errors.details && (
              <span className="enquiry-error" id="enquiry-details-error">
                {errors.details}
              </span>
            )}
          </div>

          <button
            type="submit"
            style={{
              font: "inherit",
              padding: "14px 40px",
              border: `1px solid ${COLORS.darkRed}`,
              background: COLORS.darkRed,
              color: COLORS.offWhite,
              letterSpacing: "2px",
              fontSize: "13px",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Send Enquiry
          </button>
        </form>

        <p aria-live="polite" style={{ fontSize: "15px", lineHeight: 1.8, color: "#333", marginTop: "24px" }}>
          {handedOff ? (
            <>
              Your email app should have opened with the message ready to send. If nothing happened, email us directly at{" "}
              <a href={`mailto:${ENQUIRY_EMAIL}`} style={{ color: COLORS.darkRed }}>
                {ENQUIRY_EMAIL}
              </a>{" "}
              or call {PHONE_DISPLAY}.
            </>
          ) : (
            ""
          )}
        </p>
      </div>
    </div>
  );
}

function useScrollReveal() {
  useEffect(() => {
    // The head script hid the sections and armed a timer to un-hide them if this never ran.
    // It did run, so the timer is not needed — but a failure from here on has to un-hide too.
    clearTimeout(window.__revealFailsafe);
    const revealAll = () => window.__dropRevealGate?.();

    const targets = Array.from(document.querySelectorAll("[data-reveal]"));
    if (!targets.length || !("IntersectionObserver" in window)) {
      revealAll();
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      revealAll();
      return;
    }

    // Nothing has been revealed yet, so a silent observer keeps the page blank. Mobile
    // browsers stop delivering these callbacks in a backgrounded or non-compositing tab,
    // and the first batch is otherwise reliable, so silence past a second means broken.
    let delivered = false;
    const watchdog = setTimeout(() => {
      if (!delivered) revealAll();
    }, 1000);

    const observer = new IntersectionObserver(
      (entries) => {
        delivered = true;
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      // Fires once the element's top edge is a little way into the viewport.
      // A threshold would never trigger for blocks taller than the screen.
      { threshold: 0, rootMargin: "0px 0px -12% 0px" },
    );

    targets.forEach((el) => observer.observe(el));
    return () => {
      clearTimeout(watchdog);
      observer.disconnect();
    };
  }, []);
}

// The fixed nav wraps onto more rows as the viewport narrows, so its height cannot be
// hardcoded. Publishing it lets anchor jumps land clear of it at every width.
function useNavHeight() {
  useEffect(() => {
    const nav = document.querySelector(".site-nav");
    if (!nav) return;

    const publish = () => {
      // An open menu makes the bar several hundred pixels tall. Publishing that would push
      // every anchor jump down by the height of a menu that closes on the way there, so the
      // measurement is only taken while the bar is at its resting height.
      if (nav.querySelector('.nav-links[data-open="true"]')) return;
      document.documentElement.style.setProperty("--nav-height", `${Math.round(nav.getBoundingClientRect().height)}px`);
    };

    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(nav);
    return () => observer.disconnect();
  }, []);
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  useScrollReveal();
  useNavHeight();

  // Escape closes the menu, matching what a keyboard user expects of any disclosure.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <>
      <a href="#top" className="skip-link">
        Skip to content
      </a>
      <header style={{ position: "fixed", top: 0, width: "100%", zIndex: 100 }}>
        <nav
          className="site-nav"
          style={{
            backgroundColor: "rgba(5, 15, 50, 0.97)",
            backdropFilter: "blur(8px)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(201, 168, 76, 0.2)",
          }}
        >
          <a
            href="#top"
            className="nav-brand"
            style={{
              display: "flex",
              alignItems: "center",
              fontFamily: SIGN_FONT,
              color: COLORS.gold,
              fontSize: "19px",
              letterSpacing: "1px",
              textDecoration: "none",
            }}
          >
            <Image
              src="/logo.webp"
              alt=""
              width={38}
              height={38}
              preload
              className="nav-logo"
              style={{ borderRadius: "50%", border: `1px solid ${COLORS.gold}`, flexShrink: 0 }}
            />
            <span className="nav-wordmark">CUNNINGHAMS</span>
          </a>
          <div className="nav-links" id="nav-links" data-open={menuOpen ? "true" : undefined}>
            {NAV_ITEMS.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={() => setMenuOpen(false)}
                style={{
                  color: COLORS.offWhite,
                  textDecoration: "none",
                  fontSize: "14px",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.gold)}
                onMouseLeave={(e) => (e.currentTarget.style.color = COLORS.offWhite)}
              >
                {item}
              </a>
            ))}
          </div>
          {/* Rooms is the secondary of the two, so it is outlined rather than filled: two solid
              gold blocks side by side compete, and the nav has little enough room as it is. */}
          <div className="nav-actions">
            {/* "Book a" is dropped on phones, where the two buttons plus a name plus a menu
                button do not fit otherwise. Beside each other in the bar, ROOM and TABLE
                still read as the two things you can book. */}
            <a className="nav-book is-secondary" href={ROOMS_URL} target="_blank" rel="noopener noreferrer">
              <span className="nav-book-verb">Book a </span>Room
            </a>
            <a className="nav-book" href={BOOKING_URL} target="_blank" rel="noopener noreferrer">
              <span className="nav-book-verb">Book a </span>Table
            </a>
            <button
              type="button"
              className="nav-toggle"
              aria-expanded={menuOpen}
              aria-controls="nav-links"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className="nav-toggle-bars" aria-hidden="true" />
              <span className="nav-toggle-text">Menu</span>
            </button>
          </div>
        </nav>
      </header>

      <main id="top">
        {/* Hero */}
        <section
          style={{
            position: "relative",
            minHeight: "100vh",
            background: COLORS.darkBlue,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            // The nav is fixed and grows to five rows on narrow screens, so a fixed top
            // padding clips the heading. --nav-height is measured at runtime by useNavHeight.
            padding: "calc(var(--nav-height, 84px) + 46px) 20px 90px",
            overflow: "hidden",
          }}
        >
          {/* On a tall phone, cover-cropping this landscape shot blows it up to ~3x the width the
              viewport implies, so sizes overstates the slot to pull in a larger source. */}
          <Image
            src="/hero-shopfront.webp"
            alt=""
            fill
            preload
            sizes="(max-width: 820px) 150vw, 100vw"
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
          <div
            aria-hidden="true"
            style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(5,15,50,0.92), rgba(14,10,10,0.68) 45%, rgba(5,15,50,0.93))" }}
          />
          <div style={{ position: "relative", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <p style={{ ...label(COLORS.gold), letterSpacing: "4px", fontSize: "13px", marginBottom: "20px", textShadow: HERO_SHADOW }}>
              Bar · Restaurant · Rooms · Kildare
            </p>
            <div style={{ display: "flex", alignItems: "baseline", gap: "20px", marginBottom: "24px", flexWrap: "wrap", justifyContent: "center" }}>
              <h1
                style={{
                  fontFamily: SIGN_FONT,
                  color: COLORS.gold,
                  fontSize: "clamp(26px, 8vw, 82px)",
                  fontWeight: 400,
                  letterSpacing: "clamp(1px, 0.3vw, 3px)",
                  lineHeight: 1.15,
                  margin: 0,
                  textShadow: HERO_SHADOW,
                }}
              >
                CUNNINGHAMS
              </h1>
              <span style={{ color: COLORS.gold, fontSize: "clamp(14px, 2vw, 22px)", letterSpacing: "3px", fontStyle: "italic", textShadow: HERO_SHADOW }}>
                Est. 1916
              </span>
            </div>
            <p style={{ color: COLORS.offWhite, fontSize: "18px", maxWidth: "520px", lineHeight: 1.7, marginBottom: "40px", textShadow: HERO_SHADOW }}>
              Award winning Gastro Pub, Supper Clubs &amp; Rooms
            </p>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
              <a
                href="#menu"
                style={{
                  padding: "14px 40px",
                  border: `1px solid ${COLORS.gold}`,
                  color: COLORS.gold,
                  textDecoration: "none",
                  letterSpacing: "2px",
                  fontSize: "13px",
                  textTransform: "uppercase",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = COLORS.gold;
                  e.currentTarget.style.color = COLORS.darkBlue;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = COLORS.gold;
                }}
              >
                View Our Menu
              </a>
              <a
                href={BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "14px 40px",
                  background: COLORS.gold,
                  color: COLORS.darkBlue,
                  textDecoration: "none",
                  letterSpacing: "2px",
                  fontSize: "13px",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = COLORS.goldLight)}
                onMouseLeave={(e) => (e.currentTarget.style.background = COLORS.gold)}
              >
                Book a Table
              </a>
            </div>
          </div>
        </section>

        {/* About */}
        <section id="about" style={{ padding: "clamp(64px, 9vw, 100px) clamp(20px, 5vw, 40px)", background: COLORS.offWhite }}>
          <div style={{ maxWidth: "1120px", margin: "0 auto" }}>
            <div data-reveal style={{ textAlign: "center" }}>
              <p style={label(COLORS.darkRed)}>Our Story</p>
              <h2 style={{ fontSize: "clamp(27px, 4.4vw, 40px)", fontWeight: 300, marginBottom: "24px", color: COLORS.darkBlue }}>The Round Tower House</h2>
              <div style={divider} />
            </div>
            <div className="split" data-stagger>
              <div data-reveal>
                <p style={{ fontSize: "17px", lineHeight: 1.9, color: "#333", marginBottom: "24px" }}>
                  Cunninghams has stood on the edge of Kildare&apos;s Market Square since 1916, in the building known as the Round Tower House. What began as a
                  village bar is now a bar, dining room and music venue under one roof.
                </p>
                <p style={{ fontSize: "17px", lineHeight: 1.9, color: "#333" }}>
                  Our kitchen celebrates ingredient-focused cooking &mdash; an extensive menu of Thai dishes alongside European and Irish classics. Old stone
                  walls, a large open fire, and a proper welcome. Upstairs is available for private events for up to 50 guests.
                </p>
              </div>
              <figure className="split-media" data-reveal>
                <Image
                  src="/shopfront.webp"
                  alt="The painted frontage of Cunninghams on Market Square, with hanging flower baskets above the gold M. Cunningham lettering"
                  width={1080}
                  height={760}
                  sizes="(max-width: 820px) 100vw, 560px"
                />
              </figure>
            </div>

            <FullStory />
          </div>
        </section>

        {/* Video */}
        <VenueVideo />

        {/* Accolade */}
        <div data-reveal style={{ background: COLORS.darkRed, padding: "56px 40px", textAlign: "center" }}>
          <div style={{ marginBottom: "14px" }}>
            <Stars rating={4.7} size="clamp(24px, 4.5vw, 34px)" />
          </div>
          <p style={{ color: COLORS.gold, fontSize: "clamp(18px, 3vw, 22px)", fontStyle: "italic", letterSpacing: "1px", marginBottom: "10px" }}>
            Rated 4.7 out of 5 on Google
          </p>
          <p style={{ color: "rgba(245, 239, 224, 0.75)", fontSize: "14px", lineHeight: 1.7 }}>
            Ranked #3 of 46 restaurants in Kildare on Tripadvisor
          </p>
          <MoreReviews />
        </div>

        {/* Menu */}
        <section id="menu" style={{ padding: "clamp(64px, 9vw, 100px) clamp(20px, 5vw, 40px)", background: COLORS.offWhite }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto", textAlign: "center" }}>
            <p data-reveal style={label(COLORS.darkRed)}>What We Serve</p>
            <h2 data-reveal style={{ fontSize: "clamp(27px, 4.4vw, 40px)", fontWeight: 300, marginBottom: "20px", color: COLORS.darkBlue }}>Our Menu</h2>
            <p data-reveal style={{ color: "#555", fontSize: "16px", maxWidth: "560px", margin: "0 auto 28px", lineHeight: 1.8 }}>
              Thai dishes and European classics, cooked to order.
            </p>
            <div data-reveal style={divider} />

            <div className="photo-row" data-stagger>
              {MENU_PHOTOS.map((photo) => (
                <figure key={photo.src} className="photo-card" data-reveal>
                  <Image src={photo.src} alt={photo.alt} width={800} height={600} sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 260px" />
                  <figcaption>{photo.caption}</figcaption>
                </figure>
              ))}
            </div>

            <div data-stagger style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(230px, 100%), 1fr))", gap: "44px", textAlign: "left" }}>
              {MENU.map((section) => (
                <div key={section.category} data-reveal>
                  <h3 style={{ fontSize: "20px", color: COLORS.darkBlue, marginBottom: section.note ? "8px" : "18px", paddingBottom: "12px", borderBottom: `2px solid ${COLORS.darkRed}` }}>
                    {section.category}
                  </h3>
                  {section.note && (
                    <p style={{ fontSize: "13px", color: "#666", fontStyle: "italic", lineHeight: 1.55, marginBottom: "16px" }}>{section.note}</p>
                  )}
                  <ul style={{ listStyle: "none" }}>
                    {section.items.map((item) => (
                      <li
                        key={item.name}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "baseline",
                          gap: "12px",
                          fontSize: "15px",
                          color: "#1a1a1a",
                          marginBottom: "11px",
                          lineHeight: 1.5,
                        }}
                      >
                        <span>
                          {item.name}
                          {item.desc && (
                            <span style={{ display: "block", fontSize: "13px", color: "#666", lineHeight: 1.5, marginTop: "3px" }}>{item.desc}</span>
                          )}
                        </span>
                        {item.price && (
                          <span style={{ color: COLORS.darkRed, fontWeight: 700, whiteSpace: "nowrap" }}>{item.price}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <p data-reveal style={{ marginTop: "40px", fontSize: "13px", color: "#666", fontStyle: "italic", lineHeight: 1.7 }}>
              Extra sides €4 · half and half portions €2.50 extra. Please talk to our staff about any dietary requirements or allergens.
            </p>
          </div>
        </section>

        {/* Drinks */}
        <section id="drinks" style={{ padding: "clamp(64px, 9vw, 100px) clamp(20px, 5vw, 40px)", background: COLORS.darkRed }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto", textAlign: "center" }}>
            <p data-reveal style={label(COLORS.gold)}>At the Bar</p>
            <h2 data-reveal style={{ fontSize: "clamp(27px, 4.4vw, 40px)", fontWeight: 300, marginBottom: "20px", color: COLORS.offWhite }}>Wine &amp; Spirits</h2>
            <p data-reveal style={{ color: "rgba(245, 239, 224, 0.8)", fontSize: "16px", maxWidth: "560px", margin: "0 auto 28px", lineHeight: 1.8 }}>
              A full bar with wines by the glass or bottle, Irish whiskey and gin, and ten taps.
            </p>
            <div data-reveal style={divider} />

            <div data-stagger style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(210px, 100%), 1fr))", gap: "44px", textAlign: "left" }}>
              {DRINKS.map((group) => (
                <div key={group.group} data-reveal>
                  <h3
                    style={{
                      color: COLORS.gold,
                      fontSize: "14px",
                      letterSpacing: "3px",
                      textTransform: "uppercase",
                      marginBottom: "18px",
                      paddingBottom: "12px",
                      borderBottom: "1px solid rgba(201, 168, 76, 0.4)",
                    }}
                  >
                    {group.group}
                  </h3>
                  <ul style={{ listStyle: "none" }}>
                    {group.items.map((item) => (
                      <li key={item} style={{ color: COLORS.offWhite, fontSize: "15px", marginBottom: "11px", lineHeight: 1.5 }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pavillion */}
        <section id="pavillion" style={{ padding: "clamp(64px, 9vw, 100px) clamp(20px, 5vw, 40px)", background: COLORS.offWhite }}>
          <div style={{ maxWidth: "1120px", margin: "0 auto" }}>
            <div data-reveal style={{ textAlign: "center" }}>
              <p style={label(COLORS.darkRed)}>Outside</p>
              <h2 style={{ fontSize: "clamp(27px, 4.4vw, 40px)", fontWeight: 300, marginBottom: "20px", color: COLORS.darkBlue }}>The Pavillion</h2>
              <p style={{ color: "#555", fontSize: "16px", maxWidth: "580px", margin: "0 auto 28px", lineHeight: 1.8 }}>
                Our covered outdoor bar &mdash; heated, roofed and open to the garden, whatever the weather is doing.
              </p>
              <div style={divider} />
            </div>

            <div className="split" data-stagger style={{ marginBottom: "60px" }}>
              <div data-reveal>
                <p style={{ fontSize: "17px", lineHeight: 1.9, color: "#333", marginBottom: "24px" }}>
                  Through the etched glass door off the main bar, the Pavillion is Cunninghams&apos; outdoor room: a long space under a painted timber roof, with a
                  tiled floor and one side open to the greenery. Radiant heaters run the length of the ceiling and there is a stove at the far end, so it stays
                  just as warm and inviting as inside, regardless of the weather.
                </p>
                <p style={{ fontSize: "17px", lineHeight: 1.9, color: "#333" }}>
                  It is also where the sport goes on. Screens along the walls carry racing, football, rugby and golf, and the walls are hung with racing prints
                  &mdash; only right, a few miles from the Curragh. Vintage enamel signs, an old wooden propeller and deep buttoned booths fill out the rest.
                </p>
              </div>
              <figure className="split-media" data-reveal>
                <Image
                  src="/pavilion-door.webp"
                  alt="The etched glass door into the Pavillion at Cunninghams, with tables and the timber roof beyond"
                  width={1024}
                  height={681}
                  sizes="(max-width: 820px) 100vw, 560px"
                />
              </figure>
            </div>

            <div
              data-stagger
              style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(260px, 100%), 1fr))", gap: "18px", textAlign: "center" }}
            >
              {PAVILION_PHOTOS.map((photo) => (
                <figure key={photo.src} className="photo-card" data-reveal>
                  <Image src={photo.src} alt={photo.alt} width={1024} height={681} sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 350px" />
                  <figcaption>{photo.caption}</figcaption>
                </figure>
              ))}
            </div>

            <EventEnquiry />
          </div>
        </section>

        {/* Live Music */}
        <section id="music" style={{ position: "relative", padding: "clamp(64px, 9vw, 100px) clamp(20px, 5vw, 40px)", background: COLORS.darkBlue, overflow: "hidden" }}>
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background: `url('${ASSETS}/bar-interior.webp') center/cover no-repeat`,
              opacity: 0.3,
            }}
          />
          <div
            aria-hidden="true"
            style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(5,15,50,0.72), rgba(5,15,50,0.5), rgba(5,15,50,0.82))" }}
          />
          <div style={{ position: "relative", maxWidth: "1000px", margin: "0 auto", textAlign: "center" }}>
            <p data-reveal style={label(COLORS.gold)}>In the Bar</p>
            <h2 data-reveal style={{ fontSize: "clamp(27px, 4.4vw, 40px)", fontWeight: 300, marginBottom: "20px", color: COLORS.offWhite }}>Live Music</h2>
            <p data-reveal style={{ color: "rgba(245, 239, 224, 0.8)", fontSize: "16px", maxWidth: "560px", margin: "0 auto 28px", lineHeight: 1.8 }}>
              A lively crowd of local trad musicians gather in the bar to entertain several nights a week.
            </p>
            <div data-reveal style={divider} />
            <div data-stagger style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px" }}>
              {MUSIC.map((night) => (
                <div
                  key={night.day}
                  data-reveal
                  style={{
                    border: "1px solid rgba(201, 168, 76, 0.3)",
                    background: "rgba(5, 15, 50, 0.55)",
                    backdropFilter: "blur(3px)",
                    padding: "32px 24px",
                    textAlign: "center",
                  }}
                >
                  <p style={{ color: COLORS.gold, fontSize: "12px", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "12px" }}>{night.day}</p>
                  <h3 style={{ color: COLORS.offWhite, fontSize: "22px", fontWeight: 300, marginBottom: "12px" }}>{night.act}</h3>
                  <p style={{ color: "rgba(245, 239, 224, 0.65)", fontSize: "14px", lineHeight: 1.7 }}>{night.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Rooms */}
        <section id="rooms" style={{ padding: "clamp(64px, 9vw, 100px) clamp(20px, 5vw, 40px)", background: COLORS.offWhite }}>
          <div style={{ maxWidth: "1120px", margin: "0 auto", textAlign: "center" }}>
            <p data-reveal style={label(COLORS.darkRed)}>Stay With Us</p>
            <h2 data-reveal style={{ fontSize: "clamp(27px, 4.4vw, 40px)", fontWeight: 300, marginBottom: "20px", color: COLORS.darkBlue }}>The Rooms at Cunninghams</h2>
            <p data-reveal style={{ color: "#555", fontSize: "16px", maxWidth: "600px", margin: "0 auto 28px", lineHeight: 1.8 }}>
              Ten boutique adults-only rooms in the heart of Kildare Town &mdash; minutes from Kildare Village and a short drive from the Curragh Racecourse.
            </p>
            <div data-reveal style={divider} />
            <div className="split" data-stagger style={{ marginBottom: "48px" }}>
              <figure className="split-media" data-reveal>
                <Image
                  src="/bedroom.webp"
                  alt="A guest room at Cunninghams with a buttoned headboard, crisp white bedding, linen cushions and a turned bedside lamp"
                  width={720}
                  height={900}
                  sizes="(max-width: 820px) 100vw, 560px"
                />
              </figure>
              <div data-reveal style={{ display: "grid", gap: "18px", textAlign: "left" }}>
                {ROOM_FEATURES.map((feature) => (
                  <div key={feature} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <span style={{ color: COLORS.gold, fontWeight: 700, lineHeight: 1.6 }}>&mdash;</span>
                    <span style={{ color: "#333", fontSize: "15px", lineHeight: 1.6 }}>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <a
              href={ROOMS_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-reveal
              style={{
                display: "inline-block",
                padding: "14px 40px",
                background: COLORS.darkRed,
                color: COLORS.offWhite,
                textDecoration: "none",
                letterSpacing: "2px",
                fontSize: "13px",
                textTransform: "uppercase",
                fontWeight: 700,
                transition: "background 0.3s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#8A1C1C")}
              onMouseLeave={(e) => (e.currentTarget.style.background = COLORS.darkRed)}
            >
              Book a Room
            </a>
          </div>
        </section>

        {/* Opening Hours */}
        <section id="hours" style={{ padding: "clamp(64px, 9vw, 100px) clamp(20px, 5vw, 40px)", background: COLORS.darkRed }}>
          <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
            <p data-reveal style={label(COLORS.gold)}>When to Find Us</p>
            <h2 data-reveal style={{ fontSize: "clamp(27px, 4.4vw, 40px)", fontWeight: 300, marginBottom: "16px", color: COLORS.offWhite }}>Opening Hours</h2>
            <div data-reveal style={divider} />
            <div data-stagger style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))", gap: "56px", textAlign: "left" }}>
              {[
                { title: "The Bar", rows: BAR_HOURS },
                { title: "The Kitchen", rows: KITCHEN_HOURS },
              ].map((table) => (
                <div key={table.title} data-reveal>
                  <h3
                    style={{
                      color: COLORS.gold,
                      fontSize: "14px",
                      letterSpacing: "3px",
                      textTransform: "uppercase",
                      marginBottom: "20px",
                      paddingBottom: "12px",
                      borderBottom: "1px solid rgba(201, 168, 76, 0.4)",
                    }}
                  >
                    {table.title}
                  </h3>
                  {table.rows.map((row) => (
                    <div
                      key={row.days}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "16px",
                        padding: "14px 0",
                        borderBottom: "1px solid rgba(201, 168, 76, 0.18)",
                        fontSize: "16px",
                      }}
                    >
                      <span style={{ color: COLORS.offWhite }}>{row.days}</span>
                      <span style={{ color: COLORS.gold, fontWeight: 700, whiteSpace: "nowrap" }}>{row.hours}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <p data-reveal style={{ color: "rgba(245, 239, 224, 0.7)", fontSize: "14px", marginTop: "36px", lineHeight: 1.7 }}>
              The kitchen closes earlier than the bar. Please call{" "}
              <a href="tel:+35345521780" style={{ color: COLORS.gold, textDecoration: "none", borderBottom: "1px solid rgba(201, 168, 76, 0.4)" }}>
                (045) 521 780
              </a>{" "}
              to confirm food service times.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" style={{ background: COLORS.darkBlue, padding: "clamp(64px, 9vw, 100px) clamp(20px, 5vw, 40px)", textAlign: "center" }}>
          <p data-reveal style={label(COLORS.gold)}>Get In Touch</p>
          <h2 data-reveal style={{ fontSize: "clamp(27px, 4.4vw, 40px)", fontWeight: 300, color: COLORS.offWhite, marginBottom: "16px" }}>Find Us</h2>
          <div data-reveal style={divider} />
          <div data-stagger style={{ display: "flex", justifyContent: "center", gap: "72px", flexWrap: "wrap", marginBottom: "56px" }}>
            <div data-reveal>
              <p style={{ color: COLORS.gold, fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "12px" }}>Address</p>
              <p style={{ color: COLORS.offWhite, lineHeight: 1.8 }}>
                Market Square
                <br />
                Kildare R51 FA07
                <br />
                County Kildare
              </p>
              <a
                href={DIRECTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  marginTop: "10px",
                  color: COLORS.gold,
                  fontSize: "13px",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  borderBottom: `1px solid rgba(201, 168, 76, 0.4)`,
                  paddingBottom: "2px",
                }}
              >
                Get directions
              </a>
            </div>
            <div data-reveal>
              <p style={{ color: COLORS.gold, fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "12px" }}>Phone</p>
              <a href="tel:+35345521780" style={{ color: COLORS.offWhite, lineHeight: 1.8, textDecoration: "none" }}>
                (045) 521 780
              </a>
            </div>
            <div data-reveal>
              <p style={{ color: COLORS.gold, fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "12px" }}>Email</p>
              <a href="mailto:info@cunninghamskildare.com" style={{ color: COLORS.offWhite, lineHeight: 1.8, textDecoration: "none" }}>
                info@cunninghamskildare.com
              </a>
            </div>
          </div>
          <div data-reveal style={{ display: "flex", justifyContent: "center", gap: "28px", flexWrap: "wrap" }}>
            {[
              { label: "Facebook", url: "https://www.facebook.com/cunninghams.bar" },
              { label: "Instagram", url: "https://www.instagram.com/cunninghams_bar" },
            ].map((social) => (
              <a
                key={social.label}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: COLORS.gold,
                  fontSize: "13px",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  borderBottom: "1px solid rgba(201, 168, 76, 0.4)",
                  paddingBottom: "3px",
                }}
              >
                {social.label}
              </a>
            ))}
          </div>
        </section>
      </main>

      <footer style={{ background: "#020818", padding: "24px 40px", textAlign: "center" }}>
        <p style={{ color: "rgba(245, 239, 224, 0.5)", fontSize: "13px" }}>
          © {new Date().getFullYear()} Cunninghams, Market Square, Kildare. All rights reserved.
        </p>
      </footer>
    </>
  );
}
