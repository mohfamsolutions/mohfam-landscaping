# MohFam Landscaping

Independent 11-page website at **https://mohfamlandscaping.com**. Other MohFam website sources remain unchanged. Hosting mapping, deployment and email limitations are documented in [docs/deployment.md](docs/deployment.md).

## Run locally

Requires Node 22 or newer. The locked FTPS deployment dependency is installed with `npm.cmd ci`.

```powershell
npm.cmd ci
npm.cmd run build
npm.cmd run dev
```

Open **http://127.0.0.1:4175**. On Windows, `npm.cmd` avoids PowerShell execution-policy restrictions. The preview has noindex headers and a clear disabled-mail response. Stop the server with Ctrl+C. For the complete PHP form security flow, use PHP 8.2+:

```powershell
$env:LANDSCAPING_LOCAL_TEST='1'
$env:LANDSCAPING_MAIL_ENABLED='0'
php -S 127.0.0.1:4176 -t dist scripts/router.php
```

## Content and identity

`data/site.mjs` owns confirmed contacts, proposed scopes, FAQs, footer and family links. `data/seo.mjs` owns page metadata and search purpose. `scripts/build.mjs` composes page-specific layouts. The landscaping logo uses a custom serif MF monogram, a fine double arch inspired by a garden entrance, and a botanical sprig on charcoal. The user requested a premium MF identity related to the Pool Cleaning refinement, with a distinct landscaping composition. `data/logo.json` is the shared vector source for the SVG, organization PNG and social-card rendering; regenerate with `scripts/create-social.ps1`. Local Inter, photography and shared app artwork complete the assets.

Pages: Home, About, Services, four proposed care scopes (lawn/grounds, garden/planting, seasonal cleanup, irrigation), Properties, Contact, Privacy and branded 404. Service scopes and property audiences are explicitly proposed. Areas, hours, prices, launch timing, credentials, availability and project history are not asserted.

Family reference: Pool Cleaning screenshot/source reviewed locally; parent repository marks Landscaping coming soon. The retired `mohfamcleaning.com` is not used in family navigation; parent documentation names `mohfamcommercialcleaning.com` as current. The old domain's live redirect was not verified or modified.

## SEO and publication boundary

Production origin is `https://mohfamlandscaping.com`, recorded in `deployment.json` after independent FTPS/HTTPS marker verification. Production metadata, robots and sitemap use this origin. The local Node preview always adds noindex headers.

The build generates unique metadata, OG/X cards, Organization/WebSite/WebPage/BreadcrumbList schema, explicitly proposed Service descriptions and an image sitemap from actual routes. There are no ratings, unsupported LocalBusiness facts, city keywords or automatic modification dates. Eleven committed social JPEGs are 1200×630 and below 300 KB. A separate 512×512 PNG is used for the organization logo. Regenerate assets with `powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/create-social.ps1` on Windows; inspect representative results after regeneration.

The landscaping folder's `.htaccess` redirects HTTP, www, explicit index files and its duplicate Security-domain subfolder alias to the canonical domain. `404.php` returns the branded page with a genuine 404 status on Apache. No parent-directory or other website configuration is edited.

GitHub Actions CI builds, verifies and tests. Manual `Deploy verified landscaping site` uses the dedicated `landscaping-production` environment, revalidates the HTTPS and FTPS identity marker, backs up current content, uploads without deletion and checks live routes/assets/redirects. Credentials are stored only in environment secrets. Read [deployment details](docs/deployment.md) before operating the workflow.

## Form security

The disabled-by-default PHP endpoint has bounded scalar validation, email validation, CRLF/header-injection rejection, origin checks, CSRF sessions, consent and enum validation, honeypot, minimum completion time, and five-attempt/hour network-address rate limiting. Temporary rate records are stored outside the web root. The browser preserves fields after all failures and stores no drafts. It clears fields only after mail-server acceptance, which is described accurately and does not establish inbox delivery.

Recipient and subject prefix are server-owned: `mohfamsolutions@gmail.com`, `[MohFam Landscaping]`. Reply-To is the validated visitor email. `scripts/prepare-production.mjs` generates non-secret Apache mail configuration from the verified origin; mail remains disabled until `inboxDeliveryVerified` is recorded. Never set `LANDSCAPING_LOCAL_TEST=1` on hosting. An authorized synthetic test was accepted by the relay, but inbox delivery has not been verified. DNS currently lacks SPF and the checked default DKIM selector, while DMARC requests quarantine; no DNS was changed. See the deployment document for test references and follow-up.

## Checks

```powershell
npm.cmd run build
npm.cmd run verify
$env:PHP_BIN='C:\path\to\php.exe' # omit if php is on PATH
npm.cmd test
```

Verification checks routes, internal assets, one H1, unique metadata, JSON-LD, control targets, sitemap, QR SHA-256, separate logo and every social image. Tests exercise HTTP statuses, deployment lock and the actual PHP endpoint's origin/CSRF/validation/spam/disabled-mail/rate-limit boundaries with synthetic data. No real email is sent.

Browser access was unavailable and native Chrome capture timed out during deployment. Responsive CSS, semantic controls and reduced-motion behavior are implemented; actual rendered desktop/mobile, keyboard, contrast, overflow and browser-console checks remain pending. Photographs and representative social cards were visually inspected as local images. `node scripts/verify-live.mjs` checks hosted HTTPS pages, social images, shared assets, canonical redirects, real 404s and the inquiry endpoint.

## Asset provenance

- Original local emblem: `public/assets/landscaping-emblem.svg`; raster organization version generated from the same composition.
- Approved Security QR copied byte-for-byte from the local Pool Cleaning checkout. Original: `https://mohfamsecurity.com/wp-content/uploads/2026/09/mohfam-app-qr-code.png`. SHA-256 `9ce2fe3736a5a2b074e25c2de98ce6f7185223502dbfe904db910f757aa66214`; prior source documents decoding to `https://apps.apple.com/app/id6793692825`.
- App badge and screenshot: same Security uploads directory, `download-on-the-app-store-badge.png`, `mohfam-app-home-screen-473x1024.jpg`, copied locally from Pool Cleaning.
- Local Inter WOFF2 and included SIL OFL license copied from Pool Cleaning. Display headings use system Georgia; social card text uses Windows Georgia and Segoe UI.
- Illustrative Unsplash photographs: `photo-1416879595882-3373a0480b5b` (potting tools), `photo-1558904541-efa843a96f01` (lawn/grounds), `photo-1598902108854-10e335adac99` (woodland garden), `photo-1585320806297-9794b3e4eeae` (flowering garden path used in the hero). Photo panels never represent verified client work.
