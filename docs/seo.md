# Search and favicon configuration

`data/seo.mjs` centrally defines each actual route's search purpose, unique title and description. Titles now name the landscaping topic directly; descriptions are concise and retain proposed-scope qualifications. No city, service area, confirmed availability, review, price or credential is invented. Coverage and offerings must be confirmed before adding geographic targeting or stronger service claims.

Every page includes an HTTPS canonical, one H1, unique metadata, Open Graph/X large-image cards, and factual Organization/WebSite/page/BreadcrumbList JSON-LD. Service detail breadcrumbs include Home → Services → the care category. Structured data identifies the new landscaping-only logo as a separate 512×512 ImageObject; illustrative page photography is identified separately. Proposed Service schema remains explicit about its status. There are no unsupported LocalBusiness or rating claims.

Ten indexable routes are represented in the image sitemap; 404 pages are excluded and noindex. Production robots allows crawling and references the sitemap. HTTPS/www/index-file and duplicate alias redirects lead to the canonical origin. Both missing routes and the direct branded error page return HTTP 404.

## Approved landscaping symbol

The logo contains three leaves above a geometric planting bed within a fine arch, with no MF lettering. It appears in the site identity, organization schema, social artwork and dedicated icons. `data/logo.json` is the vector source; `scripts/create-logo.mjs` generates full and compact SVG variants, and `scripts/create-social.ps1` renders PNG/ICO/social files from the same paths.

Favicon variants omit the inner arch and leaf-vein details and strengthen fine strokes for small sizes. Available files:

- `/favicon.ico`: 16, 32 and 48px PNG frames in one ICO.
- `/favicon.svg`: scalable compact emblem.
- `/favicon-16.png`, `/favicon-32.png`, `/favicon-48.png`, `/favicon-96.png`.
- `/apple-touch-icon.png`: 180px.
- `/favicon-192.png`, `/favicon-512.png` and `/site.webmanifest` for compatible browser bookmarks/install surfaces. Manifest display mode is browser; no offline application is claimed.

Page heads include the ICO, crawlable 96px PNG, SVG, Apple icon and manifest. Stable icon paths are used. Google recommends a square icon larger than 48px and notes that recrawling may take days or weeks; following the guidelines does not guarantee display. See [Google's favicon guidance](https://developers.google.com/search/docs/appearance/favicon-in-search) and [Organization structured data guidance](https://developers.google.com/search/docs/appearance/structured-data/organization).

## Verification and remaining account work

`npm run verify` checks local metadata, canonicals, schema, breadcrumbs, sitemap, assets, PNG dimensions and ICO frame structure. `node scripts/verify-live.mjs` checks live indexability, unique titles/descriptions, H1s, organization logo, canonical/social references, all icon bytes/MIME types, robots, redirects and real 404 responses.

Search Console ownership verification, sitemap submission and URL Inspection have not been performed. Those require the owner's connected account or a verification token. No indexing date or search ranking is promised. After ownership is verified, submit `https://mohfamlandscaping.com/sitemap.xml` and inspect the homepage to request a recrawl. Social platforms may also need their cached previews refreshed.
