'use strict'

const fetch = require('node-fetch')
const { htmlifyReport } = require('../utils/html')

const reTag = /([^&]|^)#([a-zA-Z0-9]+)/g

const cleanLine = line => {
  const dirtyString = line.slice(line.indexOf('{'), line.indexOf('}') + 1)
  const cleanJSON = dirtyString
    .replace(/\s/g, '')
    .replace((/([\w]+)(:')/g), '"$1"$2')
    .replace(/'/g, '"')
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

const escapeHtml = unsafe => unsafe.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;')

const parseFeed = (author, feed) => {
  const lines = feed.split('\n')
  const entries = []
  for (const id in lines) {
    const line = lines[id].trim()
    if (line === '') { continue }
    const parts = line.replace('   ', '\t').split('\t')
    const date = parts[0].trim()
    const body = escapeHtml(parts[1].trim()).trim()
    const channel = body.substr(0, 1) === '/' ? body.split(' ')[0].substr(1).toLowerCase() : body.substr(0, 1) === '@' ? 'veranda' : 'lobby'
    const tags = (body.match(reTag) || []).map(a => a.substr(a.indexOf('#') + 1).toLowerCase())
    const offset = new Date() - new Date(date)
    entries.push({ date, body, author, offset, channel, tags })
  }
  return entries
}

export const fetchFeed = site => {
  return new Promise(resolve => {
    console.log(site.feed)
    fetch(site.feed)
      .then(rawResponse => rawResponse.text())
      .then(data => resolve({ author: site.author, feed: parseFeed(site.author, data) }))
      .catch(err => resolve({ author: site.author, feed: err.message }))
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
