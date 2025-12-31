# फलक लेखन | Phalak Lekhan Gallery

A beautiful static website to showcase Phalak (board writing) images organized by categories.

## Features

- **Responsive Gallery**: Grid layout that adapts to different screen sizes
- **Category Filtering**: Filter images by category (Special Days, Personalities, Riddles, etc.)
- **Lightbox Viewer**: Click any image to view it in full size
- **Keyboard Navigation**: Use arrow keys to navigate between images in lightbox
- **Touch Support**: Swipe left/right on mobile devices to navigate
- **Image Information**: Displays image name, category, and position
- **Beautiful UI**: Gradient background with modern card-based design

## Project Structure

```
phalaklekhan-static/
├── index.html          # Main HTML file
├── styles.css          # Stylesheet
├── script.js           # JavaScript for gallery functionality
├── images.json         # Catalog of all images
├── generate-catalog.py # Script to regenerate images.json
├── phalakimages/      # Directory containing all images
└── README.md          # This file
```

## How to Use Locally

1. Open `index.html` in a web browser
2. The gallery will load all images from the catalog
3. Use the category filter to view specific categories
4. Click any image to view it in lightbox mode
5. Use arrow keys or navigation buttons to browse

## Deploying to GitHub Pages

### Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and log in
2. Click the "+" icon in the top right and select "New repository"
3. Name your repository (e.g., `phalak-gallery`)
4. Keep it public
5. Don't initialize with README (we already have files)
6. Click "Create repository"

### Step 2: Push Your Code

In your terminal, run these commands from the project directory:

```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Commit the files
git commit -m "Initial commit: Phalak Gallery"

# Add your GitHub repository as remote (replace USERNAME and REPO_NAME)
git remote add origin https://github.com/USERNAME/REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click "Settings" (top menu)
3. Scroll down to "Pages" in the left sidebar
4. Under "Source", select "main" branch
5. Click "Save"
6. Wait a few minutes for deployment
7. Your site will be available at: `https://USERNAME.github.io/REPO_NAME/`

## Regenerating the Image Catalog

If you add new images to the `phalakimages` folder, regenerate the catalog:

```bash
python3 generate-catalog.py
```

This will update `images.json` with all images found in the `phalakimages` directory.

## Customization

### Change Colors

Edit `styles.css` and modify the gradient in the `body` selector:

```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Add New Categories

Categories are automatically detected from folder names in the `phalakimages` directory. To customize display names, edit the `category_names` dictionary in `generate-catalog.py`.

### Modify Layout

- Change grid columns in `.gallery-grid` (in `styles.css`)
- Adjust thumbnail size by modifying `.gallery-item img` height
- Customize spacing with the `gap` property

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Technologies Used

- Pure HTML5
- CSS3 (Grid, Flexbox, Gradients)
- Vanilla JavaScript (ES6+)
- No external dependencies

## Image Requirements

- Supported formats: JPG, JPEG, PNG, GIF
- Images are loaded lazily for better performance
- Organized in folders by category

## Performance Tips

For large image collections:

1. Optimize images before uploading (compress JPGs)
2. Consider converting to WebP format
3. Use smaller dimensions if images are very large
4. GitHub Pages has a 1GB repository size limit

## License

Personal project - adjust as needed for your use case.

---

**Happy Viewing!** 📸
