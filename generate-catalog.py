import os
import json
from pathlib import Path

# Get all image files, filtering out unwanted folders
images = []
phalak_dir = Path('phalakimages')

for img_path in phalak_dir.rglob('*'):
    if img_path.is_file() and img_path.suffix.lower() in ['.jpg', '.jpeg', '.png', '.gif']:
        # Check if any parent folder should be excluded
        path_parts = img_path.parts
        should_skip = False
        for part in path_parts:
            part_lower = part.lower()
            # Filter: starts with 'scan' or 'additional', contains 'renamed'/'test', or is just a number
            if (part_lower.startswith('scan') or
                part_lower.startswith('additional') or
                'renamed' in part_lower or
                'test' in part_lower or
                part.isdigit()):
                should_skip = True
                break

        if not should_skip:
            images.append(str(img_path))

# Organize by category
catalog = {}

for img_path in images:
    # Get relative path from phalakimages
    rel_path = img_path.replace('phalakimages/', '')
    parts = rel_path.split('/')

    if len(parts) == 1:
        # Root level images
        category = 'Miscellaneous'
    else:
        # Use parent folder as category
        category = parts[0]

    if category not in catalog:
        catalog[category] = []

    catalog[category].append({
        'path': img_path,
        'name': Path(img_path).stem,
        'filename': Path(img_path).name
    })

# Category name mapping
category_names = {
    '1': 'Collection 1',
    '2': 'Collection 2',
    '3': 'Collection 3',
    'dinvishesh': 'दिनविशेष (Special Days)',
    'vyakti': 'व्यक्ती (Personalities)',
    'vaishishtya': 'वैशिष्ट्यपूर्ण',
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

# Convert to array format, filtering out root-level images
catalog_array = []
for key, value in catalog.items():
    if key == 'Miscellaneous':  # Don't show root-level images
        continue

    catalog_array.append({
        'category': key,
        'displayName': category_names.get(key, key),
        'images': sorted(value, key=lambda x: x['name'])
    })

# Sort categories
catalog_array.sort(key=lambda x: x['displayName'])

# Write to file
with open('images.json', 'w', encoding='utf-8') as f:
    json.dump(catalog_array, f, ensure_ascii=False, indent=2)

print(f'Catalog generated with {len(images)} images in {len(catalog_array)} categories')
