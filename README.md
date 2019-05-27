# webring-checker

Small api and service to check the status of the sites in [the xxiivv webring](https://webring.xxiivv.com), and to provide a list of sites. The following options are available.

  - `GET / will return a description page`
  - `GET /check?format=html` will return an html report of all sites, their status code, and last modified date if available
  - `GET /check?format=json` will return the same info as the html format, but in json
  - `GET /sites` will return a json array of siteObjects that are part of the webring
