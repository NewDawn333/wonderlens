# Wonderlens on Android

Capacitor wraps the web app as `com.wonderlens.app`.

## Install on the paired phone

From this folder:

```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export ANDROID_HOME="$HOME/Library/Android/sdk"
npm run cap:sync
cd android && ./gradlew assembleRelease
adb install -r app/build/outputs/apk/release/app-release.apk
adb shell am start -n com.wonderlens.app/.MainActivity
```

Or open the project:

```bash
npm run cap:open
```

Then Run → Run 'app' on the wireless Pixel.

Signing uses `android/keystore.properties` (gitignored). A recovery copy lives in `~/.wonderlens/` on this Mac. GitHub Actions uses the same key via repository secrets, so CI APKs update the installed app in place.

## First launch in the park

1. Allow location and camera when Android asks.
2. Setup → paste an xAI key from https://console.x.ai
3. Time-machine looks and Line Buddy then work over cell data.

## Phone updates

See [ROAD.md](ROAD.md).
