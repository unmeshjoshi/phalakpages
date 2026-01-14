const fs = require('fs');
const path = require('path');

// Base URL for GitHub Pages (update this to match your deployment)
const BASE_URL = 'https://unmeshjoshi.github.io/phalakpages';

// Function to get all image files recursively
function getAllImages(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      const folderName = file.toLowerCase();
      // Skip folders starting with 'scan', or containing 'renamed' or 'test'
      if (folderName.startsWith('scan') || folderName.includes('renamed') || folderName.includes('test')) {
        return; // Skip this folder
      }
      getAllImages(filePath, fileList);
    } else if (/\.(jpg|jpeg|png|gif)$/i.test(file)) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Get all images
const images = getAllImages('./phalakimages');

// Organize by category (folder name)
const catalog = {};

images.forEach(imagePath => {
  // Remove './phalakimages/' prefix and split by path separator
  const relativePath = imagePath.replace('./phalakimages/', '');
  const parts = relativePath.split(path.sep);

  let category;
  if (parts.length === 1) {
    // Root level images
    category = 'Miscellaneous';
  } else {
    // Use the parent folder as category
    category = parts[0];
  }

  if (!catalog[category]) {
    catalog[category] = [];
  }

  catalog[category].push({
    path: imagePath.replace('./', ''),
    name: path.basename(imagePath, path.extname(imagePath)),
    filename: path.basename(imagePath)
  });
});

// Create a friendly category name mapping
const categoryNames = {
  '1': 'Collection 1',
  '2': 'Collection 2',
  '3': 'Collection 3',
  'dinvishesh': 'दिनविशेष (Special Days)',
  'vyakti': 'व्यक्ती (Personalities)',
  'vaishishtya': 'वैशिष्ट्य (Distinguished)',
  'kodi': 'कोडी (Riddles)',
  'lalit': 'ललित (Creative)',
  'additional-dina': 'Additional - Special Days',
  'additional-vaishis': 'Additional - Distinguished',
  'Scan': 'Scanned Collection',
  'Scan 26-03-2014': 'Scanned Collection (March 2014)',
  'vyakti-renamed': 'Personalities (Renamed)',
  'vyaktitest': 'Personalities (Test)',
  'Miscellaneous': 'Miscellaneous'
};

// Convert to array format
const catalogArray = Object.keys(catalog)
  .filter(key => key !== 'Miscellaneous') // Don't show root-level images
  .map(key => ({
    category: key,
    displayName: categoryNames[key] || key,
    images: catalog[key].sort((a, b) => a.name.localeCompare(b.name))
  }));

// Sort categories
catalogArray.sort((a, b) => a.displayName.localeCompare(b.displayName));

// Write to file
fs.writeFileSync('images.json', JSON.stringify(catalogArray, null, 2));

console.log(`Catalog generated with ${images.length} images in ${catalogArray.length} categories`);

// Generate HTML files with Open Graph meta tags for social sharing
function generateOGHtmlFiles(catalogArray) {
  let fileCount = 0;

  catalogArray.forEach(cat => {
    cat.images.forEach(img => {
      const imageDir = path.join('image', cat.category, img.name);
      const imagePath = img.path;
      const imageUrl = `${BASE_URL}/${imagePath}`;
      const pageUrl = `${BASE_URL}/image/${cat.category}/${img.name}`;

      // Create directory structure
      fs.mkdirSync(imageDir, { recursive: true });

      // Generate HTML with OG meta tags
      const html = `<!DOCTYPE html>
<html lang="mr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${img.name} | फलक लेखन</title>

    <!-- Open Graph meta tags for social sharing -->
    <meta property="og:title" content="${img.name} | फलक लेखन">
    <meta property="og:description" content="${cat.displayName} - Phalak Lekhan Collection">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:url" content="${pageUrl}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="फलक लेखन | Phalak Lekhan">

    <!-- Twitter Card meta tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${img.name} | फलक लेखन">
    <meta name="twitter:description" content="${cat.displayName} - Phalak Lekhan Collection">
    <meta name="twitter:image" content="${imageUrl}">

    <!-- Redirect to main SPA -->
    <script>
        // Store the current path and redirect to SPA
        sessionStorage.setItem('spa-redirect-path', window.location.pathname);
        window.location.replace('/phalakpages/');
    </script>
</head>
<body>
    <p>Loading ${img.name}...</p>
    <img src="${BASE_URL}/${imagePath}" alt="${img.name}" style="max-width: 100%;">
</body>
</html>`;

      fs.writeFileSync(path.join(imageDir, 'index.html'), html);
      fileCount++;
    });
  });

  console.log(`Generated ${fileCount} HTML files with Open Graph meta tags`);
}

// Generate the OG HTML files
generateOGHtmlFiles(catalogArray);
