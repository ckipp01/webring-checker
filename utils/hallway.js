'use strict'

const fetch = require('node-fetch')

const reTag = /([^&]|^)#([a-zA-Z0-9]+)/g

const escapeHtml = unsafe => unsafe.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;')

export const timeAgo = dateParam => {
  const date = typeof dateParam === 'object' ? dateParam : new Date(dateParam)
  const DAY_IN_MS = 86400000 // 24 * 60 * 60 * 1000
  const today = new Date()
  const yesterday = new Date(today - DAY_IN_MS)
  const seconds = Math.round((today - date) / 1000)
  const minutes = Math.round(seconds / 60)
  const isToday = today.toDateString() === date.toDateString()
  const isYesterday = yesterday.toDateString() === date.toDateString()

  if (seconds < 5) {
    return 'just now'
  } else if (seconds < 60) {
    return `${seconds} seconds ago`
  } else if (seconds < 90) {
    return 'a minute ago'
  } else if (minutes < 60) {
    return `${minutes} minutes ago`
  } else if (isToday) {
    return `${Math.floor(minutes / 60)} hours ago`
  } else if (isYesterday) {
    return 'yesterday'
  }

  return `${Math.floor(minutes / 1440)} days ago`
}

const parseFeed = (author, feed) => {
  const lines = feed.split('\n')
  const entries = []
  for (const id in lines) {
    const line = lines[id].trim()
    if (line === '') { continue }
    const parts = line.replace('   ', '\t').split('\t')
    const date = parts[0].trim()
    const body = escapeHtml(parts[1].trim()).trim()
    const channel = body.substr(0, 1) === '/' ? body.split(' ')[0].substr(1).toLowerCase() : body.substr(0, 1) === '@' ? 'veranda' : 'lobby'
    const tags = (body.match(reTag) || []).map(a => a.substr(a.indexOf('#') + 1).toLowerCase())
    const offset = new Date() - new Date(date)
    entries.push({ date, body, author, offset, channel, tags })
  }
  return entries
}

export const fetchFeed = site => {
  return new Promise(resolve => {
    fetch(site.feed)
      .then(rawResponse => rawResponse.text())
      .then(data => resolve({ author: site.author, feed: parseFeed(site.author, data) }))
      .catch(err => {
        console.error(err)
        resolve({ author: site.author, feed: parseFeed(site.author, '') })
      })
  })
}

export const simplifyPosts = allPosts => {
  return new Promise(resolve => {
    const simplified = allPosts.map(post => {
      return post.feed.map(post => ({
        author: post.author,
        date: timeAgo(Date.parse(post.date)),
        offset: post.offset,
        body: post.body
      }))
    })
    resolve(simplified)
  })
}
