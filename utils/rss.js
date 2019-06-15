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
  const title = feed.feed.title
  const link = feed.feed.id
  const content = feed.feed.entry
  return content.map(atomPost => {
    const postTitle = atomPost.title
    const postDate = formatDate(atomPost.published)
    const postLink = atomPost.link || ''
    const postContent = atomPost.summary
    const post = { postTitle, postDate, postLink, postContent }
    return { title, link, post }
  })
}

export const parseRssFeed = feed => {
  const title = feed.rss.channel.title
  const link = feed.rss.channel.link
  const content = feed.rss.channel.item
  return content.map(rssPost => {
    console.log(rssPost)
    const postTitle = rssPost.title
    const postDate = formatDate(rssPost.pubDate)
    const postLink = rssPost.link || ''
    const postContent = rssPost.description
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
