# Prospero Static Site

A clean, minimal static website built with pure HTML, CSS, and JavaScript.

## Local Development

To view the site locally:

1. **Simple method**: Open `site/index.html` directly in your web browser
2. **Local server method**: Run `python -m http.server 8000` in the site directory, then visit `http://localhost:8000`

## Customization

### Colors
Edit the CSS variables in `assets/css/styles.css`:
```css
:root {
  --bg: #0b0b10;        /* Background color */
  --surface: #111119;   /* Surface/container color */
  --text: #eaeaf2;      /* Primary text color */
  --muted: #a2a2b8;     /* Muted/secondary text */
  --p-400: #9a6cff;     /* Purple accent 400 */
  --p-500: #7d4aff;     /* Purple accent 500 */
  --p-600: #6a36f4;     /* Purple accent 600 */
}
```

### Fonts
The site uses Google Fonts Inter. To change fonts:
1. Update the font import in `index.html`
2. Update the font-family in `styles.css`

### Images
- **Logo**: Replace `assets/img/logo.svg` with your SVG logo
- **Hero image**: Replace `assets/img/hero.jpg` with your hero image

## Deployment

### GitHub Pages
To deploy on GitHub Pages:
1. Publish the `/site` directory as your Pages source, OR
2. Use a `gh-pages` branch containing the site files

The site uses relative paths and will work correctly on GitHub Pages.

## Features
- Mobile-first responsive design
- Accessibility compliant (ARIA labels, semantic HTML)
- Purple/black/gray color theme
- Sticky navigation with mobile hamburger menu
- Clean, maintainable code structure
