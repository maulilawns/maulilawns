# Mauli Lawns — Premium Wedding & Event Venue

Responsive venue website for Wagholi, Pune, built in the existing Lovable React + Vite + TypeScript + TanStack Start project. The existing router is retained for Lovable compatibility.

## Local development

```sh
npm install
npm run dev
```

```sh
npm run build
npm test
npx tsc --noEmit
```

## Pages

Home, About, Venues, `/venues/mini-lawn`, `/venues/grand-lawn`, Packages, Decor Themes, Events, Gallery, Contact, Privacy and `/admin`.

The contact form opens WhatsApp with the visitor's event details. Availability and booking are confirmed directly by the venue. There is no checkout or payment flow.

## Demo content management

Visit `/admin` to add, edit and remove venues, packages, categories, decor themes, gallery images and testimonials. Banner and contact settings are editable. Changes persist in this browser's localStorage and affect the public pages in the same browser. Settings includes a reset action.

This is an unauthenticated local demo, not a production CMS. A production admin needs authentication, server validation and a database. Image fields accept an existing asset key or an image URL. List fields take one item per line; FAQs take a JSON array of question/answer objects.

Photography, sample decor and sample testimonials are illustrative. Replace these with approved Mauli Lawns content before public launch. Confirm all facility inclusions and rental timings with the venue. The logo asset is preserved.

Lovable project: https://lovable.dev/projects/c29e855e-45c9-44ae-842f-0dc735001fa9

Do not rewrite published Git history on the connected branch.
