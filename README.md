# Wordle Game

A browser-based five-letter word guessing game built with React and Vite.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages

1. Create a GitHub repository named `wordle-game`.
2. If your repository has a different name, change `base` in `vite.config.js` to `/<your-repository-name>/`.
3. Push this project to the repository's `main` branch.
4. Run:

```bash
npm run deploy
```

5. In GitHub, open **Settings → Pages** and set the deployment source to the `gh-pages` branch and the `/ (root)` folder.
6. Your site will be available at `https://YOUR-USERNAME.github.io/wordle-game/`.

The `deploy` script automatically builds the project and publishes the `dist` folder to the `gh-pages` branch.
