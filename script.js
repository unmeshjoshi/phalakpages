// Global variables
let catalog = [];
let allImages = [];
let currentImageIndex = 0;
let filteredImages = [];

// DOM Elements
const gallery = document.getElementById('gallery');
const categoryFilter = document.getElementById('category-filter');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const closeBtn = document.querySelector('.close-btn');
const backBtn = document.querySelector('.back-btn');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');
const carousel = document.getElementById('carousel');
const totalCount = document.getElementById('total-count');

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

        populateCategoryFilter();
        renderGallery(filteredImages);
    } catch (error) {
        console.error('Error loading catalog:', error);
        gallery.innerHTML = '<div class="loading">Error loading images. Please make sure images.json exists.</div>';
    }
}

// Populate category filter dropdown
function populateCategoryFilter() {
    catalog.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.category;
        option.textContent = `${cat.displayName} (${cat.images.length})`;
        categoryFilter.appendChild(option);
    });
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

// Filter by category
categoryFilter.addEventListener('change', (e) => {
    const selectedCategory = e.target.value;

    if (selectedCategory === 'all') {
        filteredImages = [...allImages];
    } else {
        filteredImages = allImages.filter(img => img.category === selectedCategory);
    }

    renderGallery(filteredImages);
});

// Open lightbox
function openLightbox(index) {
    currentImageIndex = index;
    populateCarousel();
    updateLightboxImage();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close lightbox
function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Update lightbox image
function updateLightboxImage() {
    const img = filteredImages[currentImageIndex];
    lightboxImg.src = img.path;
    updateCarousel();
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
    updateLightboxImage();
}

// Navigate to previous image
function prevImage() {
    currentImageIndex = (currentImageIndex - 1 + filteredImages.length) % filteredImages.length;
    updateLightboxImage();
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

// Initialize on load
init();
