'use strict'

const request = require('request')
const url = require('url')

const { gatherSites } = require('./utils/utils')

module.exports = async (req, res) => {
  try {
    const params = url.parse(req.url, true)
    const format = params.query.format
      ? params.query.format
      : 'json'
    console.time('gatherSites')
    const sites = await gatherSites()
    console.timeEnd('gatherSites')
    console.time('checkSites')
    const report = await checkSites(sites, format)
    console.timeEnd('checkSites')
    const contentType = format === 'json'
      ? 'application/json'
      : 'text/html'
    console.info(`Successfully gathered ${format} report`)
    res.writeHead(200, { 'Content-Type': contentType })
    res.end(report)
  } catch (err) {
    console.error(err.message)
    res.writeHead(400, { 'Content-Type': 'text/plain' })
    res.end('Sorry, something went wrong')
  }
}

const checkSites = async (list, format) => {
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

const captureOffenders = (sites, site, i) => {
  const offendingStyle = site.statusCode > 200
    ? ` style="color:#F03"`
    : ''
  return `${sites}<tr${offendingStyle}><td>${i})</td><td>${site.url}</td><td>${site.statusCode}</td><td>${site.lastModified}</td></tr>`
}

const htmlify = list => {
  const beginBody = `<body style="background:#111;color:#fff;font-family:monospace">`
  const beginTable = '<table><thead><tr><th></th><th>Url</th><th>Status</th><th>Last Modified</th></thead><tbody>'
  const tableContent = list.reduce(captureOffenders, '')
  const closingTable = '</tbody></table>'
  const whatIsThis = `<h5><a target="_blank" href="https://wiki.chronica.xyz/#webring-checker">What is this?</a></h5>`
  const closingBody = '</body>'
  return beginBody + beginTable + tableContent + closingTable + whatIsThis + closingBody
}
