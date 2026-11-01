const showDrafts = process.env.INCLUDE_DRAFTS === "true";
export default {
  layout: "post.njk",
  eleventyComputed: {
    permalink: (data) => (data.draft && !showDrafts) ? false : `/thinking/${data.page.fileSlug}/`,
    eleventyExcludeFromCollections: (data) => !!(data.draft && !showDrafts)
  }
};
