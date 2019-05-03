const request = require('request')

module.exports = async (req, res) => {
  const sites = await gatherSites()
  const report = await checkSites(sites)
  res.end(JSON.stringify(report))
}

const checkSites = async list => {
  return new Promise((resolve, reject) => {
    const results = list.map(checkUrl)
    Promise.all(results)
      .then(data => {
        resolve(data)
      })
  })
}

const checkUrl = url => {
  return new Promise((resolve, reject) => {
    request(url, (error, response) => {
      const sc = response.statusCode
      if (!error) resolve({ url, sc })
    })
  })
}

const gatherSites = () => {
  return new Promise((resolve, reject) => {
    request('https://webring.xxiivv.com/scripts/sites.js', (error, response, body) => {
      if (!error) {
        const begin = body.indexOf('[') + 1
        const end = body.indexOf(']')

        const sites = body
          .slice(begin, end)
          .split(',')
          .map(url => url.trim())
          .map(url => url.replace(/"/g, ''))
        resolve(sites)
      }
    })
  })
}
