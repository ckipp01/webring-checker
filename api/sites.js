'use strict'

const { gatherSiteObjects } = require('../utils/general')

module.exports = (_, res) => {
  gatherSiteObjects()
    .then(sites => {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(sites))
    })
    .catch(err => {
      console.error(err.message)
      res.writeHead(400, { 'Content-Type': 'text/plain' })
      res.end('Sorry, something went wrong')
    })
}
