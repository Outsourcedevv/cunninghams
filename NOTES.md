# Notes

Working notes for this site. Last updated 2026-08-19.

## Previewing changes

Two servers, both defined in `.claude/launch.json`:

```bash
npm run dev      # :3000 — live-updating dev server
npm run preview  # :4000 — builds and serves out/, byte-for-byte what deploys
```

**Use `:4000` when testing on a phone.** The dev server has a fault where a dev-only
chunk fails to load on some phones, so React never hydrates and interactive parts of the
page look broken while the shipped build is fine. A whole debugging session went into
that before it was understood. `:4000` is also the accurate preview, since the live site
is a static export.

Both are reachable from a phone on the same WiFi at `http://<laptop-ip>:4000`. The IP
changes between networks — check it with `ipconfig` rather than reusing an old one.

## Deploying

`.github/workflows/deploy.yml` runs on push to `main` and publishes to
https://outsourcedevv.github.io/cunninghams/. Nothing deploys without a push.

The workflow sets `NEXT_PUBLIC_BASE_PATH=/cunninghams`, which is why plain `<source>`
and `<img>` paths in `page.tsx` prefix `ASSETS` by hand — `next/image` applies the base
path itself, raw tags do not.

## Two conventions worth keeping

**Hiding content is always gated on a script having run.** The scroll reveal starts
elements at `opacity: 0`, but that rule only applies because the head script in
`layout.tsx` injects it. No JavaScript means nothing hides. The same pattern gates the
mobile nav menu. This exists because the page once rendered as bare section colours on
mobile when hydration failed — the content was there, invisible, with nothing able to
reveal it.

**Videos carry the `autoplay` attribute.** Playback used to depend entirely on hydration
calling `play()`, so on a phone where scripts did not run the videos showed nothing at
all. The IntersectionObserver still pauses off-screen players; `autoplay` is the floor
underneath it. Each clip also has a poster frame so a player that has not decoded yet
shows a still rather than the section colour.

## Menu prices

The menu in `page.tsx` is transcribed from the **dine-in** card (`Prices.jpg`).

There is also a **takeaway** card, and it is a different, much cheaper menu — beef burger
€12.95 there against €20.50 dine-in. Do not mix them. Takeaway prices were briefly
published by mistake.

Noodles and curries are priced by protein choice, so those categories carry a note
instead of per-dish prices. "Coeliac friendly" marks appear only on the takeaway card and
are deliberately absent here.

Before this, the site listed dishes the kitchen does not serve — apparently placeholder
content that survived into production.

## Open items

- **Pavillion photos.** The four images in that section need replacing, but no usable
  source exists publicly. Instagram story frames are 640px (below what is already here)
  and mostly have promotional text across them; Instagram video frames cannot be captured
  at all; RestaurantGuru only has watermarked composites. What is needed is three or four
  photos of the room taken on a phone.
- **Two photos on the Google Business listing are not this pub** — a night exterior that
  is Harte's of Kildare, and a modern café. Worth removing from the listing.
- **Ratings are a snapshot** and will drift: Google 4.7, Tripadvisor 4.5 and "#3 of 46 in
  Kildare", Dish Cult 4.9. Review counts are deliberately left off because they move fast.
- **The hero crops to a vertical slice on phones**, cutting the signage mid-word, because
  it is a landscape photo in a full-height hero. A separate portrait crop for mobile would
  fix it properly.
