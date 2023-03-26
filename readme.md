
# RecGPT: A recommender system that uses OpenAI API

This code uses Spotify Web API to fetch your Spotify user data, then asks GPT to come up with more recommendations.

## Pre-requisites

To run this demo you will need:

- A [Node.js LTS](https://nodejs.org/en/) environment or later.
- A [Spotify Developer Account](https://developer.spotify.com/)

## Usage

Create an app in your [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/), set the redirect URI to ` http://localhost:5173/callback` and `http://localhost:5173/callback/` and copy your Client ID. 
```bash
npm install
npm run dev
```

Replace the value for clientId in `/src/script.ts` with your own Client ID.


## Acknowledgements
This work is based on the [Spotify Web API examples](https://github.com/spotify/web-api-examples) as well as OpenAI API. Developers claim no competitive interests.
