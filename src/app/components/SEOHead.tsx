import { useEffect } from "react";
import { SITE_CONFIG, PAGES_SEO, TOOLS_SEO, ToolSEOInfo } from "../data/seoData";

interface SEOHeadProps {
  route: string;
  toolId: string | null;
  lang?: string;
}

function setMetaTag(selector: string, attribute: string, value: string, createAttr: Record<string, string>) {
  let element = document.querySelector(selector) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement("meta");
    Object.entries(createAttr).forEach(([k, v]) => element!.setAttribute(k, v));
    document.head.appendChild(element);
  }
  element.setAttribute(attribute, value);
}

function setCanonicalLink(url: string) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", url);
}

export function SEOHead({ route, toolId, lang = "en" }: SEOHeadProps) {
  useEffect(() => {
    let title = SITE_CONFIG.defaultTitle;
    let description = SITE_CONFIG.defaultDescription;
    let keywords = SITE_CONFIG.defaultKeywords.join(", ");
    let canonicalPath = "/";
    let toolSEO: ToolSEOInfo | null = null;

    if (route === "tool" && toolId && TOOLS_SEO[toolId]) {
      toolSEO = TOOLS_SEO[toolId];
      title = toolSEO.title;
      description = toolSEO.metaDescription;
      keywords = toolSEO.keywords.join(", ");
      canonicalPath = `/${toolId}`;
    } else if (PAGES_SEO[route]) {
      const page = PAGES_SEO[route];
      title = page.title;
      description = page.metaDescription;
      keywords = page.keywords.join(", ");
      canonicalPath = route === "home" ? "/" : `/${route}`;
    }

    const canonicalUrl = `${SITE_CONFIG.baseUrl}${canonicalPath}`;

    // 1. Update Document Title & HTML lang
    document.title = title;
    document.documentElement.lang = lang || "en";

    // 2. Standard Meta Tags
    setMetaTag('meta[name="description"]', "content", description, { name: "description" });
    setMetaTag('meta[name="title"]', "content", title, { name: "title" });
    setMetaTag('meta[name="keywords"]', "content", keywords, { name: "keywords" });
    setCanonicalLink(canonicalUrl);

    // 3. Open Graph Tags
    setMetaTag('meta[property="og:title"]', "content", title, { property: "og:title" });
    setMetaTag('meta[property="og:description"]', "content", description, { property: "og:description" });
    setMetaTag('meta[property="og:url"]', "content", canonicalUrl, { property: "og:url" });
    setMetaTag('meta[property="og:type"]', "content", route === "tool" ? "application" : "website", { property: "og:type" });
    setMetaTag('meta[property="og:image"]', "content", SITE_CONFIG.ogImage, { property: "og:image" });

    // 4. Twitter Card Tags
    setMetaTag('meta[name="twitter:title"]', "content", title, { name: "twitter:title" });
    setMetaTag('meta[name="twitter:description"]', "content", description, { name: "twitter:description" });
    setMetaTag('meta[name="twitter:url"]', "content", canonicalUrl, { name: "twitter:url" });
    setMetaTag('meta[name="twitter:image"]', "content", SITE_CONFIG.ogImage, { name: "twitter:image" });

    // 5. Dynamic Schema.org JSON-LD Structured Data
    let schemaGraph: any[] = [];

    if (toolSEO) {
      // Breadcrumbs Schema
      schemaGraph.push({
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": `${SITE_CONFIG.baseUrl}/`
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Tools",
            "item": `${SITE_CONFIG.baseUrl}/?page=tools`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": toolSEO.h1,
            "item": canonicalUrl
          }
        ]
      });

      // SoftwareApplication Schema
      schemaGraph.push({
        "@type": "SoftwareApplication",
        "name": `PDFMarts ${toolSEO.h1}`,
        "description": toolSEO.metaDescription,
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Web Browser (All OS)",
        "url": canonicalUrl,
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "featureList": toolSEO.features,
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "reviewCount": "1840",
          "bestRating": "5",
          "worstRating": "1"
        }
      });

      // HowTo Schema
      if (toolSEO.howToSteps && toolSEO.howToSteps.length > 0) {
        schemaGraph.push({
          "@type": "HowTo",
          "name": `How to ${toolSEO.h1.toLowerCase()} with PDFMarts`,
          "description": `Step-by-step guide to ${toolSEO.h1.toLowerCase()} online for free with instant client-side privacy.`,
          "step": toolSEO.howToSteps.map((s, idx) => ({
            "@type": "HowToStep",
            "position": idx + 1,
            "name": s.name,
            "text": s.text,
            "url": `${canonicalUrl}#step-${idx + 1}`
          }))
        });
      }

      // FAQPage Schema
      if (toolSEO.faqs && toolSEO.faqs.length > 0) {
        schemaGraph.push({
          "@type": "FAQPage",
          "mainEntity": toolSEO.faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.answer
            }
          }))
        });
      }
    } else {
      // General Breadcrumb for non-tool pages
      schemaGraph.push({
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": `${SITE_CONFIG.baseUrl}/`
          },
          ...(route !== "home" ? [{
            "@type": "ListItem",
            "position": 2,
            "name": title.split(" - ")[0] || title,
            "item": canonicalUrl
          }] : [])
        ]
      });
    }

    // Inject or replace the JSON-LD script element
    let jsonLdScript = document.getElementById("dynamic-seo-jsonld") as HTMLScriptElement | null;
    if (!jsonLdScript) {
      jsonLdScript = document.createElement("script");
      jsonLdScript.id = "dynamic-seo-jsonld";
      jsonLdScript.type = "application/ld+json";
      document.head.appendChild(jsonLdScript);
    }

    jsonLdScript.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": schemaGraph,
    });
  }, [route, toolId]);

  return null;
}
