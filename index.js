const request = require('request')

module.exports = async (_, res) => {
  try {
    const sites = await gatherSites()
    const report = await checkSites(sites)
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(JSON.stringify(report))
  } catch (err) {
    res.writeHead(400, { 'Content-Type': 'text/plain' })
    res.end(err)
  }
}

const checkSites = async list => {
  return new Promise((resolve, reject) => {
    const results = list.map(checkUrl)
    Promise.all(results)
      .then(data => { resolve(data) })
      .catch(err => { reject(err) })
  })
}

const checkUrl = url => {
  return new Promise((resolve, reject) => {
    request(url, (err, response) => {
      const statusCode = response.statusCode
      if (!err) resolve({ url, statusCode })
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
