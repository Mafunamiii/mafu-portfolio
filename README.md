# Mafu Portfolio

A responsive portfolio with interactive cube navigation and an accessible simplified project view.

## Development

```sh
npm ci
npm run dev
```

## Production build

```sh
npm run build
```

The build runs TypeScript project checks before generating the static Vite site. Docker builds use the repository's existing `Dockerfile` and Nginx configuration.

## Navigation and interaction

The cube supports mouse, touch, and keyboard face selection. Manual rotation is handled independently from committed category navigation; category and view state synchronize with the URL. The compact mobile cube remains available while reading and avoids covering Experience text when it overlaps that content. Preview dialogs manage keyboard focus and body scrolling. See `CHANGELOG.md` for the audited improvements and latest mobile tile correction.
