const showDrafts = process.env.INCLUDE_DRAFTS === "true";

// Text pasted from LinkedIn often uses "bold" lookalike symbols. NFKC turns them back into normal letters.
const clean = (s = "") => String(s).normalize("NFKC").replace(/\s+/g, " ").trim();
const slugify = (s = "") =>
  clean(s).toLowerCase().replace(/&/g, " and ").replace(/['’‘]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80).replace(/-+$/, "");

export default {
  layout: "post.njk",
  schemaTemplate: "schema-post.njk",
  ogType: "article",
  bodyClass: "inner",
  eleventyComputed: {
    title: (data) => clean(data.title),
    description: (data) => clean(data.description),
    permalink: (data) => {
      if (data.draft && !showDrafts) return false;
      const slug = slugify(data.slug || "") || slugify(data.page.fileSlug) || slugify(data.title) || "article-" + data.page.date.toISOString().slice(0, 10);
      return `/thinking/${slug}/`;
    },
    eleventyExcludeFromCollections: (data) => !!(data.draft && !showDrafts)
  }
};
