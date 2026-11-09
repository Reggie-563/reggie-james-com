import fs from "node:fs";
const read = (f) => JSON.parse(fs.readFileSync(new URL(f, import.meta.url)));

export default function () {
  const site = read("./site.json"), clips = read("./clips.json"), faqs = read("./faqs.json");
  const u = site.url, s = site.social, id = (k) => ({ "@id": `${u}/#${k}` });
  const today = new Date().toISOString().slice(0, 10);
  const graph = [
    { "@type": "WebSite", "@id": `${u}/#website`, url: `${u}/`, name: "Reggie James", inLanguage: "en-GB", publisher: id("person") },
    { "@type": "ProfilePage", "@id": `${u}/#webpage`, url: `${u}/`, name: site.title, description: site.description, isPartOf: id("website"), about: id("person"), mainEntity: id("person"), primaryImageOfPage: id("portrait"), inLanguage: "en-GB", dateModified: today },
    { "@type": "ImageObject", "@id": `${u}/#portrait`, url: `${u}/assets/img/hero.webp`, contentUrl: `${u}/assets/img/hero.webp`, width: 1122, height: 1402, caption: "Reggie James" },
    {
      "@type": "Person", "@id": `${u}/#person`, name: "Reggie James", url: `${u}/`, image: id("portrait"),
      jobTitle: "Go-to-market and growth adviser to B2B tech leaders and investors; Founder, Digital Clarity; COO and Executive Director, DBMM Group Inc.",
      description: "UK go-to-market and growth adviser to B2B technology leaders and the investors who back them. 25 years in technology markets: founded Digital Clarity in 2002, built DC Storm through to its acquisition by Rakuten, led commercial operations for an internet business listed in Singapore, and since 2011 has served as COO, Senior Vice President and Executive Director of Digital Brand Media & Marketing Group, Inc. (OTC: DBMM). Earlier commercial roles at AltaVista, VNU and Ziff Davis.",
      worksFor: [id("digital-clarity"), id("dbmm")],
      knowsAbout: ["Commercial strategy", "Board and CEO advisory", "Growth strategy", "Commercial due diligence", "Portfolio value creation", "Go-to-market strategy", "B2B marketing", "Business development", "Proposition development", "Positioning", "Product commercialisation", "Market entry", "Brand strategy", "Applied AI", "AI search and the B2B buyer journey", "Sales and marketing alignment", "Partnerships", "Public-company governance"],
      homeLocation: { "@type": "Place", name: "Guildford, Surrey, United Kingdom" },
      workLocation: { "@type": "Place", name: "London, United Kingdom" },
      makesOffer: [
        ["Go-to-market strategy", "For B2B technology companies: ideal customer and segment priorities, positioning and proposition, pricing and packaging, sales motion and channels, and a 90-day plan. Starts with a fixed-fee go-to-market review."],
        ["Marketing that drives pipeline", "Messaging for senior buyers, a demand and pipeline model tied to revenue targets, content and channel plans, AI search visibility and board-level reporting."],
        ["Execution and commercial leadership", "Hands-on leadership of sales and marketing, alignment with product, commercial team structure and partner management, on a monthly or fractional executive basis."],
        ["Commercial due diligence and portfolio growth", "For investors in B2B technology: pre-deal commercial and go-to-market assessment, 100-day growth plans and go-to-market reviews across a portfolio."]
      ].map(([name, description]) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name, description, provider: id("person"), areaServed: ["United Kingdom", "Europe", "United States"] } })),
      sameAs: [s.linkedin, s.instagram, s.x, s.substack, s.medium, s.podcast, s.youtube]
    },
    { "@type": "Organization", "@id": `${u}/#digital-clarity`, name: "Digital Clarity", legalName: "Stylar Limited", url: s.digitalClarity, foundingDate: "2002", founder: id("person"), parentOrganization: id("dbmm"), sameAs: [s.digitalClarityLinkedin], address: { "@type": "PostalAddress", streetAddress: "167-169 Great Portland Street", addressLocality: "London", postalCode: "W1W 5PF", addressCountry: "GB" } },
    { "@type": "Corporation", "@id": `${u}/#dbmm`, name: "Digital Brand Media & Marketing Group, Inc.", alternateName: "DBMM Group", tickerSymbol: "DBMM", subOrganization: id("digital-clarity") },
    { "@type": "PodcastSeries", "@id": `${u}/#podcast`, name: "Reggie James - Perspectives", url: s.podcast, webFeed: s.rss, author: id("person"), inLanguage: "en-GB", sameAs: [s.spotify, s.apple, s.castbox] },
    ...clips.map((c) => ({ "@type": "VideoObject", "@id": `${u}/#video-${c.slug}`, name: c.title, description: c.summary, thumbnailUrl: `${u}/assets/posters/${c.slug}.jpg`, contentUrl: `${u}/videos/${c.slug}.mp4`, uploadDate: `${site.launchDate}T09:00:00+00:00`, duration: c.iso, inLanguage: "en-GB", creator: id("person"), isPartOf: id("webpage") })),
    { "@type": "FAQPage", "@id": `${u}/#faq`, isPartOf: id("webpage"), mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }
  ];
  return { "@context": "https://schema.org", "@graph": graph };
}
