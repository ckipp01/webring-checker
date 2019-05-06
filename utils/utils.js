'use strict'

const request = require('request')

const gatherSites = () => {
  return new Promise((resolve, reject) => {
    request('https://webring.xxiivv.com/scripts/sites.js', (err, _, body) => {
      if (!err) {
        const begin = body.indexOf('[') + 1
        const end = body.indexOf(']')

        const sites = body
          .slice(begin, end)
          .split(',')
          .map(url => url.trim())
          .map(url => url.replace(/"/g, ''))
        resolve(sites)
      } else reject(err)
    })
  })
}

module.exports = { gatherSites }
