# webring-checker

Small api and service to check the status of the sites in [the webring](https://webring.xxiivv.com), and to provide a list of sites. The following options are available.

  - `GET / will return a description page`
  - `GET /check?format=html` will return an html report of all sites, their status code, and last modified date if available
  - `GET /check?format=json` will return the same info as the html format, but in json
  - `GET /sites` will return a json array of sites that are part of the webring

* Note that if the check returns a 502, it may simply be that you need to refresh to try again. This is hosted with [Zeit's Now serverless platform](https://zeit.co/now) which has a 10 second timeout for free accounts. If you are hitting it while code, it may take more than 10 seconds, but the second invocation should work fine.
