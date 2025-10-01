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

// --- HELPERS ---

const formatDate = (date) => {
  if (!date) return '';
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime())
    ? ''
    : parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const renderMetaPills = (paper) => {
  const metaItems = [];

  if (paper.attributes.author) {
    metaItems.push(`<span class="meta-item-large">By ${paper.attributes.author}</span>`);
  }

  const formattedDate = formatDate(paper.attributes.date);
  if (formattedDate) {
    metaItems.push(`<span class="meta-item-large">${formattedDate}</span>`);
  }

  if (Array.isArray(paper.attributes.categories)) {
    metaItems.push(...paper.attributes.categories.map((cat) => `<span class="meta-item-large">${cat}</span>`));
  }

  return metaItems.join('\n                ');
};

// --- TEMPLATES ---

function renderPaperCard(paper) {
  const categories = Array.isArray(paper.attributes.categories) ? paper.attributes.categories : [];
  return `
    <div class="paper-card" onclick="window.location.href='public/${paper.slug}/index.html'">
        <h3 class="paper-card__title">${paper.attributes.title}</h3>
        <div class="paper-meta">
            ${(() => {
              const date = formatDate(paper.attributes.date);
              const dateHtml = date ? `<span class="meta-item">${date}</span>` : '';
              const categoriesHtml = categories.map(cat => `<span class="meta-item">${cat}</span>`).join('');
              return `${dateHtml}${categoriesHtml}`;
            })()}
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
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../../../assets/css/styles.css">
    <link rel="stylesheet" href="../../../assets/css/papers.css">
    <link rel="icon" type="image/svg+xml" href="../../../assets/img/logo.svg">
</head>
<body>
    <a href="#main-content" class="skip-to-content">Skip to main content</a>
    <header class="header">
        <div class="container">
            <div class="header__inner">
                <a href="../../../index.html" class="logo">
                    <img src="../../../assets/img/logo.svg" alt="Prospero logo" class="logo__image">
                    <span class="logo__text">Prospero</span>
                </a>
                <nav class="nav">
                    <ul class="nav__list">
                        <li><a href="../../../index.html" class="nav__link">Home</a></li>
                        <li><a href="../../../about.html" class="nav__link">About</a></li>
                        <li><a href="../../index.html" class="nav__link nav__link--active">Papers</a></li>
                        <li><a href="../../../projects.html" class="nav__link">Projects</a></li>
                        <li><a href="../../../contact.html" class="nav__link">Contact</a></li>
                    </ul>
                </nav>
                <button class="mobile-toggle" aria-label="Toggle menu" aria-expanded="false">
                    <span class="mobile-toggle__bar"></span>
                    <span class="mobile-toggle__bar"></span>
                    <span class="mobile-toggle__bar"></span>
                </button>
            </div>
        </div>
    </header>
    <nav class="mobile-nav" aria-hidden="true">
        <ul class="mobile-nav__list">
            <li><a href="../../../index.html" class="mobile-nav__link">Home</a></li>
            <li><a href="../../../about.html" class="mobile-nav__link">About</a></li>
            <li><a href="../../index.html" class="mobile-nav__link mobile-nav__link--active">Papers</a></li>
            <li><a href="../../../projects.html" class="mobile-nav__link">Projects</a></li>
            <li><a href="../../../contact.html" class="mobile-nav__link">Contact</a></li>
        </ul>
    </nav>
    <main id="main-content" class="main">
        <section class="paper-header">
            <div class="container">
                <a href="../../index.html" class="back-link">← Back to Papers</a>
                <h1 class="paper-header__title">${paper.attributes.title}</h1>
                <div class="paper-meta-large">
                    ${renderMetaPills(paper)}
                </div>
                ${paper.attributes.abstract ? `<div class="paper-abstract">${paper.attributes.abstract}</div>` : ''}
            </div>
        </section>
        <div class="container">
            <article class="paper-content">
                ${paper.html}
            </article>
        </div>
    </main>
    <footer class="footer">
        <div class="container">
            <div class="footer__social">
                <a href="#" class="footer__social-link" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                    <svg class="footer__social-icon" viewBox="0 0 24 24">
                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                    </svg>
                </a>
                <a href="#" class="footer__social-link" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">
                    <svg class="footer__social-icon" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                </a>
                <a href="#" class="footer__social-link" target="_blank" rel="noopener noreferrer" aria-label="Rumble">
                    <svg class="footer__social-icon" viewBox="0 0 24 24">
                        <path d="M19.68 12.74c0 4.41-3.59 8-8 8s-8-3.59-8-8 3.59-8 8-8 8 3.59 8 8zm-8-6.4c-3.53 0-6.4 2.87-6.4 6.4s2.87 6.4 6.4 6.4 6.4-2.87 6.4-6.4-2.87-6.4-6.4-6.4zm3.6 6.4c0 1.99-1.61 3.6-3.6 3.6s-3.6-1.61-3.6-3.6 1.61-3.6 3.6-3.6 3.6 1.61 3.6 3.6z"/>
                    </svg>
                </a>
                <a href="#" class="footer__social-link" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                    <svg class="footer__social-icon" viewBox="0 0 24 24">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                </a>
            </div>
        </div>
    </footer>
    <script src="../../../assets/js/app.js"></script>
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

    // Extract all unique categories and tags for dynamic filter options
    const allCategories = [...new Set(papers.flatMap(p => p.attributes.categories || []))].sort();
    const allTags = [...new Set(papers.flatMap(p => p.attributes.tags || []))].sort();

    // Generate filter option HTML
    const categoryFilterOptions = allCategories.map(cat => 
      `<option value="${cat}">${cat}</option>`
    ).join('');

    const tagFilterOptions = allTags.map(tag => 
      `<option value="${tag}">${tag}</option>`
    ).join('');

    let updatedIndex = papersIndexTemplate
      .replace('<!-- HIGHLIGHTED_PAPERS_PLACEHOLDER -->', highlightedPapersHtml)
      .replace('<!-- ALL_PAPERS_PLACEHOLDER -->', otherPapersHtml)
      .replace('<!-- CATEGORY_FILTER_OPTIONS_PLACEHOLDER -->', categoryFilterOptions)
      .replace('<!-- TAG_FILTER_OPTIONS_PLACEHOLDER -->', tagFilterOptions);

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
