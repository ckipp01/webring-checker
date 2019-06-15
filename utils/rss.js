'use strict'

const fetch = require('node-fetch')
const parser = require('fast-xml-parser')

const padDate = n => n < 10 ? '0' + n : n

const formatDate = date => {
  const d = new Date(date)
  const month = padDate(d.getMonth() + 1)
  const day = padDate(d.getDate())
  const year = d.getFullYear()
  return [year, month, day].join('-')
}

export const parseAtomFeed = feed => {
  const title = feed.feed.title || 'Missing Title'
  const link = feed.feed.id || ''
  const content = feed.feed.entry
  return content.map(atomPost => {
    const postTitle = atomPost.title || 'Missing Title'
    const postDate = formatDate(atomPost.published) || '0000-00-00'
    const postLink = atomPost.link || ''
    const postContent = atomPost.summary || 'Missing Summary'
    const post = { postTitle, postDate, postLink, postContent }
    return { title, link, post }
  })
}

export const parseRssFeed = feed => {
  const title = feed.rss.channel.title || 'Missing Title'
  const link = feed.rss.channel.link || ''
  const content = feed.rss.channel.item
  return content.map(rssPost => {
    const postTitle = rssPost.title || 'Missing Title'
    const postDate = formatDate(rssPost.pubDate) || '0000-00-00'
    const postLink = rssPost.link || ''
    const postContent = rssPost.description || 'Missing Summary'
    const post = { postTitle, postDate, postLink, postContent }
    return { title, link, post }
  })
}

export const orderByDate = arr => {
  return arr.slice().sort((a, b) => {
    return a.post.postDate > b.post.postDate ? -1 : 1
  })
}

export const fetchFeed = site => {
  return fetch(site)
    .then(response => response.text())
    .then(str => parser.parse(str))
    .catch(err => { throw err })
}