export default function (eleventyConfig) {
  const showDrafts = process.env.INCLUDE_DRAFTS === "true";

  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/videos": "videos" });
  eleventyConfig.addPassthroughCopy({ "src/og-image.jpg": "og-image.jpg" });
  eleventyConfig.addPassthroughCopy({ "src/_headers": "_headers" });

  eleventyConfig.addCollection("thinking", (api) =>
    api.getFilteredByGlob("src/thinking/posts/*.md")
      .filter((p) => showDrafts || !p.data.draft)
      .sort((a, b) => b.date - a.date)
  );

  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  eleventyConfig.addFilter("ukDate", (d) => { const x = new Date(d); return `${x.getUTCDate()} ${months[x.getUTCMonth()]} ${x.getUTCFullYear()}`; });
  eleventyConfig.addFilter("isoDate", (d) => new Date(d).toISOString().slice(0, 10));
  eleventyConfig.addFilter("readingTime", (html = "") => {
    const words = String(html).replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 230)) + " min read";
  });
  eleventyConfig.addFilter("plain", (html = "") => String(html).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
  eleventyConfig.addFilter("truncateWords", (text = "", n = 30) => {
    const w = String(text).split(/\s+/); return w.length > n ? w.slice(0, n).join(" ") + "..." : text;
  });
  const enc = (p = "") => { try { return encodeURI(decodeURI(p)); } catch { return encodeURI(p); } };
  eleventyConfig.addFilter("enc", enc);
  eleventyConfig.addFilter("abs", (path, base) => (path && /^https?:/.test(path)) ? path : base.replace(/\/$/, "") + enc(path || "/"));
  eleventyConfig.addFilter("sourceName", (u = "") => /linkedin|lnkd\.in/i.test(u) ? "LinkedIn" : /substack/i.test(u) ? "Substack" : /medium\.com/i.test(u) ? "Medium" : "the original site");
  eleventyConfig.addFilter("json", (v) => JSON.stringify(v));
  eleventyConfig.addFilter("head", (arr = [], n) => arr.slice(0, n));

  eleventyConfig.addFilter("listItems", (posts = [], base) =>
    posts.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: base.replace(/\/$/, "") + p.url, name: p.data.title })));

  // One dated list of Reggie's own articles plus his latest Substack and Medium posts.
  eleventyConfig.addFilter("thinkingList", (own = [], feeds = [], limit) => {
    const mine = own.map((p) => ({
      source: "Article", internal: true, title: p.data.title, url: p.url, date: p.date,
      image: p.data.image ? enc(p.data.image) : null, imageAlt: p.data.imageAlt || "", excerpt: p.data.description || ""
    }));
    const seen = new Set(own.map((p) => (p.data.canonicalUrl || "").split("?")[0]).filter(Boolean));
    const ext = (feeds || []).filter((f) => !seen.has(f.url)).map((f) => ({ ...f, imageAlt: "" }));
    const all = [...mine, ...ext].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    return limit ? all.slice(0, limit) : all;
  });

  // Structured data for a Thinking article: BlogPosting plus breadcrumbs.
  eleventyConfig.addFilter("postSchema", function (content, d) {
    const site = d.site, base = site.url.replace(/\/$/, ""), url = base + enc(d.page.url);
    const iso = (x) => new Date(x).toISOString().slice(0, 10);
    const words = String(content || "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
    const person = { "@type": "Person", "@id": base + "/#person", name: "Reggie James", url: base + "/",
      jobTitle: "Go-to-market and growth adviser to B2B tech leaders and investors",
      sameAs: [site.social.linkedin, site.social.substack, site.social.medium] };
    const post = { "@context": "https://schema.org", "@type": "BlogPosting", "@id": url + "#article",
      mainEntityOfPage: url, url, headline: d.title, description: d.description,
      image: d.image ? base + enc(d.image) : site.image,
      datePublished: iso(d.page.date), dateModified: iso(d.updated || d.page.date),
      inLanguage: "en-GB", wordCount: words, author: person, publisher: { "@id": base + "/#person" },
      isPartOf: { "@id": base + "/thinking/#webpage" } };
    if (d.tags && d.tags.length) post.keywords = d.tags;
    if (d.canonicalUrl) post.isBasedOn = d.canonicalUrl;
    const crumbs = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: base + "/" },
      { "@type": "ListItem", position: 2, name: "Thinking", item: base + "/thinking/" },
      { "@type": "ListItem", position: 3, name: d.title, item: url } ] };
    return [post, crumbs].map((o) => '<script type="application/ld+json">' + JSON.stringify(o).replace(/</g, "\\u003c") + "</script>").join("\n");
  });

  eleventyConfig.addGlobalData("buildDate", () => new Date().toISOString().slice(0, 10));

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: false,
    htmlTemplateEngine: "njk"
  };
}
