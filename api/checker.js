'use strict'

const request = require('request')
const url = require('url')

const { gatherSiteObjects } = require('../utils/utils')

module.exports = async (req, res) => {
  try {
    const params = url.parse(req.url, true)
    const format = params.query.format
      ? params.query.format
      : 'json'
    console.time('gatherSites')
    const siteObjects = await gatherSiteObjects()
    console.timeEnd('gatherSites')
    console.time('checkSites')
    const report = await checkSites(siteObjects, format)
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
    res.end(err.message)
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

const checkUrl = siteObject => {
  return new Promise((resolve, reject) => {
    request(siteObject.url, (err, response) => {
      if (response !== undefined) {
        const lastModified = response.headers['last-modified']
          ? response.headers['last-modified']
          : 'No last modified info'
        const statusCode = response.statusCode
        if (!err) resolve({ url: siteObject.url, statusCode, lastModified })
        else reject(err)
      } else {
        resolve({ url: siteObject.url, statusCode: '???', lastModified: 'Unable to retreive a status code.' })
      }
    })
  })
}

const captureOffenders = (sites, site, i) => {
  const offendingStyle = site.statusCode > 200 || site.statusCode === '???'
    ? ` style="color:#F03"`
    : ''
  return `${sites}
    <tr${offendingStyle}>
      <td>${i})</td>
      <td><a target="_blank" href="${site.url}">${site.url.split('//')[1]}</a></td>
      <td>${site.statusCode}</td>
      <td>${site.lastModified}</td>
    </tr>`
}

const style = `
  * { margin:0;padding:0;border:0;outline:0;text-decoration:none;font-weight:inherit;font-style:inherit;color:inherit;font-size:100%;font-family:inherit;vertical-align:baseline;list-style:none;border-collapse:collapse;border-spacing:0; -webkit-font-smoothing: antialiased;-moz-osx-font-smoothing: grayscale;}

  body {
    background:#111;
    padding:0px; margin:0px;
  }
  div {
    background: #f4f4f4;
    margin: 15px;
    color: #333;
    padding: 15px;
    font-family:'Monospaced','Courier New',courier;
    font-size:12px;
    border-radius: 2px;
  }
  th {
    font-size: 13px;
    border-bottom: 2px solid;
  }
  a {
    text-decoration: underline black;
  }
  tr {
    line-height: 20px;
  }
  h5 {
    margin: 1em
  }
`

const htmlify = list => {
  const beginBody = `<html><head><style>${style}</style></head><body>`
  const beginTable = '<div><table><thead><tr><th></th><th>Url</th><th>Status</th><th>Last Modified</th></thead><tbody>'
  const tableContent = list.reduce(captureOffenders, '')
  const closingTable = '</tbody></table>'
  const whatIsThis = `<h5><a target="_blank" href="https://wiki.chronica.xyz/#webring-checker">What is this?</a></h5>`
  const goToWebring = `<h5><a target="_blank" href="https://webring.xxiivv.com">Go to xxiivv webring</a></h5>`
  const closingBody = '</div></body></html>'
  return beginBody + beginTable + tableContent + closingTable + whatIsThis + goToWebring + closingBody
}
