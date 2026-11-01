# reggie-james.com

Personal website of Reggie James. Built with Eleventy and hosted on Cloudflare Pages.

## Adding a Thinking article

1. Go to https://app.pagescms.org and sign in with GitHub.
2. Open this repository and choose **Thinking articles**, then **Add an entry**.
3. Fill in the title, summary, date and article. Add a cover image if you have one.
4. Untick **Draft** when it is ready to go live, then **Save**.

Cloudflare rebuilds the site automatically within a minute or two of saving.

## Changing site details

- Contact details, social links and the form address: `src/_data/site.json`
- Video clips (title, length, summary): `src/_data/clips.json`, with the files in `src/videos` and cover frames in `src/assets/posters`
- Questions and answers: `src/_data/faqs.json`

## Cloudflare Pages settings

- Build command: `npm run build`
- Build output directory: `_site`
- Environment variable: `NODE_VERSION` = `22`
