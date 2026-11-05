# Chart Colour Survey

A small, accessible survey page asking people (especially colour-blind people) how readable four chart colour palettes are. Answers go straight into a Google Sheet.

- **Front end:** plain HTML/CSS/JS, hosted free on **GitHub Pages**.
- **Back end:** a **Google Apps Script** attached to a Google Sheet. It needs no server or API keys.
- **Reusable:** change the palettes, images and wording in `config.js`. The sheet adds new columns automatically.

Built for the CM4125 Data Visualisation coursework *Of Pets, Penalties & Pouring Rain* (Dominic Cameron, RGU).

```
palette-survey/
├── index.html          the page
├── styles.css          neutral, high-contrast styling
├── app.js              builds the questions, random order, sends answers
├── config.js           ← edit this: palettes, wording
├── secrets.js          ← your Apps Script URL (git-ignored, never committed)
├── secrets.example.js  template for secrets.js
├── .gitignore          ignores secrets.js
├── setup/pages.yml     deploy workflow: move to .github/workflows/ (step 3)
├── images/             one sample-chart image per palette
├── apps-script/Code.gs ← paste into Google Apps Script
└── .nojekyll           tells GitHub Pages to serve files as-is
```

---

## 1. Set up the Google Sheet (about 5 minutes)

1. Create a new Google Sheet, e.g. **"Palette survey responses"**.
2. In the sheet: **Extensions → Apps Script**.
3. Delete the starter code, paste in everything from `apps-script/Code.gs`, and click **Save**.
4. *(Optional check)* Choose `testWrite` in the function dropdown and click **Run**. Approve the permissions. A "Responses" tab should appear with a test row, which you can delete.
5. Click **Deploy → New deployment**.
   - Gear icon → **Web app**
   - **Execute as:** Me
   - **Who has access:** Anyone
   - Click **Deploy**, then copy the **Web app URL**. It ends in `/exec`.
6. Open that URL in your browser. You should see `{"ok":true,"message":"Palette survey endpoint is running."}`

> "Anyone" only means anyone can *send* answers to the script. Nobody can read the sheet unless you share it.

## 2. Connect the page (locally)

The URL is kept out of git. Open **`secrets.js`** and paste it in:

```js
window.SURVEY_SECRETS = {
  SCRIPT_URL: "https://script.google.com/macros/s/XXXXXXXX/exec"
};
```

`secrets.js` is already listed in `.gitignore`, so `git add .` will skip it. If you ever lose it, copy `secrets.example.js` to `secrets.js`.

Test locally by opening `index.html` in a browser, filling it in and submitting. A new row should appear in the sheet within a few seconds.

## 3. Publish on GitHub Pages

Because `secrets.js` isn't in the repo, a small GitHub Actions workflow (`.github/workflows/pages.yml`) recreates it on GitHub from a **repository secret** and then publishes the site.

0. **Move the workflow into place** (once). It ships in `setup/` because the `.github` folder couldn't be created for you. In PowerShell, inside this folder:
   ```powershell
   mkdir .github\workflows -Force
   move setup\pages.yml .github\workflows\pages.yml
   ```
1. Create a new **public** repository on GitHub, e.g. `palette-survey`, and push this folder:
   ```bash
   git add .
   git commit -m "Palette survey"
   git branch -M main
   git remote add origin https://github.com/<your-username>/palette-survey.git
   git push -u origin main
   ```
   Check that `git status` never lists `secrets.js`.
2. On GitHub: **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `SCRIPT_URL`
   - Secret: your `/exec` URL
3. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
4. **Actions** tab → *Deploy survey to GitHub Pages* → **Run workflow** (it also runs on every push to `main`).
5. After a minute your survey is live at `https://<your-username>.github.io/palette-survey/`. Test it in a private/incognito window, then share the link.

> **What this does and doesn't hide.** The URL stays out of your repository and its history. But the live page has to call the URL from people's browsers, so anyone who opens the browser's developer tools on the live survey can still see it. That's normal for a form backend and low-risk: the script can only **add** rows, it can't read or delete your sheet. The hidden honeypot field filters basic bots. If spam ever appears, redeploy the Apps Script as a new deployment (new URL), update the `SCRIPT_URL` secret and re-run the workflow.

## 4. Reuse it for other people or palettes

- **Same survey, new people:** just share the link. Each person adds one row.
- **New palettes:** add or replace entries in `config.js` (`id`, `name`, `image`, `cat`, `wdl`, `seq`) and add the image to `images/`. Use a new `id` for a new palette so its answers get their own columns.
- **Separate study:** make a copy of the Sheet and script, deploy it, and use the new URL in a copy of the repo.
- **Changed `Code.gs`?** Use **Deploy → Manage deployments → Edit → Version: New version** so the URL stays the same.

## What gets recorded

| Column | Meaning |
|---|---|
| `received_at`, `submitted_at`, `minutes_taken` | timing |
| `respondent` | optional name/initials |
| `vision_type`, `device`, `screen_filter`, `screen` | optional context (screen = pixel size only) |
| `<palette>_lines_ease`, `_wdl_ease`, `_heatmap_ease` | 1 (very hard) to 5 (very easy), or "Can't tell" |
| `<palette>_lines_alike` | which lines looked the same |
| `<palette>_swatch_same` | which colour blocks looked the same (with hex) |
| `<palette>_comment` | free text |
| `favourite`, `least_favourite` | e.g. `Palette B = okabe` |
| `palette_order` | the random order this person saw, e.g. `A=tol, B=okabe, C=brand, D=ibm` |

Palettes are shown in a **random order** under neutral names (A–D) so the names don't bias anyone. The real names are revealed after submitting.

## Privacy and ethics

- Everything is optional apart from the ease ratings and the "easiest palette" question. People can stay anonymous.
- Colour-vision type is self-reported and optional, with "Prefer not to say". It's best not to collect names alongside it unless the person is happy to.
- Only aggregated shop sales are shown. There's no customer data.
- Tell participants how you'll use the answers (e.g. "to choose colours for my coursework dashboard"), and delete the sheet when you no longer need it.
- If the survey is part of assessed university work, check RGU's guidance on whether a short ethics form is needed for collecting responses from other people.

## Troubleshooting

- **No rows appear:** check the URL in `secrets.js` (locally) or the `SCRIPT_URL` secret (on GitHub) ends in `/exec` (not `/dev`), and that the deployment access is "Anyone".
- **Changed the script but nothing changed:** you need a *new version* of the deployment (see above).
- **Live site says it isn't connected:** the `SCRIPT_URL` secret is missing. Add it and re-run the workflow (the Actions log shows a warning when it's empty).
- **Testing without a sheet:** leave `SCRIPT_URL` empty in `secrets.js`. After submitting, the page offers a JSON download instead.
