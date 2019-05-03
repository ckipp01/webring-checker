'use strict'

const request = require('request')
const url = require('url')

module.exports = async (req, res) => {
  try {
    const params = url.parse(req.url, true)
    const format = params.query.format
      ? params.query.format
      : 'json'
    const sites = await gatherSites()
    const report = await checkSites(sites, format)
    const contentType = format === 'json'
      ? 'application/json'
      : 'text/html'
    res.writeHead(200, { 'Content-Type': contentType })
    res.end(report)
  } catch (err) {
    res.writeHead(400, { 'Content-Type': 'text/plain' })
    res.end(err.message)
  }
}

const checkSites = async (list, format) => {
  return new Promise((resolve, reject) => {
    if (format !== 'json' && format !== 'html') reject(Error('Unsupported format requested'))
    const results = list.map(checkUrl)
    Promise.all(results)
      .then(data => {
        if (format === 'json') resolve(JSON.stringify(data))
        else resolve(htmlify(data))
      })
      .catch(err => { reject(err) })
  })
}

const checkUrl = url => {
  return new Promise((resolve, reject) => {
    request(url, (err, response) => {
      const lastModified = response.headers['last-modified']
        ? response.headers['last-modified']
        : 'No last modified info'
      const statusCode = response.statusCode
      if (!err) resolve({ url, statusCode, lastModified })
      else reject(err)
    })
  })
}

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

const htmlify = list => {
  const beginBody = `<body style="background:#111;color:#000;font-family:monospace">`
  const beginTable = '<table><thead><tr><th></th><th>Url</th><th>Status</th><th>Last Modified</th></thead><tbody>'
  const tableContent = list.map((site, i) => `<tr><td>${i})</td><td>${site.url}</td><td>${site.statusCode}</td><td>${site.lastModified}</td></tr>`)
  const closingTable = '</tbody></table>'
  const closingBody = '</body>'
  const html = [beginBody, beginTable, ...tableContent, closingTable, closingBody]
  return html.toString().replace(/,/g, ' ')
}
