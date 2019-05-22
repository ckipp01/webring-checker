'use strict'

const request = require('request')

const cleanLine = line => {
  const dirtyString = line.slice(line.indexOf('{'), line.indexOf('}') + 1)
  const cleanJSON = dirtyString.replace((/([\w]+)(:")/g), '"$1"$2')
  return JSON.parse(cleanJSON)
}

const gatherSiteObjects = () => {
  return new Promise((resolve, reject) => {
    request('https://webring.xxiivv.com/scripts/sites.js', (err, _, body) => {
      if (!err) {
        const begin = body.indexOf('[') + 1
        const end = body.indexOf(']')

        const siteObjects = body
          .slice(begin, end)
          .split('\n')
          .filter(url => url !== '')
          .map(cleanLine)

        resolve(siteObjects)
      } else reject(err)
    })
  })
}

module.exports = { gatherSiteObjects }
