# On the road (phone Chrome only)

No Mac needed after the first install.

## Ask Cursor to change the app

1. In Chrome, open [cursor.com/agents](https://cursor.com/agents)
2. Start an agent on **NewDawn333/wonderlens**
3. Tell it the change. Ask it to **push to main** so the phone build runs.
4. Wait a few minutes.

If the agent cannot see the repo, open [GitHub → Cursor app → Repository access](https://github.com/apps/cursor) and include `wonderlens`.

## Install the new version on this Pixel

1. Wait until the GitHub Action is green: [Actions](https://github.com/NewDawn333/wonderlens/actions)
2. Open Wonderlens → **Setup → Check GitHub for a new build**
3. Or Chrome: [latest release](https://github.com/NewDawn333/wonderlens/releases/latest) → download `wonderlens.apk` → Open → Install
4. First time only: Android will ask to allow Chrome to install unknown apps

You do **not** uninstall. The new APK updates in place and keeps the album.

## Manual rebuild from GitHub

GitHub mobile or Chrome → **Actions → Android release → Run workflow**.
