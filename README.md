# Prospero

Welcome to Prospero, a static website for my side hustle. This repository stores artifacts, papers, rich media content, and press releases as I embark on my startup journey.

## Getting Started

Follow these instructions to set up and run the project locally.

### 1. Install Dependencies

Run the following command in the root directory to install the necessary Node.js dependencies:

```bash
npm install
```

This will install all packages listed in `package.json`.

### 2. Build Papers

Execute the build script to convert all Markdown files in `site/papers/content/` into static HTML pages.

```bash
npm run build:papers
```

The output files will be placed in the `site/papers/` directory.

### 3. Run Local Server

To view the website, navigate to the `/site` subdirectory and start a simple Python web server:

```bash
cd site
python -m http.server 8000
```

You can then access the site at `http://localhost:8000` in your web browser.

## Continuous Deployment with GitHub Actions

This repository includes a GitHub Actions workflow that automatically rebuilds and deploys the `site/` directory to GitHub Pages whenever changes are pushed to the `main` branch.

The workflow performs the following steps:

1. Checks out the repository.
2. Installs the Node.js dependencies with `npm ci`.
3. Runs `npm run build:papers` to regenerate the paper pages from Markdown content.
4. Touches `site/.nojekyll` to ensure GitHub Pages serves the generated files without applying Jekyll processing.
5. Uploads the contents of the `site/` directory as the artifact that GitHub Pages publishes.

If you need to trigger a deployment manually, you can do so from the **Actions** tab by running the **Build and Deploy Prospero site** workflow via the **Run workflow** button.

## Dependencies

This project uses the following npm packages to build the site:

- **`markdown-it`**: A powerful and flexible Markdown parser. It converts the Markdown files for the papers into HTML.
- **`front-matter`**: Parses YAML front matter from files. This is used to extract metadata like title and date from the paper files.
- **`highlight.js`**: Provides syntax highlighting for code blocks within the papers.
- **`fs-extra`**: Adds file system methods that aren't included in the native `fs` module. It's used by the build script for file operations.
