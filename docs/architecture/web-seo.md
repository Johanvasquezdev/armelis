# Armelis Web SEO and Sharing

## Goal

Armelis should have a trustworthy, accessible, indexable web surface without exposing scan data or private repository details.

## Requirements

### Open Graph images

- Define a default Armelis Open Graph image with the official dark navy, electric-blue, and white brand direction.
- Use a dedicated image for the landing page and safe generic images for public product pages.
- Never include repository names, findings, secrets, file paths, or private scan data in generated images.
- Provide `og:title`, `og:description`, `og:image`, `og:url`, and `og:type`.
- Provide equivalent Twitter/X card metadata.

### Custom 404 page

- Use a branded but useful 404 page.
- Explain that the requested page was not found.
- Provide links to the dashboard or home page.
- Use semantic `main`, `h1`, and navigation elements.
- Do not reveal internal routes, project identifiers, or scan metadata.

### Page-specific metadata

Every public page must define its own:

- title
- description
- canonical URL
- Open Graph title and description

Recommended title pattern:

```text
Page Name | Armelis
```

The root page may use the product title without duplication. Private dashboard pages should use metadata appropriate to authenticated users and should not be indexed.

### Semantic HTML

Use meaningful HTML elements:

- `header` for global identity and navigation.
- `nav` for navigation groups.
- `main` for the page’s primary content.
- `section` for related content with a heading.
- `article` for independent finding or report summaries.
- `aside` for supporting context.
- `footer` for secondary navigation and legal links.

Do not use clickable `div` elements where a button or link is appropriate. Preserve keyboard focus and visible focus states.

### Canonical tags

- Every indexable public route gets one absolute canonical URL.
- Normalize trailing slashes consistently.
- Exclude query-string variants from canonical URLs unless the query is part of the content identity.
- Never canonicalize private scan URLs to public pages.

### robots.txt

The generated file should:

- Allow public marketing and documentation pages.
- Disallow authenticated dashboard, scan, finding, API, and internal job routes.
- Reference the sitemap URL.

Example policy:

```text
User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /scans
Disallow: /findings
Disallow: /api
Sitemap: https://armelis.example/sitemap.xml
```

The production hostname must come from configuration, never from untrusted request input.

### llm.txt

Publish a concise machine-readable guide for AI systems covering:

- What Armelis is.
- Public documentation and product pages.
- Preferred terminology: Armelis is the current name; ThreatGraph is the former project name.
- The difference between scanner evidence and Armelis analysis.
- Public contact or documentation links.

Do not include private routes, credentials, scan results, customer data, internal architecture secrets, or unsupported claims.

### Sitemap

Generate a sitemap containing only public, indexable routes:

- home
- public product overview
- public documentation
- public security methodology
- public contact/about pages

Do not include query variants, authenticated pages, repository paths, finding IDs, or scan IDs.

## Next.js implementation plan

When `apps/web` is created, use the App Router metadata APIs:

- `app/layout.tsx` for defaults and shared Open Graph metadata.
- Per-route `metadata` or `generateMetadata` for titles, descriptions, and canonicals.
- `app/opengraph-image.tsx` for the default generated image.
- `app/not-found.tsx` for the custom 404 page.
- `app/robots.ts` for `robots.txt`.
- `app/sitemap.ts` for `sitemap.xml`.
- `public/llm.txt` or a route handler for `llm.txt`.

## Acceptance criteria

- Every public page has a unique title and description.
- Every public page has exactly one canonical URL.
- Open Graph previews render with the Armelis brand.
- 404 responses use the custom page and remain keyboard accessible.
- Semantic landmarks are present and headings are ordered correctly.
- Robots excludes private surfaces.
- Sitemap contains only public routes.
- `llm.txt` contains no private or sensitive information.
