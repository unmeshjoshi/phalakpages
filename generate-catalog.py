#!/usr/bin/env python3
import os
import json
import re

# Base URL for GitHub Pages
BASE_URL = 'https://unmeshjoshi.github.io/phalakpages'

# Function to get all image files recursively
def get_all_images(directory):
    images = []
    for root, dirs, files in os.walk(directory):
        # Skip folders starting with 'scan', or containing 'renamed' or 'test'
        dirs[:] = [d for d in dirs if not (
            d.lower().startswith('scan') or
            'renamed' in d.lower() or
            'test' in d.lower()
        )]

        for file in files:
            if re.match(r'.*\.(jpg|jpeg|png|gif)$', file, re.IGNORECASE):
                images.append(os.path.join(root, file))

    return images

# Get all images
images = get_all_images('./phalakimages')

# Organize by category (folder name)
catalog = {}

for image_path in images:
    # Remove './phalakimages/' prefix
    relative_path = image_path.replace('./phalakimages/', '')
    parts = relative_path.split(os.sep)

    if len(parts) == 1:
        category = 'Miscellaneous'
    else:
        category = parts[0]

    if category not in catalog:
        catalog[category] = []

    filename = os.path.basename(image_path)
    name = os.path.splitext(filename)[0]

    catalog[category].append({
        'path': image_path.replace('./', ''),
        'name': name,
        'filename': filename
    })

# Category name mapping
category_names = {
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
}

# Convert to array format
catalog_array = []
for key in catalog:
    if key == 'Miscellaneous':
        continue
    catalog_array.append({
        'category': key,
        'displayName': category_names.get(key, key),
        'images': sorted(catalog[key], key=lambda x: x['name'])
    })

# Sort categories
catalog_array.sort(key=lambda x: x['displayName'])

# Write to file
with open('images.json', 'w', encoding='utf-8') as f:
    json.dump(catalog_array, f, indent=2, ensure_ascii=False)

print(f"Catalog generated with {len(images)} images in {len(catalog_array)} categories")

# Generate HTML files with Open Graph meta tags
def generate_og_html_files(catalog_array):
    file_count = 0

    for cat in catalog_array:
        for img in cat['images']:
            image_dir = os.path.join('image', cat['category'], img['name'])
            image_path = img['path']
            image_url = f"{BASE_URL}/{image_path}"
            page_url = f"{BASE_URL}/image/{cat['category']}/{img['name']}"

            # Create directory structure
            os.makedirs(image_dir, exist_ok=True)

            # Generate HTML with OG meta tags
            html = f'''<!DOCTYPE html>
<html lang="mr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{img['name']} | फलक लेखन</title>

    <!-- Open Graph meta tags for social sharing -->
    <meta property="og:title" content="{img['name']} | फलक लेखन">
    <meta property="og:description" content="{cat['displayName']} - Phalak Lekhan Collection">
    <meta property="og:image" content="{image_url}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:url" content="{page_url}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="फलक लेखन | Phalak Lekhan">

    <!-- Twitter Card meta tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{img['name']} | फलक लेखन">
    <meta name="twitter:description" content="{cat['displayName']} - Phalak Lekhan Collection">
    <meta name="twitter:image" content="{image_url}">

    <!-- Redirect to main SPA -->
    <script>
        sessionStorage.setItem('spa-redirect-path', window.location.pathname);
        window.location.replace('/phalakpages/');
    </script>
</head>
<body>
    <p>Loading {img['name']}...</p>
    <img src="{BASE_URL}/{image_path}" alt="{img['name']}" style="max-width: 100%;">
</body>
</html>'''

            with open(os.path.join(image_dir, 'index.html'), 'w', encoding='utf-8') as f:
                f.write(html)

            file_count += 1

    print(f"Generated {file_count} HTML files with Open Graph meta tags")

# Generate the OG HTML files
generate_og_html_files(catalog_array)
