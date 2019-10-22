# webring-checker

NOTE: This project is currently not live. Instead, consider using the [webring-cli](https://github.com/ckipp01/webring-cli).

Small api providing a few utilities and views the [xxiivv webring](https://webring.xxiivv.com).

  - `GET / will return a description page`
  - `GET /check?format=html` will return an html report of all sites, their status code, and last modified date if available
  - `GET /check?format=json` will return the same info as the html format, but in json
  - `GET /hallway?format=json` will return a json parsed report of each member in the hallway and their twtxt file
  - `GET /hallway?format=simplified` will return a json parsed report in simplified format
  - `GET /sites` will return a json array of siteObjects that are part of the webring
  - `GET /rss?format=html` to view a collection of all availabe rss feeds in the Webring ordered by date
  - `GET /rss?format=json` to retrieve the collection of rss feeds in json format ordered by date

The rss feed currently only supports rss and atom feeds. Since the feed shapes are a bit different, they are grouped into a common shape shown below. This is the form that the rss json will return.

```js
{
  "title": String,
  "link": String,
  "post": {
    "postTitle": String,
    "postDate": String,
    "postLink": String,
    "postConent": String
  }
}
```
