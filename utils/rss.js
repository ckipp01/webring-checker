'use strict'

const fetch = require('node-fetch')
const he = require('he')
const parser = require('fast-xml-parser')

const padDate = n => n < 10 ? '0' + n : n

const formatDate = date => {
  const d = new Date(date)
  const month = padDate(d.getMonth() + 1)
  const day = padDate(d.getDate())
  const year = d.getFullYear()
  return [year, month, day].join('-')
}

const handleEnclosure = enclosureObject => {
  if (enclosureObject._type === 'audio/mpeg') {
    return `<audio controls>
              <source src="${enclosureObject._url}" type="audio/mpeg">
                Your browser doesn't support audio</audio>
              </source>
            </audio>`
  } else {
    return 'This type of enclosure is not supported yet'
  }
}

const grabTitle = potentialTitle => {
  return typeof potentialTitle === 'string'
    ? potentialTitle
    : potentialTitle['#text']
}

const prepareAtomObject = (title, link) => feedItem => {
  const postTitle = grabTitle(feedItem.title || 'Missing Title')
  const postDate = formatDate(feedItem.published) || '0000-00-00'
  const postLink = feedItem.link['_href'] || ''
  const postContent = 'summary' in feedItem
    ? feedItem.summary['#text']
    : 'Missing Summary'
  const post = { postTitle, postDate, postLink, postContent }
  return { title, link, post }
}

export const parseAtomFeed = feed => {
  const title = grabTitle(feed.feed.title || 'Missing Title')
  const link = feed.feed.id || ''
  const content = feed.feed.entry
  return Array.isArray(content)
    ? content.map(prepareAtomObject(title, link))
    : [prepareAtomObject(title, link)(content)]
}

const prepareRssObject = (title, link) => feedItem => {
  const postTitle = feedItem.title || 'Missing Title'
  const postDate = formatDate(feedItem.pubDate) || '0000-00-00'
  const postLink = feedItem.link || ''
  let postContent = ''
  if (feedItem.enclosure) {
    postContent = handleEnclosure(feedItem.enclosure)
  } else if (feedItem['content:encoded']) {
    postContent = feedItem['content:encoded']
  } else {
    postContent = feedItem.description
  }
  const post = { postTitle, postDate, postLink, postContent }
  return { title, link, post }
}

export const parseRssFeed = feed => {
  const title = feed.rss.channel.title || 'Missing Title'
  const link = feed.rss.channel.link || ''
  const content = feed.rss.channel.item || []
  return Array.isArray(content)
    ? content.map(prepareRssObject(title, link))
    : [prepareRssObject(title, link)(content)]
}

export const orderByDate = arr => {
  return arr.slice().sort((a, b) => {
    return a.post.postDate > b.post.postDate ? -1 : 1
  })
}

export const fetchFeed = site => {
  const options = {
    attributeNamePrefix: '_',
    ignoreAttributes: false,
    attrValueProcessor: a => he.decode(a, { isAttributeValue: true }),
    tagValueProcessor: a => he.decode(a)
  }

  return fetch(site)
    .then(response => response.text())
    .then(str => parser.parse(str, options))
    .catch(err => { throw err })
}
