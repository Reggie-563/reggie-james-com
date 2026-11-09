import { XMLParser } from "fast-xml-parser";

const PER_SOURCE = 12;

const decode = (s = "") =>
  String(s)
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&#x27;|&#8217;|&rsquo;|&#8216;|&lsquo;/g, "'")
    .replace(/&#8220;|&#8221;|&ldquo;|&rdquo;/g, '"').replace(/&#8211;|&ndash;/g, "-").replace(/&#8212;|&mdash;/g, ", ")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const strip = (html = "") => decode(String(html).replace(/<(script|style|figcaption)[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
const asText = (v) => (v && typeof v === "object" ? v["#text"] ?? "" : v ?? "");
const first = (v) => (Array.isArray(v) ? v[0] : v);

function findImage(it) {
  const enc = first(it.enclosure);
  if (enc && enc["@_url"] && (!enc["@_type"] || /^image\//.test(enc["@_type"]))) return enc["@_url"];
  const media = first(it["media:content"]) || first(it["media:thumbnail"]);
  if (media && media["@_url"]) return media["@_url"];
  const html = asText(it["content:encoded"]) + " " + asText(it.description);
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? decode(m[1]) : null;
}

const MAX = 220;
const excerptOf = (it) => {
  const text = strip(asText(it.description) || asText(it["content:encoded"]));
  return text.length > MAX ? text.slice(0, MAX - 3).replace(/\s+\S*$/, "") + "..." : text;
};

export function parseFeed(xml, source) {
  const data = new XMLParser({ ignoreAttributes: false }).parse(xml);
  let items = data?.rss?.channel?.item || [];
  if (!Array.isArray(items)) items = [items];
  return items.slice(0, PER_SOURCE).map((it) => {
    const link = asText(it.link) || asText(it.guid);
    return {
      source,
      title: strip(asText(it.title)),
      url: String(link).split("?")[0],
      date: it.pubDate ? new Date(asText(it.pubDate)) : null,
      image: findImage(it),
      excerpt: excerptOf(it),
      internal: false
    };
  }).filter((i) => i.title && /^https?:/.test(i.url));
}

