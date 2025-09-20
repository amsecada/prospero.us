const fs = require('fs-extra');
const path = require('path');
const frontMatter = require('front-matter');
const MarkdownIt = require('markdown-it');
const hljs = require('highlight.js');

// --- CONFIGURATION ---
const CONTENT_DIR = path.join(__dirname, '../content');
const PUBLIC_DIR = path.join(__dirname, '../public');
const PAPERS_INDEX_TEMPLATE_PATH = path.join(__dirname, '../index.html.template');
const PAPERS_INDEX_OUTPUT_PATH = path.join(__dirname, '../index.html');

// --- MARKDOWN SETUP ---
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`;
      } catch (__) {}
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
  }
});

// --- TEMPLATES ---

function renderPaperCard(paper) {
  return `
    <div class="paper-card" onclick="window.location.href='public/${paper.slug}/index.html'">
        <h3 class="paper-card__title">${paper.attributes.title}</h3>
        <div class="paper-meta">
            <span class="meta-item">${new Date(paper.attributes.date).toLocaleDateString()}</span>
            ${paper.attributes.categories?.map(cat => `<span class="meta-item">${cat}</span>`).join('')}
        </div>
        <p class="paper-card__abstract">${paper.attributes.abstract || ''}</p>
        <a href="public/${paper.slug}/index.html" class="paper-card__link">Read paper →</a>
    </div>
  `;
}

const individualPaperTemplate = (paper) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${paper.attributes.title} - Prospero</title>
    <meta name="description" content="${paper.attributes.abstract || 'Research paper from Prospero'}">
    <link rel="stylesheet" href="../../assets/css/styles.css">
    <link rel="stylesheet" href="../../assets/css/papers.css">
    <link rel="icon" type="image/svg+xml" href="../../assets/img/logo.svg">
</head>
<body>
    <header class="header">
        <div class="container">
            <a href="../../index.html" class="logo">
                <img src="../../assets/img/logo.svg" alt="Prospero logo" class="logo__image">
                <span class="logo__text">Prospero</span>
            </a>
            <nav class="nav">
                <ul class="nav__list">
                    <li><a href="../../index.html" class="nav__link">Home</a></li>
                    <li><a href="../../about.html" class="nav__link">About</a></li>
                    <li><a href="../index.html" class="nav__link nav__link--active">Papers</a></li>
                </ul>
            </nav>
        </div>
    </header>
    <main class="main">
        <div class="container">
            <article class="paper-content">
                <a href="../index.html" class="back-link">← Back to Papers</a>
                <h1>${paper.attributes.title}</h1>
                <div class="paper-meta-large">
                    <span>By ${paper.attributes.author}</span>
                    <span>${new Date(paper.attributes.date).toLocaleDateString()}</span>
                </div>
                <div class="paper-body">
                    ${paper.html}
                </div>
            </article>
        </div>
    </main>
    <footer class="footer">
        <div class="container">
            <p>&copy; ${new Date().getFullYear()} Prospero. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>
`;

// --- MAIN GENERATION LOGIC ---

async function generateSite() {
  try {
    console.log('Starting paper generation...');

    // 1. Clean public directory
    await fs.emptyDir(PUBLIC_DIR);
    console.log('Cleaned public directory.');

    // 2. Read and process markdown files
    const files = await fs.readdir(CONTENT_DIR);
    const markdownFiles = files.filter(file => file.endsWith('.md'));

    let papers = [];

    for (const file of markdownFiles) {
      const filePath = path.join(CONTENT_DIR, file);
      const fileContent = await fs.readFile(filePath, 'utf8');

      const { attributes, body } = frontMatter(fileContent);
      const html = md.render(body);
      const slug = file.replace('.md', '');

      papers.push({ slug, attributes, html });
    }

    // 3. Sort papers by date
    papers.sort((a, b) => new Date(b.attributes.date) - new Date(a.attributes.date));
    console.log(`Found and processed ${papers.length} papers.`);

    // 4. Generate individual paper pages
    for (const paper of papers) {
      const paperHtml = individualPaperTemplate(paper);
      const outputDir = path.join(PUBLIC_DIR, paper.slug);
      await fs.ensureDir(outputDir);
      await fs.writeFile(path.join(outputDir, 'index.html'), paperHtml);
    }
    console.log('Generated individual paper pages.');

    // 5. Generate main papers index page
    const papersIndexTemplate = await fs.readFile(PAPERS_INDEX_TEMPLATE_PATH, 'utf8');

    const highlightedPapers = papers.filter(p => p.attributes.pinned);
    const highlightedPapersHtml = highlightedPapers.map(renderPaperCard).join('');

    const otherPapers = papers.filter(p => !p.attributes.pinned);
    const otherPapersHtml = otherPapers.map(renderPaperCard).join('');

    let updatedIndex = papersIndexTemplate
      .replace('<!-- HIGHLIGHTED_PAPERS_PLACEHOLDER -->', highlightedPapersHtml)
      .replace('<!-- ALL_PAPERS_PLACEHOLDER -->', otherPapersHtml);

    // Also inject JSON data for client-side filtering if needed
    updatedIndex = updatedIndex.replace(
        'const papers = []; // PAPERS_JSON_PLACEHOLDER',
        `const papers = ${JSON.stringify(papers.map(p => ({slug: `public/${p.slug}/index.html`, attributes: p.attributes})))};`
    );

    await fs.writeFile(PAPERS_INDEX_OUTPUT_PATH, updatedIndex);
    console.log('Updated papers index page.');

    console.log('✅ Paper generation complete!');

  } catch (error) {
    console.error('❌ Error during paper generation:', error);
    process.exit(1);
  }
}

generateSite();
