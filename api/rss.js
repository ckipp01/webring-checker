'use strict'

const {
  fetchFeed,
  orderByDate,
  parseAtomFeed,
  parseRssFeed
} = require('../utils/rss')
const { htmlifyFeed } = require('../utils/html')
const { gatherSiteObjects } = require('../utils/general')
const url = require('url')

module.exports = async (req, res) => {
  try {
    const params = url.parse(req.url, true)
    const format = params.query.format
      ? params.query.format.toLowerCase()
      : 'html'
    if (format !== 'html' && format !== 'json') {
      throw Error(`Unsupported format ${format}`)
    }
    const siteObjects = await gatherSiteObjects()
    const feedUrls = siteObjects
      .filter(site => site.rss)
      .map(site => site.rss)
    const calls = await feedUrls.map(fetchFeed)
    const feeds = await Promise.all(calls)
    const standardized = feeds.map(feed => {
      return 'feed' in feed
        ? parseAtomFeed(feed)
        : parseRssFeed(feed)
    })
    const flattend = [].concat.apply([], standardized)
    const ordered = orderByDate(flattend)
    const finalFeed = await format === 'html'
      ? htmlifyFeed(ordered)
      : JSON.stringify(ordered)
    const contentType = format === 'html'
      ? 'text/html;charset=UTF-8'
      : 'application/json'
    res.writeHead(200, { 'Content-Type': contentType })
    res.end(finalFeed)
  } catch (err) {
    console.error(err.message)
    res.writeHead(400, { 'Content-Type': 'text/plain' })
    res.end(err.message)
  }
}
