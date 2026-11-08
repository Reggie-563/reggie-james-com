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

  eleventyConfig.addGlobalData("buildDate", () => new Date().toISOString().slice(0, 10));

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: false,
    htmlTemplateEngine: "njk"
  };
}
