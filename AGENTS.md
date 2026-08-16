# Wonderlens agent notes

Family photo-quest Android app. Vanilla JS in `public/`, Capacitor Android in `android/`.

## Ship a phone update

1. Edit `public/` (HTML/CSS/JS) or Android project files.
2. Commit and **push to `main`**.
3. GitHub Actions builds a signed APK and publishes it to Releases.
4. On the Pixel: Wonderlens → Setup → **Check GitHub for a new build**, or open https://github.com/NewDawn333/wonderlens/releases/latest and install `wonderlens.apk`.

Do not open a PR for park-day tweaks unless the change is risky. Direct `main` is how the phone gets a new APK.

## Do not

- Change `applicationId` (`com.wonderlens.app`) or the signing setup
- Commit `.env`, `android/keystore/`, or `android/keystore.properties`
- Hardcode an xAI API key
- Add official Disney marks or copyrighted mascots in UI or Imagine prompts

## Local build (Mac)

```bash
npm run cap:sync
cd android && ./gradlew assembleRelease
```
