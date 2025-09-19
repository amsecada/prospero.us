const fs = require('fs-extra');
const path = require('path');
const frontMatter = require('front-matter');
const MarkdownIt = require('markdown-it');
const hljs = require('highlight.js');

// Configure markdown parser
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (__) {}
    }
    return ''; // use external default escaping
  }
});

// Paths
const CONTENT_DIR = path.join(__dirname, '../content');
const INDIVIDUAL_DIR = path.join(__dirname, '../individual');
const OUTPUT_FILE = path.join(__dirname, '../index.html');

// Helper function to render paper card
function renderPaperCard(paper) {
  return `
    <div class="paper-card" onclick="window.location.href='${paper.slug}'">
        <h3 class="paper-card__title">${paper.attributes.title}</h3>
        <div class="paper-meta">
            <span class="meta-item">${new Date(paper.attributes.date).toLocaleDateString()}</span>
            ${paper.attributes.categories?.map(cat => `<span class="meta-item">${cat}</span>`).join('')}
        </div>
        <p class="paper-card__abstract">${paper.attributes.abstract || ''}</p>
        <a href="${paper.slug}" class="paper-card__link">Read paper →</a>
    </div>
  `;
}

// Individual paper template - simplified with consistent relative paths
const individualTemplate = (paper, paperSlug) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${paper.attributes.title} - Prospero</title>
    <meta name="description" content="${paper.attributes.abstract || 'Research paper from Prospero'}">
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- CSS -->
    <link rel="stylesheet" href="../../assets/css/styles.css">
    <link rel="stylesheet" href="../../assets/css/papers.css">
    
    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="../../assets/img/logo.svg">
    
    <style>
        .paper-header {
            padding: var(--space-3xl) 0;
            background: linear-gradient(135deg, var(--surface) 0%, var(--bg) 100%);
        }
        
        .paper-header__title {
            font-size: clamp(2rem, 4vw, 3rem);
            font-weight: 700;
            margin-bottom: var(--space-md);
            color: var(--text);
        }
        
        .paper-meta-large {
            display: flex;
            flex-wrap: wrap;
            gap: var(--space-md);
            margin-bottom: var(--space-lg);
        }
        
        .meta-item-large {
            background: var(--bg);
            padding: var(--space-sm) var(--space-md);
            border-radius: var(--radius-md);
            font-size: 0.9rem;
            color: var(--muted);
        }
        
        .paper-abstract {
            font-size: 1.125rem;
            line-height: 1.7;
            color: var(--muted);
            margin-bottom: var(--space-xl);
            padding: var(--space-lg);
            background: var(--surface);
            border-radius: var(--radius-lg);
            border-left: 4px solid var(--p-400);
        }
        
        .paper-content {
            max-width: 800px;
            margin: 0 auto;
            padding: var(--space-3xl) 0;
        }
        
        .paper-content h2 {
            font-size: 1.75rem;
            font-weight: 600;
            margin: var(--space-2xl) 0 var(--space-lg) 0;
            color: var(--text);
        }
        
        .paper-content h3 {
            font-size: 1.5rem;
            font-weight: 600;
            margin: var(--space-xl) 0 var(--space-md) 0;
            color: var(--text);
        }
        
        .paper-content p {
            font-size: 1.125rem;
            line-height: 1.7;
            color: var(--muted);
            margin-bottom: var(--space-lg);
        }
        
        .paper-content code {
            background: var(--surface);
            padding: 0.2em 0.4em;
            border-radius: var(--radius-sm);
            font-size: 0.9em;
            color: var(--p-400);
        }
        
        .paper-content pre {
            background: var(--surface);
            padding: var(--space-md);
            border-radius: var(--radius-md);
            overflow-x: auto;
            margin: var(--space-lg) 0;
        }
        
        .paper-content pre code {
            background: none;
            padding: 0;
            color: inherit;
        }
        
        .back-link {
            display: inline-flex;
            align-items: center;
            gap: var(--space-sm);
            color: var(--p-400);
            text-decoration: none;
            font-weight: 500;
            margin-bottom: var(--space-xl);
        }
        
        .back-link:hover {
            color: var(--p-500);
        }
        
        .toc-container {
            background: var(--surface);
            padding: var(--space-lg);
            border-radius: var(--radius-lg);
            margin: var(--space-xl) 0;
        }
        
        .toc-title {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: var(--space-md);
            color: var(--text);
        }
        
        .toc-list {
            list-style: none;
        }
        
        .toc-item {
            margin-bottom: var(--space-xs);
        }
        
        .toc-link {
            color: var(--muted);
            text-decoration: none;
            transition: var(--transition);
        }
        
        .toc-link:hover {
            color: var(--p-400);
        }
    </style>
</head>
<body>
    <!-- Skip to content link for accessibility -->
    <a href="#main-content" class极狐="skip-to-content">Skip to main content</a>
    
    <!-- Header -->
    <header class="header">
        <div class="container">
            <div class="header__inner">
                <!-- Logo -->
                <a href="../../index.html" class="logo">
                    <img src="../../assets/img/logo.svg" alt="Prospero logo" class="logo__image">
                    <span class="logo__text">Prospero</span>
                </a>
                
                <!-- Desktop Navigation -->
                <nav class="nav">
                    <ul class="nav__list">
                        <li><a href="../../index.html" class="nav__link">Home</a></li>
                        <li><a href="../../about.html" class="nav__link">About</a></li>
                        <li><a href="../index.html" class="nav__link nav__link--active">Papers</a></li>
                        <li><a href="#" class="nav__link">Projects</a></li>
                        <li><a href="#" class="nav__link">Contact</a></li>
                    </ul>
                </nav>
                
                <!-- Mobile Menu Toggle -->
                <button class="mobile-toggle" aria-label="Toggle menu" aria-expanded="false">
                    <span class="mobile-toggle__bar"></span>
                    <span class="mobile-toggle__bar"></span>
                    <span class="mobile-toggle__bar"></span>
                </button>
            </div>
        </div>
    </header>
    
    <!-- Mobile Navigation (hidden by default) -->
    <nav class="mobile-nav" aria-hidden="true">
        <ul class="mobile-nav__list">
            <li><a href="../../index.html" class="mobile-nav__link">Home</a></li>
            <li><a href="../../about.html" class="mobile-nav__link">About</a></li>
            <li><a href="../index.html" class="mobile-nav__link mobile-nav__link--active">Papers</a></li>
            <li><a href="#" class="mobile-nav__link">Projects</a></li>
            <li><a href="#" class="mobile-nav__link">Contact</a></li>
        </ul>
    </nav>
    
    <!-- Main Content -->
    <main id="main-content" class="main">
        <!-- Paper Header -->
        <section class="paper-header">
            <div class="container">
                <a href="../index.html" class="back-link">← Back to Papers</a>
                <h1 class="paper-header__title">${paper.attributes.title}</h1>
                
                <div class="paper-meta-large">
                    <span class="meta-item-large">By ${paper.attributes.author}</span>
                    <span class="meta-item-large">${new Date(paper.attributes.date).toLocaleDateString()}</span>
                    ${paper.attributes.categories?.map(cat => `<span class="meta-item-large">${cat}</span>`).join('')}
                    ${paper.attributes.tags?.map(tag => `<span class="meta-item-large">#${tag}</span>`).join('')}
                </div>
                
                ${paper.attributes.abstract ? `
                <div class="paper-abstract">
                    <strong>Abstract:</strong> ${paper.attributes.abstract}
                </div>
                ` : ''}
            </div>
        </section>
        
        <!-- Table of Contents -->
        <div class="container">
            <div class="toc-container">
                <h3 class="toc-title">Table of Contents</h3>
                <ul class="极狐 toc-list" id="toc-list">
                    <!-- Table of contents will be generated by JavaScript -->
                </ul>
            </div>
        </div>
        
        <!-- Paper Content -->
        <article class="paper-content">
            <div class="container">
                ${paper.html}
            </div>
        </article>
    </main>
    
    <!-- Footer -->
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
    
    <!-- JavaScript -->
    <script src="../../assets/js/app.js"></script>
    <script>
        // Generate table of contents
        document.addEventListener('DOMContentLoaded', function() {
            const headings = document.querySelectorAll('.paper-content h2, .paper-content h3');
            const tocList = document.getElementById('toc-list');
            
            headings.forEach(heading => {
                const id = heading.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                heading.id = id;
                
                const listItem = document.createElement('li');
                listItem.className = 'toc-item';
                
                const link = document.createElement('a');
                link.href = '#' + id;
                link.className = 'toc-link';
                link.textContent = heading.textContent;
                
                if (heading.tagName === 'H3') {
                    link.style.marginLeft = '1rem';
                }
                
                listItem.appendChild(link);
                tocList.appendChild(listItem);
            });
        });
    </script>
</body>
</html>
`;

// Main generation function
async function generatePapers() {
    try {
        // Ensure directories exist
        await fs.ensureDir(INDIVIDUAL_DIR);
        
        // Read all markdown files
        const files = await fs.readdir(CONTENT_DIR);
        const markdownFiles = files.filter(file => file.endsWith('.md'));
        
        const papers = [];
        const allCategories = new Set();
        const allTags = new Set();
        
        // Process each markdown file
        for (const file of markdownFiles) {
            const filePath = path.join(CONTENT_DIR, file);
            const content = await fs.readFile(filePath, 'utf8');
            
            // Parse frontmatter and markdown
            const { attributes, body } = frontMatter(content);
            const html = md.render(body);
            
            // Generate slug from filename
            const slug = file.replace('.md', '');
            
            // Collect categories and tags
            if (attributes.categories) {
                attributes.categories.forEach(cat => allCategories.add(cat));
            }
            if (attributes.tags) {
                attributes.tags.forEach(tag => allTags.add(tag));
            }
            
            const paper = {
                slug: `individual/${slug}/index.html`,
                attributes,
                html
            };
            
            papers.push(paper);
            
            // Generate individual paper page
            const individualHtml = individualTemplate(paper, slug);
            const individualDir = path.join(INDIVIDUAL_DIR, slug);
            await fs.ensureDir(individualDir);
            await fs.writeFile(path.join(individualDir, 'index.html'), individualHtml);
        }
        
        // Sort papers by date (newest first)
        papers.sort((a, b) => new Date(b.attributes.date) - new Date(a.attributes.date));
        
        // Generate main papers page (using existing index.html as template)
        const existingIndex = await fs.readFile(OUTPUT_FILE, 'utf8');
        await fs.writeFile(OUTPUT_FILE, existingIndex);
        
        console.log(`Generated ${papers.length} paper pages`);
        console.log('Papers index updated at:', OUTPUT_FILE);
        
    } catch (error) {
        console.error('Error generating papers:', error);
        process.exit(1);
    }
}

// Run the generation
generatePapers();
