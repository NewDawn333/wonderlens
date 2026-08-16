# Wonderlens

A family time machine for the Disneyland Resort. Walk to landmarks, photograph the trip, and send every frame back to opening day, 1955 — clothes, surroundings, and film stock included.

This is a personal family app, not an official park product.

- Repo: https://github.com/NewDawn333/wonderlens
- Latest APK: https://github.com/NewDawn333/wonderlens/releases/latest
- Phone workflow: [ROAD.md](ROAD.md)
- Android Studio: [ANDROID.md](ANDROID.md)

## On the Pixel

The installed app talks to Imagine directly. Paste an xAI key in **Setup**. Cell data is enough.

To update from the park, use [ROAD.md](ROAD.md). Cursor Cloud Agents can edit this repo from [cursor.com/agents](https://cursor.com/agents) on a phone browser. A push to `main` publishes a new APK.

## Local Mac build

```bash
npm install
npm run cap:sync
cd android && ./gradlew assembleRelease
```
