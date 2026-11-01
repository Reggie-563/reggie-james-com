import { XMLParser } from "fast-xml-parser";

// Pulls the latest posts from Substack and Medium when the site builds.
// If a feed cannot be reached, the site still builds and that list is simply left out.
const FEEDS = [
  { source: "Substack", url: "https://reggiejamesperspectives.substack.com/feed" },
  { source: "Medium", url: "https://reggie-james.medium.com/feed" }
];

const strip = (html = "") =>
  String(html).replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#8217;|&rsquo;/g, "'").replace(/\s+/g, " ").trim();

async function load({ source, url }) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000), headers: { "user-agent": "reggie-james.com site build" } });
    if (!res.ok) return [];
    const xml = await res.text();
    const data = new XMLParser({ ignoreAttributes: false }).parse(xml);
    let items = data?.rss?.channel?.item || [];
    if (!Array.isArray(items)) items = [items];
    return items.slice(0, 6).map((it) => {
      const text = strip(it.description || it["content:encoded"] || "");
      return {
        source,
        title: strip(it.title),
        url: typeof it.link === "string" ? it.link : it.guid?.["#text"] || it.guid,
        date: it.pubDate ? new Date(it.pubDate) : null,
        excerpt: text.length > 180 ? text.slice(0, 177).replace(/\s+\S*$/, "") + "..." : text
      };
    }).filter((i) => i.title && i.url);
  } catch {
    return [];
  }
}

export default async function () {
  const lists = await Promise.all(FEEDS.map(load));
  return lists.flat().sort((a, b) => (b.date || 0) - (a.date || 0)).slice(0, 8);
}
