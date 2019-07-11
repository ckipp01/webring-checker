'use strict'

const {
  gatherSiteObjects,
  fetchFeed
} = require('../utils/general')
const url = require('url')

module.exports = async (req, res) => {
  try {
    const params = url.parse(req.url, true)

    const type = params.query.type
      ? params.query.type.toLowerCase()
      : 'parsed'

    const sites = await gatherSiteObjects()
    const feedLocators = sites
      .filter(site => site.feed)
    const allPosts = await Promise.all(feedLocators.map(feed => fetchFeed(feed)))

    if (type === 'parsed') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(allPosts))
    } else {
      res.writeHead(400, { 'Content-Type': 'text/plain' })
      res.end(`Type: ${type} is not supported`)
    }
  } catch (err) {
    console.error(err.message)
    res.writeHead(400, { 'Content-Type': 'text/plain' })
    res.end('Sorry, something went wrong')
  }
}
