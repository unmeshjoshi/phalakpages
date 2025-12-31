const fs = require('fs');
const path = require('path');

// Function to get all image files recursively
function getAllImages(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
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
const catalogArray = Object.keys(catalog).map(key => ({
  category: key,
  displayName: categoryNames[key] || key,
  images: catalog[key].sort((a, b) => a.name.localeCompare(b.name))
}));

// Sort categories
catalogArray.sort((a, b) => a.displayName.localeCompare(b.displayName));

// Write to file
fs.writeFileSync('images.json', JSON.stringify(catalogArray, null, 2));

console.log(`Catalog generated with ${images.length} images in ${catalogArray.length} categories`);
