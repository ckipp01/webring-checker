'use strict'

const { gatherSites } = require('../utils/utils.js')

module.exports = (req, res) => {
  gatherSites()
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
