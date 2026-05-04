// Sola Shopping - Main Application Logic

// State Management
const state = {
    products: [],
    cart: [],
    wishlist: [],
    currentCategory: 'all',
    currentGender: 'all',
    searchQuery: '',
    sortBy: 'featured',
    user: {
        id: null,
        name: null,
        email: null
    }
};

// URL State Management for Branch Journeys targeting
const URLStateManager = {
    updateURL(view, params = {}) {
        const url = new URL(window.location.href);

        if (view === 'home' || view === null) {
            // Clear all view params for home
            url.search = '';
        } else {
            // Set view parameter
            url.searchParams.set('view', view);

            // Add additional parameters (e.g., product_id, order_id)
            Object.keys(params).forEach(key => {
                if (params[key]) {
                    url.searchParams.set(key, params[key]);
                }
            });
        }

        // Update URL without page reload
        window.history.pushState({ view, ...params }, '', url.toString());

        console.log('[URL] State updated:', view, params);
        console.log('[Journeys] URL state changed:', view);

        // Notify Branch of the navigation for Journey re-evaluation
        this.notifyBranchNavigation(view, params);
    },

    notifyBranchNavigation(view, params) {
        if (typeof branch === 'undefined') {
            console.log('[Journeys] Branch SDK available: false');
            return;
        }

        console.log('[Journeys] Branch SDK available: true');

        // Journey re-evaluation is now handled by closeJourney/track in showProductModal
        // This method just updates URL state for non-product views
        if (view !== 'product') {
            const trackData = {
                page: view || 'home',
                vertical: 'shopping',
                url: window.location.href
            };

            // Add specific params for context
            if (params.order_id) trackData.order_id = params.order_id;

            branch.track('pageview', trackData);
            console.log('[Journeys] Re-evaluation for non-product view');
        }
    },

    getCurrentView() {
        const params = new URLSearchParams(window.location.search);
        return params.get('view') || 'home';
    },

    getParam(key) {
        const params = new URLSearchParams(window.location.search);
        return params.get(key);
    }
};

// Load products from local JSON with CDN fallback
async function loadProducts() {
    // Try loading from local path first (relative to web directory)
    try {
        const response = await fetch('../../assets/skus.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Combine all products into a single array
        state.products = [
            ...data.clothes,
            ...data.shoes,
            ...data.electronics
        ];

        console.log(`Loaded ${state.products.length} products from local JSON`);
        renderProducts();
        return;
    } catch (localError) {
        console.warn('Failed to load products from local path, trying CDN fallback:', localError);
        
        // Try loading from CDN as fallback
        try {
            console.log('Attempting to fetch from CDN: https://sola-shopping.com/assets/skus.json');
            const response = await fetch('https://sola-shopping.com/assets/skus.json', {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Combine all products into a single array
            state.products = [
                ...data.clothes,
                ...data.shoes,
                ...data.electronics
            ];
            
            console.log(`Loaded ${state.products.length} products from CDN fallback`);
            renderProducts();
            return;
        } catch (cdnError) {
            console.error('Failed to load products from CDN:', cdnError);
            console.error('Error details:', {
                name: cdnError.name,
                message: cdnError.message,
                stack: cdnError.stack
            });
            // Use complete product data as final fallback
            console.log('Using hardcoded product catalog as final fallback');
            loadFullProductCatalog();
        }
    }
}

// Complete product catalog fallback
function loadFullProductCatalog() {
    const productData = {
        "clothes": [
            {"id": "33ihffh3ik", "name": "T-Shirt", "price": 25.00, "image": "https://f004.backblazeb2.com/file/sola-shopping/full/sola-shopping-mens-black-t-m.png", "description": "A comfortable t-shirt for everyday wear.", "subcategory": "tops", "color": "black", "size": "M", "quantity": 100, "gender": "men"},
            {"id": "33iheffh3ik", "name": "Gray T-Shirt", "price": 25.00, "image": "https://f004.backblazeb2.com/file/sola-shopping/full/sola-shopping-mens-t-gray.png", "description": "A comfortable t-shirt for everyday wear.", "subcategory": "tops", "color": "gray", "size": "M", "quantity": 100, "gender": "men"},
            {"id": "33ihfffwh3ik", "name": "Light Gray T-Shirt", "price": 25.00, "image": "https://f004.backblazeb2.com/file/sola-shopping/full/sola-shopping-mens-t-light-gray.png", "description": "A comfortable t-shirt for everyday wear.", "subcategory": "tops", "color": "light gray", "size": "M", "quantity": 100, "gender": "men"},
            {"id": "abfw33u4gwfwh4f", "name": "Summer Dress", "price": 45.00, "image": "https://f004.backblazeb2.com/file/sola-shopping/full/sola-shopping-womens-floral-dress.png", "description": "A comfortable summer dress for everyday wear.", "subcategory": "dresses", "color": "floral", "size": "S", "quantity": 50, "gender": "women"},
            {"id": "abfw33u4gwgfh4f", "name": "Blue Empire Dress", "price": 45.00, "image": "https://f004.backblazeb2.com/file/sola-shopping/full/sola-shopping-womens-empire-dress-blue.png", "description": "A comfortable blue empire dress for everyday wear.", "subcategory": "dresses", "color": "blue", "size": "S", "quantity": 50, "gender": "women"},
            {"id": "abfw33uwe4gh4f", "name": "Green Empire Dress", "price": 45.00, "image": "https://f004.backblazeb2.com/file/sola-shopping/full/sola-shopping-womens-empire-dress-green.png", "description": "A comfortable green empire dress for everyday wear.", "subcategory": "dresses", "color": "green", "size": "S", "quantity": 50, "gender": "women"},
            {"id": "abfw33u4gh4f", "name": "Light Blue Empire Dress", "price": 45.00, "image": "https://f004.backblazeb2.com/file/sola-shopping/full/sola-shopping-womens-empire-dress-light-blue.png", "description": "A comfortable light blue empire dress for everyday wear.", "subcategory": "dresses", "color": "light blue", "size": "S", "quantity": 50, "gender": "women"},
            {"id": "wefwwefewgewg", "name": "Pink Empire Dress", "price": 45.00, "image": "https://f004.backblazeb2.com/file/sola-shopping/full/sola-shopping-womens-empire-dress-pink.png", "description": "A comfortable pink empire dress for everyday wear.", "subcategory": "dresses", "color": "pink", "size": "S", "quantity": 50, "gender": "women"},
            {"id": "wefwe838hfewgewg", "name": "Blue Jeans", "price": 55.00, "image": "https://f004.backblazeb2.com/file/sola-shopping/full/sola-shopping-womens-jeans-blue.png", "description": "A comfortable pair of blue jeans for everyday wear.", "subcategory": "jeans", "color": "blue", "size": "M", "quantity": 50, "gender": "women"},
            {"id": "wefwe83wgew", "name": "Baggy Sweat Pants with String", "price": 50.00, "image": "https://f004.backblazeb2.com/file/sola-shopping/full/sola-shopping-womens-sweats-black-string.png", "description": "A comfortable pair of baggy sweat pants with string for everyday wear.", "subcategory": "pants", "color": "black", "size": "S", "quantity": 50, "gender": "women"},
            {"id": "fwe83wgewavv", "name": "Baggy Sweat Pants", "price": 50.00, "image": "https://f004.backblazeb2.com/file/sola-shopping/full/sola-shopping-womens-sweats-black.png", "description": "A comfortable pair of baggy sweat pants for everyday wear.", "subcategory": "pants", "color": "black", "size": "S", "quantity": 50, "gender": "women"},
            {"id": "3wgewavv383hg", "name": "Brown Top", "price": 50.00, "image": "https://f004.backblazeb2.com/file/sola-shopping/full/sola-shopping-womens-top-brown.png", "description": "A comfortable brown top for everyday wear.", "subcategory": "tops", "color": "brown", "size": "S", "quantity": 50, "gender": "women"},
            {"id": "wavv383hgggwe3", "name": "Floral Top", "price": 50.00, "image": "https://f004.backblazeb2.com/file/sola-shopping/full/sola-shopping-womens-top-floral.png", "description": "A comfortable top for everyday wear.", "subcategory": "tops", "color": "floral", "size": "S", "quantity": 50, "gender": "women"},
            {"id": "83hgggwe383hqvf", "name": "Green Top", "price": 50.00, "image": "https://f004.backblazeb2.com/file/sola-shopping/full/sola-shopping-womens-top-green.png", "description": "A comfortable green top for everyday wear.", "subcategory": "tops", "color": "green", "size": "S", "quantity": 50, "gender": "women"}
        ],
        "shoes": [
            {"id": "abfw3eje3u4gh4f", "name": "Sneaker", "price": 50.00, "image": "https://f004.backblazeb2.com/file/sola-shopping/full/sola-shopping-mens-white-sneaker.png", "description": "A comfortable sneaker for everyday wear.", "subcategory": "sneakers", "color": "black", "size": "M", "quantity": 100, "gender": "men"},
            {"id": "abfw3eje3u4gh4f2", "name": "White Sneaker", "price": 50.00, "image": "https://f004.backblazeb2.com/file/sola-shopping/full/sola-shopping-womens-white-sneaker.png", "description": "A comfortable white sneaker for everyday wear.", "subcategory": "sneakers", "color": "white", "size": "M", "quantity": 100, "gender": "women"}
        ],
        "electronics": [
            {"id": "wueuhg33jj", "name": "Laptop", "price": 1000.00, "image": "https://f004.backblazeb2.com/file/sola-shopping/full/sola-shopping-laptop.png", "description": "A powerful laptop for everyday use.", "subcategory": "laptops", "color": "black", "size": "15-inch", "quantity": 100}
        ]
    };
    
    // Combine all products with their categories
    state.products = [
        ...productData.clothes.map(p => ({ ...p, category: 'clothes' })),
        ...productData.shoes.map(p => ({ ...p, category: 'shoes' })),
        ...productData.electronics.map(p => ({ ...p, category: 'electronics' }))
    ];
    
    console.log(`Loaded ${state.products.length} products from fallback catalog`);
    renderProducts();
}

// Helper: Get product badges for visual appeal
function getProductBadges(product, index) {
    const badges = [];

    // Best Seller badge - based on high ratings and review counts
    const bestsellerIds = [
        'wefwe83wgew',      // Weekend Joggers (4.9 rating, 412 reviews)
        'fwe83wgewavv',     // Weekend Joggers variant
        'abfw3eje3u4gh4f',  // Classic Court Sneaker (4.8 rating, 523 reviews)
        'abfw3eje3u4gh4f2', // Classic Court Sneaker women's
    ];
    if (bestsellerIds.includes(product.id)) {
        badges.push('<span class="badge badge-bestseller">Best Seller</span>');
    }

    // New badge - genuinely new items
    const newArrivalIds = [
        'abfw33u4gwfwh4f',  // Garden Party Midi Dress
        'wefwe838hfewgewg', // High-Rise Everyday Jeans
    ];
    if (newArrivalIds.includes(product.id)) {
        badges.push('<span class="badge badge-new">New</span>');
    }

    // Limited Stock badge (if quantity < 20)
    if (product.quantity && product.quantity < 20) {
        badges.push('<span class="badge badge-limited">Limited Stock</span>');
    }

    return badges.join('');
}

// Helper: Calculate sale pricing for realism
function getProductSaleInfo(product, index) {
    // Map specific products to intentional sales based on product ID
    const salesMap = {
        // Men's tees - limited time sale on gray/light gray
        '33iheffh3ik': { discount: 15 },    // Gray tee
        '33ihfffwh3ik': { discount: 15 },   // Light gray tee

        // Women's dresses - clearance on select colors
        'abfw33uwe4gh4f': { discount: 20 }, // Green empire dress
        'wefwwefewgewg': { discount: 20 },  // Pink empire dress

        // Women's tops - seasonal sale
        'wavv383hgggwe3': { discount: 25 }, // Floral linen top
        '83hgggwe383hqvf': { discount: 25 }, // Green linen top

        // Laptop - premium item, no sale (intentionally kept full price)
        // Sneakers - premium quality, no discount
        // Joggers - bestsellers, kept at full price
        // Jeans - new arrival, full price
    };

    const saleInfo = salesMap[product.id];

    if (saleInfo) {
        const originalPrice = product.price / (1 - saleInfo.discount / 100);
        return {
            onSale: true,
            originalPrice: originalPrice,
            discount: saleInfo.discount
        };
    }

    return { onSale: false };
}

// Helper: Get stock status messaging
function getStockStatus(product) {
    if (product.quantity && product.quantity <= 5) {
        return {
            showWarning: true,
            message: `Only ${product.quantity} left in stock`
        };
    }
    return { showWarning: false };
}

// Render products to grid
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    const filteredProducts = filterProducts();

    // Update product count
    updateProductCount();

    if (filteredProducts.length === 0) {
        grid.innerHTML = '<div class="no-products">No products found.</div>';
        return;
    }
    
    grid.innerHTML = filteredProducts.map((product, index) => {
        // Calculate badges and sale info
        const badges = getProductBadges(product, index);
        const saleInfo = getProductSaleInfo(product, index);
        const stockInfo = getStockStatus(product);

        return `
        <div class="product-card" data-id="${product.id}">
            ${badges ? `<div class="product-badges">${badges}</div>` : ''}
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                ${product.rating ? `
                <div class="product-rating">
                    ${generateStars(product.rating)}
                    <span class="rating-count">(${product.reviewCount || 0})</span>
                </div>
                ` : ''}
                <div class="product-pricing">
                    ${saleInfo.onSale ? `<span class="product-price-original">$${saleInfo.originalPrice.toFixed(2)}</span>` : ''}
                    <span class="product-price ${saleInfo.onSale ? 'product-price-sale' : ''}">$${product.price.toFixed(2)}</span>
                    ${saleInfo.onSale ? `<span class="product-discount">${saleInfo.discount}% off</span>` : ''}
                </div>
                ${stockInfo.showWarning ? `<div class="stock-warning">${stockInfo.message}</div>` : ''}
                <div class="product-actions">
                    <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
                    <button class="view-in-app" data-id="${product.id}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                        </svg>
                        App
                    </button>
                </div>
            </div>
        </div>
    `}).join('');
    
    // Add event listeners to product cards
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('add-to-cart') && !e.target.classList.contains('view-in-app')) {
                showProductModal(card.dataset.id);
            }
        });
    });
    
    // Add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            addToCart(btn.dataset.id);
        });
    });
    
    // View in app buttons
    document.querySelectorAll('.view-in-app').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            viewProductInApp(btn.dataset.id);
        });
    });
}

// Filter products based on current filters
function filterProducts() {
    let filtered = state.products.filter(product => {
        // Category filter
        const categoryMatch = state.currentCategory === 'all' || product.category === state.currentCategory;

        // Gender filter
        const genderMatch = state.currentGender === 'all' || !product.gender || product.gender === state.currentGender;

        // Search filter
        const searchMatch = !state.searchQuery ||
            product.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
            product.description.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
            (product.color && product.color.toLowerCase().includes(state.searchQuery.toLowerCase())) ||
            (product.category && product.category.toLowerCase().includes(state.searchQuery.toLowerCase()));

        return categoryMatch && genderMatch && searchMatch;
    });

    // Sort products
    switch(state.sortBy) {
        case 'price-low':
            filtered.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filtered.sort((a, b) => b.price - a.price);
            break;
        case 'newest':
            // Reverse order for "newest" (assuming products are loaded oldest first)
            filtered.reverse();
            break;
        case 'featured':
        default:
            // Keep original order
            break;
    }

    return filtered;
}

// Update product count display
function updateProductCount() {
    const count = filterProducts().length;
    const countElement = document.getElementById('productsCount');
    if (countElement) {
        countElement.textContent = `${count} item${count !== 1 ? 's' : ''}`;
    }
}

// Show/hide gender filter based on category
function updateGenderFilterVisibility() {
    const genderFilterGroup = document.getElementById('genderFilterGroup');
    if (state.currentCategory === 'electronics' || state.currentCategory === 'all') {
        genderFilterGroup.style.display = 'none';
        state.currentGender = 'all';
    } else {
        genderFilterGroup.style.display = 'flex';
    }
}

// Product Modal
function showProductModal(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    // Store last viewed product for lead profile
    try {
        localStorage.setItem('sola_last_viewed_product', JSON.stringify({
            product_id: product.id,
            product_name: product.name,
            price: product.price,
            category: product.category,
            viewed_at: new Date().toISOString()
        }));
    } catch (err) {
        // Ignore storage errors
    }

    // Track product view and set Branch Journey data BEFORE URL update
    if (window.solaBranch && window.solaBranch.trackViewProduct) {
        console.log('[Branch] Setting Journey data BEFORE render');
        window.solaBranch.trackViewProduct(product);

        // Force Journey re-render after setBranchViewData
        if (typeof branch !== 'undefined' && typeof branch.closeJourney === 'function') {
            console.log('[Branch] Forcing Journey re-render');

            branch.closeJourney(function() {
                console.log('[Branch] Journey closed, re-triggering');

                setTimeout(() => {
                    branch.track('pageview');
                }, 100);
            });
        }
    }

    // Update URL state for Branch Journeys targeting
    URLStateManager.updateURL('product', { product_id: productId });

    // Get enhanced product info
    const stockStatus = getStockStatus(product);
    const deliveryMessage = getDeliveryMessage(product.price);

    // Generate size options if applicable
    const sizeOptions = product.category === 'clothes' || product.category === 'shoes'
        ? generateSizeOptions(product.size)
        : '';

    // Generate color options if applicable
    const colorOptions = product.color ? generateColorOptions(product.color) : '';

    const modal = document.getElementById('productModal');
    const modalBody = document.getElementById('modalBody');

    modalBody.innerHTML = `
        <div class="modal-product">
            <div class="modal-image-container">
                <img src="${product.image}" alt="${product.name}" class="modal-image">
                ${stockStatus.showWarning ? `<div class="modal-stock-badge">${stockStatus.message}</div>` : ''}
            </div>
            <div class="modal-info">
                <div class="modal-header">
                    <h2>${product.name}</h2>
                    ${product.rating ? `
                    <div class="modal-rating">
                        ${generateStars(product.rating)}
                        <span class="rating-count">${product.reviewCount} reviews</span>
                    </div>
                    ` : ''}
                    <div class="modal-price">$${product.price.toFixed(2)}</div>
                </div>
                <p class="modal-description">${product.description}</p>

                ${product.whyLoveIt && product.whyLoveIt.length ? `
                <div class="why-love-it">
                    <h3 class="why-love-title">Why customers love this</h3>
                    <ul class="why-love-list">
                        ${product.whyLoveIt.map(reason => `<li>${reason}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}

                ${sizeOptions ? `
                <div class="variant-selector">
                    <label class="variant-label">Size</label>
                    <div class="size-options">
                        ${sizeOptions}
                    </div>
                </div>` : ''}

                ${colorOptions ? `
                <div class="variant-selector">
                    <label class="variant-label">Color</label>
                    <div class="color-options">
                        ${colorOptions}
                    </div>
                </div>` : ''}

                <div class="modal-details">
                    <div class="detail-row">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <span>${deliveryMessage}</span>
                    </div>
                    <div class="detail-row">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                        <span>Free 30-day returns</span>
                    </div>
                    ${stockStatus.showWarning ? `
                    <div class="detail-row detail-urgent">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <span>${stockStatus.message} - Order soon!</span>
                    </div>` : ''}
                </div>

                ${product.reviews && product.reviews.length ? `
                <div class="customer-reviews">
                    <h3 class="reviews-title">What customers are saying</h3>
                    ${product.reviews.slice(0, 2).map(review => `
                        <div class="review">
                            <div class="review-header">
                                <div class="review-stars">${generateStars(review.rating)}</div>
                                <span class="review-author">${review.author}</span>
                            </div>
                            <p class="review-text">"${review.text}"</p>
                        </div>
                    `).join('')}
                </div>
                ` : ''}

                <div class="modal-actions">
                    <button class="btn btn-primary btn-block" onclick="addToCart('${product.id}'); closeModal();">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 2L6 9H18L15 2"></path>
                            <path d="M6 9H18L17 21H7L6 9Z"></path>
                        </svg>
                        Add to Cart
                    </button>
                    <button class="btn btn-app-secondary" onclick="viewProductInApp('${product.id}')">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                        </svg>
                        View in app for faster checkout
                    </button>
                </div>
            </div>
        </div>
    `;

    modal.classList.add('active');
}

// Helper: Generate size selection options
function generateSizeOptions(currentSize) {
    const sizes = ['XS', 'S', 'M', 'L', 'XL'];
    return sizes.map(size =>
        `<button class="size-btn ${size === currentSize ? 'selected' : ''}" data-size="${size}">${size}</button>`
    ).join('');
}

// Helper: Generate color selection options
function generateColorOptions(currentColor) {
    // Simplified color palette
    const colors = {
        'black': '#000000',
        'white': '#FFFFFF',
        'gray': '#808080',
        'light gray': '#D3D3D3',
        'blue': '#4A90E2',
        'light blue': '#87CEEB',
        'green': '#2ECC71',
        'pink': '#FF6B9D',
        'floral': '#FF6B9D',
        'brown': '#8B4513'
    };

    return Object.entries(colors).slice(0, 5).map(([name, hex]) =>
        `<button class="color-btn ${name === currentColor ? 'selected' : ''}" data-color="${name}" style="background-color: ${hex};" title="${name}"></button>`
    ).join('');
}

// Helper: Get delivery messaging
function getDeliveryMessage(price) {
    if (price >= 50) {
        return 'Free delivery on this item';
    }
    return `Free delivery on orders over $50`;
}

// Helper: Generate star rating HTML
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let stars = '';
    // Full stars
    for (let i = 0; i < fullStars; i++) {
        stars += '<svg class="star star-full" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
    }
    // Half star
    if (hasHalfStar) {
        stars += '<svg class="star star-half" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><defs><linearGradient id="halfGrad"><stop offset="50%" stop-color="currentColor"/><stop offset="50%" stop-color="transparent"/></linearGradient></defs><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="url(#halfGrad)"/></svg>';
    }
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        stars += '<svg class="star star-empty" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
    }

    return `<div class="stars">${stars}</div><span class="rating-value">${rating.toFixed(1)}</span>`;
}

function closeModal() {
    document.getElementById('productModal').classList.remove('active');

    // Restore URL to home when closing modal
    URLStateManager.updateURL('home');
}

// Wishlist Management
function loadWishlist() {
    const savedWishlist = localStorage.getItem('solaShoppingWishlist');
    if (savedWishlist) {
        state.wishlist = JSON.parse(savedWishlist);
        updateWishlistUI();
    }
}

function saveWishlist() {
    localStorage.setItem('solaShoppingWishlist', JSON.stringify(state.wishlist));
    updateWishlistUI();
}

function toggleWishlist(productId) {
    const index = state.wishlist.indexOf(productId);

    if (index > -1) {
        // Remove from wishlist
        state.wishlist.splice(index, 1);
        showNotification('Removed from wishlist');
    } else {
        // Add to wishlist
        state.wishlist.push(productId);
        const product = state.products.find(p => p.id === productId);
        if (product) {
            showNotification(`${product.name} added to wishlist!`);
        }
    }

    saveWishlist();
}

function updateWishlistUI() {
    const wishlistCount = document.getElementById('wishlistCount');
    if (wishlistCount) {
        wishlistCount.textContent = state.wishlist.length;
    }
}

// Cart Management
function loadCart() {
    const savedCart = localStorage.getItem('solaShoppingCart');
    if (savedCart) {
        state.cart = JSON.parse(savedCart);
        updateCartUI();
    }
}

function saveCart() {
    localStorage.setItem('solaShoppingCart', JSON.stringify(state.cart));
    updateCartUI();
}

function addToCart(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = state.cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        state.cart.push({
            ...product,
            quantity: 1
        });
    }

    saveCart();
    showNotification(`${product.name} added to cart!`);

    // Track add to cart
    if (window.solaBranch && window.solaBranch.trackAddToCart) {
        const cartTotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const cartItemCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
        window.solaBranch.trackAddToCart(product, {
            total: cartTotal,
            itemCount: cartItemCount,
            items: state.cart
        });
    }
}

function removeFromCart(productId) {
    state.cart = state.cart.filter(item => item.id !== productId);
    saveCart();
}

function updateQuantity(productId, change) {
    const item = state.cart.find(item => item.id === productId);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        saveCart();
    }
}

function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartSubtotal = document.getElementById('cartSubtotal');
    const cartShipping = document.getElementById('cartShipping');
    const cartTotal = document.getElementById('cartTotal');
    const shippingMessage = document.getElementById('shippingMessage');

    // Update cart count
    const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    // Update cart items
    if (state.cart.length === 0) {
        cartItems.innerHTML = '<div class="cart-empty">Your cart is empty</div>';
    } else {
        cartItems.innerHTML = state.cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
                    </div>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">×</button>
            </div>
        `).join('');
    }

    // Calculate subtotal
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;

    // Update shipping (free if over $50, or $0 if cart is empty)
    const shippingFree = subtotal >= 50;
    const shippingCost = (subtotal === 0) ? 0 : (shippingFree ? 0 : 5.99);
    cartShipping.textContent = (subtotal === 0 || shippingFree) ? 'FREE' : '$5.99';

    // Update shipping progress message
    if (shippingMessage) {
        if (subtotal === 0) {
            shippingMessage.innerHTML = '';
        } else if (shippingFree) {
            shippingMessage.innerHTML = `
                <div class="shipping-success">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>You qualify for FREE shipping!</span>
                </div>
            `;
        } else {
            const remaining = (50 - subtotal).toFixed(2);
            shippingMessage.innerHTML = `
                <div class="shipping-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.min((subtotal / 50) * 100, 100)}%"></div>
                    </div>
                    <span>Add $${remaining} more for FREE shipping</span>
                </div>
            `;
        }
    }

    // Update total
    const total = subtotal + shippingCost;
    cartTotal.textContent = `$${total.toFixed(2)}`;
}

function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');

    const wasActive = sidebar.classList.contains('active');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');

    // Update URL state for Branch Journeys targeting
    if (!wasActive && sidebar.classList.contains('active')) {
        // Opening cart
        URLStateManager.updateURL('cart');
    } else if (wasActive && !sidebar.classList.contains('active')) {
        // Closing cart - restore to home
        URLStateManager.updateURL('home');
    }

    // Prevent body scroll when cart is open (especially on mobile)
    if (sidebar.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }

    // Track view cart when opening
    if (!wasActive && sidebar.classList.contains('active')) {
        if (window.solaBranch && window.solaBranch.trackViewCart) {
            const cartTotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const cartItemCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
            window.solaBranch.trackViewCart({
                total: cartTotal,
                itemCount: cartItemCount,
                items: state.cart
            });
        }
    }
}

// Checkout Confirmation
function showCheckoutConfirmation() {
    console.log('[Checkout] Purchase completed');

    const total = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = total >= 50 ? 0 : 5.99;
    const finalTotal = total + shipping;
    const orderNumber = 'SO-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    const itemCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);

    // Update URL state for Branch Journeys targeting
    URLStateManager.updateURL('confirmation', { order_id: orderNumber });

    // Track purchase with full cart product details
    if (window.solaBranch && window.solaBranch.trackPurchase) {
        window.solaBranch.trackPurchase({
            orderId: orderNumber,
            total: finalTotal,
            subtotal: total,
            shipping: shipping,
            itemCount: itemCount,
            products: state.cart.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity
            }))
        });
    }

    // Clear cart AFTER purchase is tracked
    clearCart();

    // Close cart (but don't update URL since we're already on confirmation)
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    if (sidebar && overlay) {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Show confirmation modal
    const modal = document.getElementById('productModal');
    const modalBody = document.getElementById('modalBody');

    // Get user email safely
    const userEmail = (state.user && state.user.email) ? state.user.email : 'your email';

    modalBody.innerHTML = `
        <div class="checkout-confirmation">
            <div class="confirmation-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
            </div>
            <h2>Order Confirmed!</h2>
            <p class="confirmation-message">Thanks for shopping with us. We're preparing your order now.</p>
            <div class="order-details">
                <div class="order-number">
                    <span class="label">Order Number:</span>
                    <span class="value">${orderNumber}</span>
                </div>
                <div class="order-total">
                    <span class="label">Total Paid:</span>
                    <span class="value">$${finalTotal.toFixed(2)}</span>
                </div>
            </div>
            <div class="confirmation-info">
                <div class="info-row">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    <span>Confirmation email sent to ${userEmail}</span>
                </div>
                <div class="info-row">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="1" y="3" width="15" height="13"></rect>
                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                        <circle cx="5.5" cy="18.5" r="2.5"></circle>
                        <circle cx="18.5" cy="18.5" r="2.5"></circle>
                    </svg>
                    <span>Estimated delivery: 3-5 business days</span>
                </div>
            </div>
            <div class="confirmation-actions">
                <button class="btn btn-primary btn-block" onclick="closeModal();">
                    Continue Shopping
                </button>
                <button class="btn btn-app-secondary" onclick="viewOrderInApp('${orderNumber}')">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                    </svg>
                    Track order in app
                </button>
            </div>
        </div>
    `;

    console.log('[Checkout] Confirmation shown');
    modal.classList.add('active');
}

// Clear cart after checkout
function clearCart() {
    state.cart = [];
    saveCart();
}

// View order in app
function viewOrderInApp(orderNumber) {
    if (window.createBranchLink) {
        window.createBranchLink({
            feature: 'order_tracking',
            channel: 'web',
            campaign: 'sola_demo',
            data: {
                vertical: 'shopping',
                order_number: orderNumber,
                user_id: state.user.id,
                user_name: state.user.name
            }
        });
    }
}

// Notifications
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--success);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 4px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        z-index: 2000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// View product in app (uses Branch SDK)
function viewProductInApp(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;
    
    // This will be handled by branch-integration.js
    if (window.createBranchLink) {
        window.createBranchLink({
            feature: 'product_view',
            channel: 'web',
            campaign: 'sola_demo',
            data: {
                vertical: 'shopping',
                product_id: product.id,
                product_name: product.name,
                product_price: product.price,
                user_id: state.user.id,
                user_name: state.user.name,
                cart: state.cart
            }
        });
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Initialize account system
    if (typeof initAccountSystem === 'function') {
        initAccountSystem();
    }

    // Load initial data
    loadProducts();
    loadCart();
    loadWishlist();
    
    // Category filter
    document.querySelectorAll('#categoryFilter .filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#categoryFilter .filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.currentCategory = btn.dataset.filter;
            updateGenderFilterVisibility();
            renderProducts();
        });
    });
    
    // Gender filter
    document.querySelectorAll('#genderFilter .filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#genderFilter .filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.currentGender = btn.dataset.gender;
            renderProducts();
        });
    });

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            state.searchQuery = e.target.value;
            renderProducts();
        });
        console.log('[SafeBind] Listener attached: searchInput');
    } else {
        console.warn('[SafeBind] Element not found: searchInput');
    }

    // Sort functionality
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            state.sortBy = e.target.value;
            renderProducts();
        });
        console.log('[SafeBind] Listener attached: sortSelect');
    } else {
        console.warn('[SafeBind] Element not found: sortSelect');
    }

    // Wishlist button
    const wishlistBtn = document.getElementById('wishlistBtn');
    if (wishlistBtn) {
        wishlistBtn.addEventListener('click', () => {
            console.log('Wishlist clicked, handleWishlistClick available:', typeof handleWishlistClick);
            handleWishlistClick();
        });
        console.log('[SafeBind] Listener attached: wishlistBtn');
    } else {
        console.warn('[SafeBind] Element not found: wishlistBtn');
    }

    // User dropdown toggle
    const userDropdownBtn = document.getElementById('userDropdownBtn');
    const userDropdown = document.getElementById('userDropdown');
    if (userDropdownBtn && userDropdown) {
        userDropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!userDropdownBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('active');
            }
        });
        console.log('[SafeBind] Listener attached: userDropdownBtn');
    } else {
        console.warn('[SafeBind] Element not found: userDropdownBtn or userDropdown');
    }

    // Category cards click handling
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            const category = card.dataset.category;
            const gender = card.dataset.gender;

            if (category) {
                state.currentCategory = category;

                // Update nav links
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.toggle('active', link.dataset.category === category);
                });

                // Update filter buttons
                document.querySelectorAll('#categoryFilter .filter-btn').forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.filter === category);
                });

                // Set gender if specified
                if (gender) {
                    state.currentGender = gender;
                    document.querySelectorAll('#genderFilter .filter-btn').forEach(btn => {
                        btn.classList.toggle('active', btn.dataset.gender === gender);
                    });
                } else {
                    state.currentGender = 'all';
                    document.querySelectorAll('#genderFilter .filter-btn').forEach(btn => {
                        btn.classList.toggle('active', btn.dataset.gender === 'all');
                    });
                }

                updateGenderFilterVisibility();
                renderProducts();

                // Scroll to products section
                document.querySelector('.products').scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            const category = link.dataset.category;
            state.currentCategory = category;
            
            // Update filter buttons to match
            document.querySelectorAll('#categoryFilter .filter-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.filter === category);
            });
            
            updateGenderFilterVisibility();
            renderProducts();
        });
    });
    
    // Cart toggle
    const cartBtn = document.getElementById('cartBtn');
    const cartClose = document.getElementById('cartClose');
    const cartOverlay = document.getElementById('cartOverlay');

    if (cartBtn) {
        cartBtn.addEventListener('click', toggleCart);
        console.log('[SafeBind] Listener attached: cartBtn');
    } else {
        console.warn('[SafeBind] Element not found: cartBtn');
    }

    if (cartClose) {
        cartClose.addEventListener('click', toggleCart);
        console.log('[SafeBind] Listener attached: cartClose');
    } else {
        console.warn('[SafeBind] Element not found: cartClose');
    }

    if (cartOverlay) {
        cartOverlay.addEventListener('click', toggleCart);
        console.log('[SafeBind] Listener attached: cartOverlay');
    } else {
        console.warn('[SafeBind] Element not found: cartOverlay');
    }

    // Modal close
    const modalClose = document.getElementById('modalClose');
    const productModal = document.getElementById('productModal');

    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
        console.log('[SafeBind] Listener attached: modalClose');
    } else {
        console.warn('[SafeBind] Element not found: modalClose');
    }

    if (productModal) {
        productModal.addEventListener('click', (e) => {
            if (e.target.id === 'productModal') {
                closeModal();
            }
        });
        console.log('[SafeBind] Listener attached: productModal');
    } else {
        console.warn('[SafeBind] Element not found: productModal');
    }

    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            const navMenu = document.getElementById('navMenu');

            if (navMenu) {
                mobileMenuBtn.classList.toggle('active');
                navMenu.classList.toggle('active');
            }
        });
        console.log('[SafeBind] Listener attached: mobileMenuBtn');
    } else {
        console.warn('[SafeBind] Element not found: mobileMenuBtn');
    }

    // Close mobile menu when clicking on nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            const mobileBtn = document.getElementById('mobileMenuBtn');
            const navMenu = document.getElementById('navMenu');

            if (mobileBtn && navMenu) {
                mobileBtn.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        const mobileBtn = document.getElementById('mobileMenuBtn');
        const navMenu = document.getElementById('navMenu');
        const header = document.querySelector('.header');

        if (header && mobileBtn && navMenu && !header.contains(e.target) && navMenu.classList.contains('active')) {
            mobileBtn.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
    
    // Shop Now button
    const shopNowBtn = document.getElementById('shopNowBtn');
    if (shopNowBtn) {
        shopNowBtn.addEventListener('click', () => {
            const productsSection = document.querySelector('.products');
            if (productsSection) {
                productsSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
        console.log('[SafeBind] Listener attached: shopNowBtn');
    } else {
        console.warn('[SafeBind] Element not found: shopNowBtn');
    }

    // View in App button (hero)
    const viewInAppBtn = document.getElementById('viewInAppBtn');
    if (viewInAppBtn) {
        viewInAppBtn.addEventListener('click', () => {
            if (window.createBranchLink) {
                window.createBranchLink({
                    feature: 'app_open',
                    channel: 'web',
                    campaign: 'sola_demo',
                    data: {
                        vertical: 'shopping',
                        page: 'home',
                        user_id: state.user.id,
                        user_name: state.user.name,
                        cart: state.cart
                    }
                });
            }
        });
        console.log('[SafeBind] Listener attached: viewInAppBtn');
    } else {
        console.warn('[SafeBind] Element not found: viewInAppBtn');
    }

    // Checkout button - web checkout flow
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            console.log('[Checkout] Proceed clicked');

            if (state.cart.length === 0) {
                showNotification('Your cart is empty');
                return;
            }

            // Update URL state for Branch Journeys targeting
            URLStateManager.updateURL('checkout');

            console.log('[Checkout] Initiate purchase started');

            // Track start checkout
            if (window.solaBranch && window.solaBranch.trackStartCheckout) {
                const cartTotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                const cartItemCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
                window.solaBranch.trackStartCheckout({
                    total: cartTotal,
                    itemCount: cartItemCount,
                    items: state.cart
                });
            }

            // Use account-aware checkout if available
            if (typeof handleCheckoutWithAuth === 'function') {
                handleCheckoutWithAuth();
            } else {
                // Fallback to direct checkout
                showCheckoutConfirmation();
            }
        });
        console.log('[SafeBind] Listener attached: checkoutBtn');
    } else {
        console.warn('[SafeBind] Element not found: checkoutBtn');
    }

    // App CTAs removed - Branch Journeys will control app promotion
    // Preserved for reference: createBranchLink helper function available in branch-integration.js

    /*
    // Optional: Checkout in App button (removed to allow Branch Journeys control)
    const checkoutInAppBtn = document.getElementById('checkoutInAppBtn');
    if (checkoutInAppBtn) {
        checkoutInAppBtn.addEventListener('click', () => {
            if (window.createBranchLink) {
                window.createBranchLink({
                    feature: 'checkout',
                    channel: 'web',
                    campaign: 'sola_demo',
                    data: {
                        vertical: 'shopping',
                        cart: state.cart,
                        total: state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
                        user_id: state.user.id,
                        user_name: state.user.name
                    }
                });
            }
        });
    }

    // Download App button (removed to allow Branch Journeys control)
    const downloadAppBtn = document.getElementById('downloadAppBtn');
    if (downloadAppBtn) {
        downloadAppBtn.addEventListener('click', () => {
            if (window.createBranchLink) {
                window.createBranchLink({
                    feature: 'app_download',
                    channel: 'web',
                    campaign: 'sola_demo',
                    data: {
                        vertical: 'shopping',
                        user_id: state.user.id,
                        user_name: state.user.name
                    }
                });
            }
        });
    }
    */

    // Newsletter signup
    const newsletterBtn = document.getElementById('newsletterBtn');
    const newsletterEmail = document.getElementById('newsletterEmail');
    if (newsletterBtn && newsletterEmail) {
        newsletterBtn.addEventListener('click', () => {
            const email = newsletterEmail.value.trim();
            if (typeof handleNewsletterSignup === 'function') {
                handleNewsletterSignup(email);
                newsletterEmail.value = '';
            }
        });

        newsletterEmail.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                newsletterBtn.click();
            }
        });
        console.log('[SafeBind] Listener attached: newsletterBtn');
    } else {
        console.warn('[SafeBind] Element not found: newsletterBtn or newsletterEmail');
    }

    // Initially hide gender filter if needed
    updateGenderFilterVisibility();
});

// Browser back/forward button handler
window.addEventListener('popstate', (event) => {
    const view = URLStateManager.getCurrentView();

    console.log('[URL] Browser navigation to:', view);

    // Close any open modals/sidebars
    const productModal = document.getElementById('productModal');
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');

    if (productModal) {
        productModal.classList.remove('active');
    }

    if (cartSidebar && cartOverlay) {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Handle specific views if needed
    if (view === 'product') {
        const productId = URLStateManager.getParam('product_id');
        if (productId) {
            // Optionally re-open product modal
            // For now, just close and stay on home
            console.log('[URL] Product view in history:', productId);
        }
    } else if (view === 'cart') {
        // Optionally re-open cart
        console.log('[URL] Cart view in history');
    }

    // Default: stay on home/catalog view with all modals closed
});

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .no-products {
        grid-column: 1 / -1;
        text-align: center;
        padding: 3rem;
        color: var(--gray-dark);
        font-size: 1.125rem;
    }
`;
document.head.appendChild(style);
