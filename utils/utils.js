'use strict'

const fetch = require('node-fetch')
const { htmlify } = require('../utils/html')

const cleanLine = line => {
  const dirtyString = line.slice(line.indexOf('{'), line.indexOf('}') + 1)
  const cleanJSON = dirtyString
    .replace(/\s/g, '')
    .replace((/([\w]+)(:")/g), '"$1"$2')
  return JSON.parse(cleanJSON)
}

export const gatherSiteObjects = () => {
  return new Promise((resolve, reject) => {
    fetch('https://webring.xxiivv.com/scripts/sites.js')
      .then(rawResponse => rawResponse.text())
      .then(data => {
        const begin = data.indexOf('[') + 1
        const end = data.indexOf(']')

        const siteObjects = data
          .slice(begin, end)
          .split('\n')
          .filter(url => url !== '')
          .map(cleanLine)

        resolve(siteObjects)
      })
      .catch(err => reject(err))
  })
}

export const checkSites = async (list, format) => {
  return new Promise((resolve, reject) => {
    if (format !== 'json' && format !== 'html') reject(Error(`Unsupported format ${format} requested`))
    const results = list.map(checkUrl)
    Promise.all(results)
      .then(data => {
        if (format === 'json') resolve(JSON.stringify(data))
        else resolve(htmlify(data))
      })
      .catch(err => { reject(err) })
  })
}

const checkUrl = siteObject => {
  return new Promise((resolve, reject) => {
    fetch(siteObject.url)
      .then(res => {
        const lastModified = res.headers.get('last-modified') ||
          'No last modified info available'
        const statusCode = res.status || '???'
        resolve({
          url: siteObject.url,
          statusCode,
          lastModified,
          title: siteObject.title,
          type: siteObject.type
        })
      })
      .catch(err => reject(err))
  })
}
