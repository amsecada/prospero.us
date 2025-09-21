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

## Dependencies

This project uses the following npm packages to build the site:

- **`markdown-it`**: A powerful and flexible Markdown parser. It converts the Markdown files for the papers into HTML.
- **`front-matter`**: Parses YAML front matter from files. This is used to extract metadata like title and date from the paper files.
- **`highlight.js`**: Provides syntax highlighting for code blocks within the papers.
- **`fs-extra`**: Adds file system methods that aren't included in the native `fs` module. It's used by the build script for file operations.
