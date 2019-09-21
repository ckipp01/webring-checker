'use strict'

const fetch = require('node-fetch')
const { htmlifyReport } = require('../utils/html')

export const gatherSiteObjects = () => {
  return new Promise((resolve, reject) => {
    fetch('https://webring.xxiivv.com/scripts/sites.js')
      .then(rawResponse => rawResponse.text())
      .then(data => {

        const siteObjects = data
          .slice(data.indexOf('['), data.length)
          .replace(/(\r\n|\n|\r)/gm,'')
          .replace(/\s/g, '')
          .replace(/(\s*?{\s*?|\s*?,\s*?)(['"])?([a-zA-Z0-9]+)(['"])?:/g, '$1"$3":')
          .replace(/'/g, '"')

        const parsedSites = JSON.parse(siteObjects) 

        resolve(parsedSites)
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
        else resolve(htmlifyReport(data))
      })
      .catch(err => { reject(err) })
  })
}

const checkUrl = siteObject => {
  return new Promise((resolve) => {
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
      .catch(err => {
        console.error(err)
        resolve({
          url: siteObject.url,
          statusCode: '???',
          lastModified: 'No last modified info available',
          title: siteObject.title,
          type: siteObject.type
        })
      })
  })
}
