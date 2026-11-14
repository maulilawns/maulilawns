# Mauli Lawns — Project Work Report

Report date: 13 November 2026

**Completed work**

1. Updated the home-page banner with the supplied drone photograph and adjusted the overlay.
2. Replaced venue photographs with the supplied Mini Lawn and Grand Lawn images.
3. Formatted the contact number as 92 54 24 54 54 while retaining working call links.
4. Updated home-page capacity labels to 100–700 guests + 200 floating guests.
5. Changed navigation labels to sentence case and improved text sizing and spacing.
6. Kept the navbar height and logo size consistent while scrolling, and improved header-brand visibility.
7. Standardized body paragraphs to 16px, improved line spacing and justified descriptive content.
8. Restored heading colors and corrected text contrast in the footer.
9. Reduced footer padding, logo/text sizing and spacing above the footer.
10. Added the linked Webakoof design credit and centered the privacy/copyright row.
11. Removed the public Admin (Demo) footer link and matched footer links to actual pages, venues and events.
12. Redesigned the Privacy Policy page with readable sections, section links and contact information.
13. Removed pricing from Mini Lawn and Grand Lawn detail pages, including the Grand Lawn pricing FAQ.
14. Organized 17 supplied photographs as optimized WEBP assets with captions and categories.
15. Configured gallery filtering, lightbox controls and featured selections, and prepared a repeat-safe photo importer.
16. Prepared the MySQL schema with six required tables and five initial gallery categories.
17. Prepared seed.sql for initial administrator creation using a bcrypt password hash; repeated imports preserve existing administrator passwords.
18. Prepared private production environment files with database, session, port, storage and proxy settings.
19. Configured Hostinger deployment with Node.js 24.x, Express, npm and the root server.js entry.
20. Added automatic website building during installation through MAULI_BUILD_SITE=true.
21. Combined website pages, API endpoints and uploaded files under one application and domain.
22. Diagnosed deployment failures caused by the missing entry file, storage settings and database tables, and supplied the corresponding fixes.
23. Configured an uploads directory outside versioned deployment folders and the public /uploads URL.
24. Diagnosed the admin session-expired error and updated HTTPS proxy configuration; a Secure, HTTP-only session cookie was confirmed in the live check.
25. Checked 12 public pages at mobile/tablet widths, fixed the faint menu icon and WhatsApp/enquiry-bar overlap, and verified footer clearance.
26. Passed TypeScript checks, 20 frontend tests and seven server/security/routing tests.
27. Locally verified CSS/JavaScript loading, 17 gallery images, mobile navigation, venue pages, admin login and WhatsApp enquiry handoff without sending a message.
28. Confirmed that the live home page, venue pages, privacy page, admin login page and backend health endpoint respond successfully.

**Pending verification / setup**

1. Confirm the complete production administrator sign-in/logout workflow and account setup if not already completed.
2. Upload/import and publish production gallery photos. The last live check returned zero published photographs.
3. Verify production image uploads and confirm that stored photos survive a restart/redeployment.
4. Enter the administrator’s real email address where required.

**Scope notes**

1. MySQL currently stores gallery and administrator/session data. Other original content-editor changes still use browser-local storage.
2. Enquiries use WhatsApp. Online checkout, payment processing and automatic booking confirmation are not implemented.
