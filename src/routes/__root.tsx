import { SiteProvider } from "@/data/store";
import { PublicLayout } from "@/components/site/pages";
import { MotionConfig } from "framer-motion";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="eyebrow">404</p>
        <h1 className="heading-display mt-4 text-5xl">This page has wandered off the lawn</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="btn-gold inline-flex items-center justify-center rounded-full px-8 py-3 text-xs"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="heading-display text-4xl">This page didn't load</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="btn-gold rounded-full px-8 py-3 text-xs"
          >
            Try again
          </button>
          <a href="/" className="btn-navy rounded-full px-8 py-3 text-xs">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        title: "Mauli Lawns — Premium Wedding & Event Venue in Wagholi, Pune",
      },
      {
        name: "description",
        content:
          "Mauli Lawns is a premium open-air wedding and event venue on Wagholi–Lohegaon Road, Pune. Two beautiful lawns for 50–700 guests. Enquire on WhatsApp today.",
      },
      { property: "og:title", content: "Mauli Lawns — Where Beautiful Celebrations Begin" },
      {
        property: "og:description",
        content:
          "Premium wedding & event venue in Wagholi, Pune. Intimate gatherings to grand weddings of 700 guests.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#172B4D" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Manrope:wght@400;500;600;700;800&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": ["LocalBusiness", "EventVenue"],
              name: "Mauli Lawns",
              telephone: "+919604310054",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Wagholi-Lohegaon Road, In front of Rohan Abhilasha Society",
                addressLocality: "Wagholi, Pune",
                addressRegion: "Maharashtra",
                postalCode: "412207",
                addressCountry: "IN",
              },
            }),
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <MotionConfig reducedMotion="user">
        <SiteProvider>
          {path.startsWith("/admin") ? (
            <Outlet />
          ) : (
            <PublicLayout>
              <Outlet />
            </PublicLayout>
          )}
        </SiteProvider>
      </MotionConfig>
    </QueryClientProvider>
  );
}
