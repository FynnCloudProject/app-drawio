# draw.io

A diagramming and whiteboarding app for FynnCloud powered by an offline build of draw.io.

## Features

- Create and edit flowcharts, architecture diagrams, UML schematics, wireframes, and ERDs.
- Open `.drawio`, `.drawio.xml`, `.drawio.svg`, `.drawio.png`, and `.diagram` files directly from the FynnCloud file browser.
- Automatic saving back to FynnCloud storage with light and dark theme synchronization.

## Development

```bash
npm run setup
npm start
```

## Docker

```bash
docker build -t ghcr.io/fynncloudproject/app-drawio:1.0.0 .
docker run -p 8080:8080 ghcr.io/fynncloudproject/app-drawio:1.0.0
```
