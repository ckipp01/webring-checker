'use strict'

const { gatherSiteObjects } = require('../utils/general')

const {
  fetchFeed,
  simplifyPosts
} = require('../utils/hallway')

const url = require('url')

module.exports = async (req, res) => {
  try {
    const params = url.parse(req.url, true)

    const format = params.query.format
      ? params.query.format.toLowerCase()
      : 'json'

    const sites = await gatherSiteObjects()
    const feedLocators = sites
      .filter(site => site.feed)
    const allPosts = await Promise.all(feedLocators.map(feed => fetchFeed(feed)))

    if (format === 'json') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(allPosts))
    } else if (format === 'simplified') {
      const simplified = await simplifyPosts(allPosts)
      const merged = [].concat.apply([], simplified)
      const sorted = merged.sort((a, b) => a.offset - b.offset)

      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(sorted))
    } else {
      res.writeHead(400, { 'Content-Type': 'text/plain' })
      res.end(`Format: ${format} is not supported`)
    }
  } catch (err) {
    console.error(err.message)
    res.writeHead(400, { 'Content-Type': 'text/plain' })
    res.end('Sorry, something went wrong')
  }
}
