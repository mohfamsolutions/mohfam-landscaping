# Landscaping production deployment

The user authorized hosting setup and deployment on 2026-10-30 (Asia/Taipei).

## Verified destination

- Domain: `https://mohfamlandscaping.com`, publicly resolving to `148.72.28.253`.
- Dedicated FTPS username: `mohfamlandscaping@mohfamlandscaping.com`.
- Supplied `ftp.mohfamsecurity.com` returns NXDOMAIN. Certificate-validated provider hostname `p3plmcpnl503624.prod.phx3.secureserver.net` accepts this dedicated account over explicit FTPS on port 21.
- Account opens at `/`, initially containing only `.well-known`, `cgi-bin` and `.ftpquota`.
- A unique landscaping identity marker was uploaded through this account and retrieved over valid HTTPS from the landscaping domain. Configuration and marker are recorded in `deployment.json`. No other division's directory was used.
- The same marker was accessible under `https://mohfamsecurity.com/mohfamlandscaping.com/`. This duplicate alias is redirected from this landscaping folder's own `.htaccess`; the Security source and parent configuration were not edited.

## GitHub workflow

Repository: `mohfamsolutions/mohfam-landscaping`. GitHub environment: `landscaping-production`.

Environment secrets `FTP_USERNAME` and `FTP_PASSWORD` hold only the dedicated landscaping credentials. Environment variable `FTP_VERIFIED_DIRECTORY=/` must match the reviewed configuration. Passwords are passed via stdin and never written to source, arguments or logs.

CI installs the locked dependencies, builds, verifies, lints PHP and runs integration tests. Manual `Deploy verified landscaping site` runs those checks, verifies HTTPS and FTPS identity markers, backs up existing site files as an artifact, uploads without remote deletion and runs live checks. TLS validation remains enabled. Uploads are not atomic; a partially failed upload can be retried with the same verified configuration.

## Mail and DNS

Email stays disabled in the published build until inbox delivery is verified. Visitors see the phone and direct email links and an honest unavailable-form message; fields remain intact after errors.

DNS inspection found no apex TXT/SPF, no MX, no `default._domainkey` record, and DMARC `v=DMARC1; p=quarantine; adkim=r; aspf=r; rua=mailto:dmarc_rua@onsecureserver.net;`. Absence of the default selector alone does not prove that every possible DKIM selector is absent. DNS was not changed.

An authorized synthetic test was accepted by PHP mail with application reference `LAND-0011479678` and body reference `LAND-DEPLOY-0079F857`. The test temporarily enabled mail and restored the disabled production setting in `finally`. Acceptance is not inbox proof. Gmail in `mohfamsolutions@gmail.com` must be checked for this exact message and its authentication results before marking delivery verified.

Next: obtain the provider's actual sending relay and DKIM selector/key, authorize the relay in SPF, configure aligned signing, and repeat the inbox test. Do not guess DNS values or weaken DMARC to hide delivery failures.

## Remaining business and QA review

Service scopes, coverage, hours, property audiences, availability and privacy retention details remain unconfirmed; public descriptions retain proposed-scope labels. No prices, reviews or credentials are invented.

Browser/Windows capture tools timed out during this deployment session, so rendered desktop/mobile, interactive keyboard, reduced-motion and browser-console verification remain pending. Automated HTTP, assets, redirects, schema, metadata, 404 and PHP checks provide separate evidence; they do not replace visual QA.
