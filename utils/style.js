'use strict'

export const style = `
  * { margin:0;padding:0;border:0;outline:0;text-decoration:none;font-weight:inherit;font-style:inherit;color:inherit;font-size:100%;font-family:inherit;vertical-align:baseline;list-style:none;border-collapse:collapse;border-spacing:0; -webkit-font-smoothing: antialiased;-moz-osx-font-smoothing: grayscale;}
  body { background:#111; padding:0px; margin:0px; line-height: 1.5; }
  div { background: #f4f4f4;margin: 15px;color: #333;padding: 15px;font-family:'Monospaced','Courier New',courier;font-size:12px;border-radius: 2px; }
  div.rss { max-width: 986px; margin: auto; }
  img, video { max-width: 100%; margin: 5px; }
  th { font-size: 13px;border-bottom: 2px solid; }
  a { padding: 0 0 0 1em; text-decoration: underline black; }
  a:hover { text-decoration: underline black; }
  td.wiki::after { content:"<wiki>"; color: #A8A8A8; padding: 0 1em 0 0; }
  td.blog::after { content:"<blog>"; color: #A8A8A8; padding: 0 1em 0 0; }
  tr { line-height: 20px; }
  tr.error { color:#F03; }
  pre { background: white; padding: 5px; }
  h1 { font-size: 2em; }
  h2 { font-size: 1.5em; }
  h3 { font-size: 1.24em; }
  h5 { margin: 1em }
`
