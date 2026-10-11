# Shubh Avsar Creator

A Hindi-first, browser-side greeting poster and short animated reel maker. The starter build does not require a paid AI API.

## Features in this starter
- Local image selection and canvas-based portrait poster
- Name, occasion, message, palette, frame and text-size controls
- PNG/JPG download
- Short animated WebM recording where the browser supports Canvas Capture + MediaRecorder
- Sample occasion data for a few festivals and public figures
- Basic static caching for previously loaded app files
- Privacy and terms pages; Render-ready Node/Express server and Dockerfile
- Visible ad placeholders (not live ads)

## Run locally
1. Install Node.js 20 or newer.
2. Run `npm install`
3. Run `npm start`
4. Open `http://localhost:10000`

## Deploy on Render
1. Create a new GitHub repository, for example `shubh-avsar-creator`.
2. Upload all files/folders from this project, keeping the paths exactly as shown.
3. In Render, create a new Web Service from the repository.
4. Choose Docker runtime (Render detects the Dockerfile). No API key or environment secret is required for the starter.
5. Deploy and test on the public HTTPS URL.

## Important limits
- This starter uses prewritten messages and sample event records. It is not a complete authoritative Indian festival calendar. For a live daily calendar, maintain a verified dataset and account for regional lunar-calendar differences.
- Video is exported as WebM if supported. Browser-native MP4 export is not universal; MP4 transcoding usually needs FFmpeg or a separate conversion service.
- Ad slots are placeholders. AdSense requires account/site approval and real ad code. Approval and earnings are not guaranteed.
- No real payment/subscription system is enabled yet. Paid products require a payment provider account, server-side order verification, and secure webhook handling; transaction fees may apply.
- No third-party AI image/video generation is included. Such effects generally need a separately chosen online service and may incur usage charges.
- Keep a license/permission record for portraits, fonts, music, and decorative assets. Use reputable sources for public-figure dates.

## Suggested monetization rollout
1. Publish original content and policy pages; apply for AdSense only when the site is ready and meets current requirements.
2. Add optional premium templates after deciding pricing and a payment provider.
3. Do not store payment secrets in frontend JavaScript or GitHub.
