'use strict'

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

export const htmlify = list => {
  const beginBody = `<html><head><style>${style}</style></head><body>`
  const beginTable = '<div><table><thead><tr><th></th><th>Url</th><th>Status</th><th>Last Modified</th></thead><tbody>'
  const tableContent = list.reduce(captureOffenders, '')
  const closingTable = '</tbody></table>'
  const closingBody = '</div></body></html>'
  return beginBody + beginTable + tableContent + closingTable + closingBody
}
