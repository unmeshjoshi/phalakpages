// Global variables
let catalog = [];
let allImages = [];
let currentImageIndex = 0;
let filteredImages = [];

// DOM Elements
const categoryView = document.getElementById('category-view');
const galleryView = document.getElementById('gallery-view');
const categoryCards = document.getElementById('category-cards');
const gallery = document.getElementById('gallery');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const closeBtn = document.querySelector('.close-btn');
const backBtn = document.querySelector('.back-btn');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');
const carousel = document.getElementById('carousel');
const totalCount = document.getElementById('total-count');
const totalCountDisplay = document.getElementById('total-count-display');
const totalCategories = document.getElementById('total-categories');
const currentCategoryTitle = document.getElementById('current-category');
const currentCount = document.getElementById('current-count');
const backToCategoriesBtn = document.getElementById('back-to-categories');

// URL hash management for shareable links and navigation
function updateURLForCategory(categoryId) {
    const hash = `#category/${encodeURIComponent(categoryId)}`;
    history.pushState(null, null, hash);
}

function updateURLForHome() {
    history.pushState(null, null, window.location.pathname);
}

function updateURL(image) {
    if (!image) return;
    const category = encodeURIComponent(image.category);
    const name = encodeURIComponent(image.name);
    const hash = `#image/${category}/${name}`;
    history.pushState(null, null, hash);
}

function parseHashRoute() {
    const hash = window.location.hash;

    if (!hash || hash === '#') {
        return { type: 'home' };
    }

    if (hash.startsWith('#category/')) {
        const categoryId = decodeURIComponent(hash.substring(10));
        return { type: 'category', categoryId };
    }

    if (hash.startsWith('#image/')) {
        const parts = hash.substring(7).split('/');
        if (parts.length === 2) {
            return {
                type: 'image',
                category: decodeURIComponent(parts[0]),
                name: decodeURIComponent(parts[1])
            };
        }
    }

    return { type: 'home' };
}

function findImageByIdentifier(category, name) {
    return allImages.find(img =>
        img.category === category && img.name === name
    );
}

function getImageIndexInFiltered(image) {
    return filteredImages.findIndex(img =>
        img.category === image.category && img.name === image.name
    );
}

// Load catalog and initialize
async function init() {
    try {
        const response = await fetch('images.json');
        catalog = await response.json();

        // Flatten all images with category info
        catalog.forEach(cat => {
            cat.images.forEach(img => {
                allImages.push({
                    ...img,
                    category: cat.category,
                    displayName: cat.displayName
                });
            });
        });

        filteredImages = [...allImages];
        totalCount.textContent = allImages.length;
        totalCountDisplay.textContent = allImages.length;
        totalCategories.textContent = catalog.length;

        renderCategoryCards();

        // Handle initial URL route
        handleRoute();
    } catch (error) {
        console.error('Error loading catalog:', error);
        gallery.innerHTML = '<div class="loading">Error loading images. Please make sure images.json exists.</div>';
    }
}

// Render category cards
function renderCategoryCards() {
    categoryCards.innerHTML = '';

    // Define custom sort order
    const categoryOrder = ['vyakti', 'dinvishesh', 'lalit', 'vaishishtya', 'kodi'];

    // Sort catalog based on custom order
    const sortedCatalog = [...catalog].sort((a, b) => {
        const indexA = categoryOrder.indexOf(a.category);
        const indexB = categoryOrder.indexOf(b.category);

        // If both are in the order list, sort by their position
        if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB;
        }
        // If only A is in the list, it comes first
        if (indexA !== -1) return -1;
        // If only B is in the list, it comes first
        if (indexB !== -1) return 1;
        // If neither is in the list, sort alphabetically
        return a.displayName.localeCompare(b.displayName);
    });

    sortedCatalog.forEach(cat => {
        const card = document.createElement('div');
        card.className = 'category-card';

        // Use first image as preview
        const previewImage = cat.images[0];

        card.innerHTML = `
            <img class="category-card-image" src="${previewImage.path}" alt="${cat.displayName}" loading="lazy">
            <div class="category-card-content">
                <h3 class="category-card-title">${cat.displayName}</h3>
                <p class="category-card-count">${cat.images.length} images</p>
            </div>
        `;

        card.addEventListener('click', () => openCategory(cat));
        categoryCards.appendChild(card);
    });
}

// Open a category
function openCategory(category, updateURL = true) {
    // Filter images for this category
    filteredImages = allImages.filter(img => img.category === category.category);

    // Update UI
    currentCategoryTitle.textContent = category.displayName;
    currentCount.textContent = filteredImages.length;

    // Show gallery view, hide category view
    categoryView.style.display = 'none';
    galleryView.style.display = 'block';

    // Render gallery
    renderGallery(filteredImages);

    // Update URL
    if (updateURL) {
        updateURLForCategory(category.category);
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Back to categories
function showCategoryView(updateURL = true) {
    categoryView.style.display = 'block';
    galleryView.style.display = 'none';

    if (updateURL) {
        updateURLForHome();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Render gallery
function renderGallery(images) {
    gallery.innerHTML = '';

    if (images.length === 0) {
        gallery.innerHTML = '<div class="loading">No images found in this category.</div>';
        return;
    }

    images.forEach((img, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.innerHTML = `
            <img src="${img.path}" alt="${img.name}" loading="lazy">
            <div class="gallery-item-info">
                <h3>${img.name}</h3>
                <span class="category-badge">${img.displayName}</span>
            </div>
        `;

        item.addEventListener('click', () => openLightbox(index));
        gallery.appendChild(item);
    });
}

// Back to categories button
backToCategoriesBtn.addEventListener('click', showCategoryView);

// Open lightbox
function openLightbox(index, updateURL = true) {
    currentImageIndex = index;
    populateCarousel();
    updateLightboxImage(updateURL);
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close lightbox
function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = 'auto';

    // Get the current image to find its category
    const currentImage = filteredImages[currentImageIndex];
    if (currentImage) {
        // Navigate directly to the category URL
        const categoryHash = `#category/${encodeURIComponent(currentImage.category)}`;
        history.pushState(null, null, categoryHash);
        // Trigger route handler won't work here, so just keep the view as is
    }
}

// Update lightbox image
function updateLightboxImage(updateURLFlag = true, replaceState = false) {
    const img = filteredImages[currentImageIndex];
    lightboxImg.src = img.path;
    updateCarousel();

    // Update URL hash when navigating
    if (updateURLFlag) {
        const category = encodeURIComponent(img.category);
        const name = encodeURIComponent(img.name);
        const hash = `#image/${category}/${name}`;

        if (replaceState) {
            // Replace current history entry instead of adding new one
            history.replaceState(null, null, hash);
        } else {
            // Add new history entry
            history.pushState(null, null, hash);
        }
    }
}

// Populate carousel with all images
function populateCarousel() {
    carousel.innerHTML = '';

    filteredImages.forEach((img, index) => {
        const item = document.createElement('div');
        item.className = 'carousel-item';
        if (index === currentImageIndex) {
            item.classList.add('active');
        }

        const imgEl = document.createElement('img');
        imgEl.src = img.path;
        imgEl.alt = img.name;
        imgEl.loading = 'lazy';

        item.appendChild(imgEl);
        item.addEventListener('click', () => {
            currentImageIndex = index;
            updateLightboxImage();
        });

        carousel.appendChild(item);
    });

    scrollCarouselToActive();
}

// Update carousel active state
function updateCarousel() {
    const items = carousel.querySelectorAll('.carousel-item');
    items.forEach((item, index) => {
        if (index === currentImageIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    scrollCarouselToActive();
}

// Scroll carousel to show active image
function scrollCarouselToActive() {
    const activeItem = carousel.querySelector('.carousel-item.active');
    if (activeItem) {
        activeItem.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
        });
    }
}

// Navigate to next image
function nextImage() {
    currentImageIndex = (currentImageIndex + 1) % filteredImages.length;
    updateLightboxImage(true, true);
}

// Navigate to previous image
function prevImage() {
    currentImageIndex = (currentImageIndex - 1 + filteredImages.length) % filteredImages.length;
    updateLightboxImage(true, true);
}

// Event listeners
closeBtn.addEventListener('click', closeLightbox);
backBtn.addEventListener('click', closeLightbox);
nextBtn.addEventListener('click', nextImage);
prevBtn.addEventListener('click', prevImage);

// Close lightbox when clicking outside image
lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
        closeLightbox();
    }
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;

    switch(e.key) {
        case 'Escape':
            closeLightbox();
            break;
        case 'ArrowRight':
            nextImage();
            break;
        case 'ArrowLeft':
            prevImage();
            break;
    }
});

// Touch support for mobile swipe
let touchStartX = 0;
let touchEndX = 0;

lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

lightbox.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            nextImage();
        } else {
            prevImage();
        }
    }
}

// Handle browser back/forward and direct links via URL hash
window.addEventListener('popstate', handleRoute);

function handleRoute() {
    const route = parseHashRoute();

    switch (route.type) {
        case 'home':
            // Show category cards view
            if (lightbox.classList.contains('active')) {
                closeLightboxWithoutURLChange();
            }
            if (galleryView.style.display !== 'none') {
                showCategoryView(false);
            }
            break;

        case 'category':
            // Show gallery for this category
            const category = catalog.find(cat => cat.category === route.categoryId);
            if (category) {
                if (lightbox.classList.contains('active')) {
                    closeLightboxWithoutURLChange();
                }
                openCategory(category, false);
            }
            break;

        case 'image':
            // Show image in lightbox
            const image = findImageByIdentifier(route.category, route.name);
            if (!image) {
                console.warn(`Image not found: ${route.category}/${route.name}`);
                return;
            }

            // First, ensure we're in the right category view
            const imageCategory = catalog.find(cat => cat.category === image.category);
            if (imageCategory) {
                // Check if we need to open the category first
                if (galleryView.style.display === 'none') {
                    openCategory(imageCategory, false);
                }

                // Then open the lightbox
                const indexInFiltered = getImageIndexInFiltered(image);
                if (indexInFiltered !== -1) {
                    openLightbox(indexInFiltered, false);
                }
            }
            break;
    }
}

// Helper to close lightbox without updating URL (prevents loop)
function closeLightboxWithoutURLChange() {
    lightbox.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Initialize on load
init();
