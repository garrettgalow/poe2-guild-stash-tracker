# POE2 Guild Stash Tracker

## Overview

This is a simple web app that allows you to track the contents of your guild stash in Path of Exile 2.

![Stash Tool homepage](/docs/images/homescreen.png)

## Features

- Allows you to upload a CSV file of your guild stash changes
- Dashboard page with who has the most additions, removals, and best/worst ratios
- Dashboard includes activity over time so you can see spikes
- Search page allows you to filter the logs by various fields
- Configurable list of officers who will be hidden form the stats
- Global league selector

## Tech Stack

* Cloudflare D1
* Cloudflare Workers & Pages

The free tiers are on these products are very forgiving so its very unlikely you would need to have to pay. No credit card required to start. The limiting factor is execution time on the worker when uploading data which might require you to upgrade to $5/month.

## Setup (not quite tested)

1. Clone
2. Setup wrangler (need to run `wrangler login` which will require a free Cloudflare account)
3. You might need to update the wrangler.jsonc with some ids.
4. `npm run build && npx wrangler dev` to test locally
5. `npm run deploy` to deploy to 'prod'

This will deploy behind a `workers.dev` domain. Mapping to your own domain is an exercise left to the reader.
