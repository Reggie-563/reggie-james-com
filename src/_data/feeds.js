import { parseFeed } from "../../lib/feed-parser.js";

// Pulls Reggie's latest posts from Substack and Medium each time the site builds,
// including each post's lead image. If a feed cannot be reached, the site still builds
// and that source is simply left out. The build log shows a line per source.
const FEEDS = [
  { source: "Substack", url: "https://reggiejamesperspectives.substack.com/feed" },
  { source: "Medium", url: "https://reggie-james.medium.com/feed" }
];

async function load({ source, url }) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000), headers: { "user-agent": "Mozilla/5.0 (compatible; reggie-james.com site build)" } });
    if (!res.ok) { console.log(`[feeds] ${source}: HTTP ${res.status}`); return []; }
    const items = parseFeed(await res.text(), source);
    console.log(`[feeds] ${source}: ${items.length} posts, ${items.filter((i) => i.image).length} with images`);
    return items;
  } catch (e) {
    console.log(`[feeds] ${source}: not reachable (${e.name})`);
    return [];
  }
}

export default async function () {
  if (process.env.FEEDS_MOCK) {
    const fs = await import("node:fs");
    return ["Substack", "Medium"].flatMap((src) => parseFeed(fs.readFileSync(`${process.env.FEEDS_MOCK}/${src === "Substack" ? "sub" : "med"}.xml`, "utf8"), src));
  }
  const lists = await Promise.all(FEEDS.map(load));
  return lists.flat().sort((a, b) => (b.date || 0) - (a.date || 0));
}
