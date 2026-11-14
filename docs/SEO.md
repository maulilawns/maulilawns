# SEO implementation

Canonical production origin: https://maulilawns.com.

Metadata is centralized in src/lib/seo.ts and emitted through each existing TanStack Start route's head function. The same title, description, canonical, Open Graph, Twitter and JSON-LD output is present in server-rendered HTML and after client navigation. The root supplies noindex defaults for unknown/private pages; public route metadata explicitly allows indexing.

Public URLs: /, /about, /venues, /venues/mini-lawn, /venues/grand-lawn, /packages, /events, /facilities, /gallery, /contact, /decor-themes, /privacy. Six individual event types remain sections on /events; they are not separate pages and are not listed as fictitious routes in the sitemap.

Keyword focus follows the page: wedding lawns in Wagholi on home and venues; small events on Mini Lawn; grand weddings on Grand Lawn; packages on /packages; event types on /events; booking enquiries on /contact. No unsupported superlatives, ratings or availability claims were added.

The LocalBusiness/EventVenue schema uses the existing business address and telephone. WebSite appears on home and BreadcrumbList on inner public pages. Pricing, reviews and opening hours are omitted. Hero images load eagerly; existing below-fold images remain lazy. No asset URLs were renamed.

Production verification:

1. Build with NODE_ENV=production npm run build:hostinger:site.
2. Start the production build with the configured database and storage. For a separate local verification port use API_PORT=3002 node server.js.
3. Run TEST_BASE_URL=http://localhost:3002 node scripts/verify-seo.mjs. Set PLAYWRIGHT_EXECUTABLE_PATH to an installed Chromium executable if needed.

The check validates 12 server-rendered pages, exact titles, unique descriptions, one H1 per page, canonical and social tags, image alt attributes, JSON-LD, internal links, sitemap URLs, robots rules, private noindex and actual HTTP 404 responses. Browser requests to GTM are intercepted during verification.

Manual follow-up after deployment:

- Submit https://maulilawns.com/sitemap.xml in the verified Google Search Console property and inspect representative URLs.
- Validate deployed structured data with Google's Rich Results Test / Schema Markup Validator; recognition of a schema type does not guarantee a rich result.
- Confirm HTTPS and the preferred apex/www redirect in hosting. Canonicals consistently use the apex domain.
- Keep business name, address and phone aligned with the verified Google Business Profile. Confirm the existing address with the owner before changing it.
- Maintain real production gallery photos and descriptive captions/alt text through the content studio.

Search ranking and indexing are controlled by search engines and are not guaranteed by these changes.

## Temporary Coming Soon mode

Public requests to maulilawns.com and www.maulilawns.com currently display the Mauli Lawns Coming Soon page. Existing public subpages are also covered. Local development, admin access, API endpoints and image assets remain available. The temporary response uses HTTP 503, Retry-After and no-store headers. To launch the complete website again, set COMING_SOON=false in the hosting environment and restart the application. Remove that override or set COMING_SOON=true to restore the coming-soon screen.
