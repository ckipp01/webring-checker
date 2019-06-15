'use strict'

const { checkSites } = require('../utils/utils')
const url = require('url')

const { gatherSiteObjects } = require('../utils/utils')

module.exports = async (req, res) => {
  try {
    const params = url.parse(req.url, true)
    const format = params.query.format
      ? params.query.format
      : 'json'
    const siteObjects = await gatherSiteObjects()
    const report = await checkSites(siteObjects, format)
    const contentType = format === 'json'
      ? 'application/json'
      : 'text/html;charset=UTF-8'
    console.info(`Successfully gathered ${format} report`)
    res.writeHead(200, { 'Content-Type': contentType })
    res.end(report)
  } catch (err) {
    console.error(err.message)
    res.writeHead(400, { 'Content-Type': 'text/plain' })
    res.end(err.message)
  }
}
