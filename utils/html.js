'use strict'

const he = require('he')
const { style } = require('./style')

const captureOffenders = (sites, site, i) => {
  const errorClass = site.statusCode > 200 || site.statusCode === '???'
    ? 'error'
    : ''
  const siteType = site.type !== undefined ? site.type : ''

  return `${sites}
    <tr${errorClass}>
      <td>${i})</td>
      <td class="${siteType}">
        <a target="_blank" href="${site.url}">${site.title !== undefined ? site.title : site.url.split('//')[1]}</a>
      </td>
      <td>${site.statusCode}</td>
      <td>${site.lastModified}</td>
    </tr>`
}

const header = `<html>
                  <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>${style}</style>
                  </head>`

export const htmlifyReport = list => {
  const beginTable = `<body>
                        <div>
                          <table>
                            <thead>
                              <tr>
                                <th></th>
                                <th>Url</th>
                                <th>Status</th>
                                <th>Last Modified</th>
                              </thead>
                            <tbody>`
  const tableContent = list.reduce(captureOffenders, '')
  const closingTable = '</tbody></table>'
  const closingBody = '</div></body></html>'
  return header + beginTable + tableContent + closingTable + closingBody
}

export const htmlifyFeed = feed => {
  const allContent = feed.reduce((html, entry) => {
    const postTitleLink = entry.post.postLink !== ''
      ? `<a target="_blank" href="${entry.post.postLink}">${entry.post.postTitle}</a>`
      : entry.post.postTitle
    return `${html}<div class='rss'>
              <h2><a target="_blank" href="${entry.link}">${entry.title}</a></h2>
              <h3>${postTitleLink}</h3>
              <p>${entry.post.postDate}</p>
            <div>${he.unescape(entry.post.postContent)}</div>
           </div>`
  }, '')
  return `${header}
            <div>
              <h1>
                <a target="_blank" href="https://webring.xxiivv.com">XXIIVV Webring Feed</a>
              </h1>
              ${allContent}
            </div>`
}
