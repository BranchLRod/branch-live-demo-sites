// Branch SDK Integration for Sola Shopping
// This file handles all Branch deep linking functionality for the demo

// Branch configuration
const BRANCH_KEY = 'key_live_avBePHQiKVvGHzz8PsZQXgjctxmaKLfv';
const BRANCH_DOMAIN = 'solashop.app.link';
// Demo app URLs - pointing to the actual demo app
const APP_STORE_URL = 'https://sola-shopping.com/';
const PLAY_STORE_URL = 'https://sola-shopping.com/';

// Initialize Branch
(function initBranch() {
    // Check if Branch SDK is loaded
    if (typeof branch !== 'undefined') {
        // Initialize Branch with custom domain
        branch.init(BRANCH_KEY, {
            branch_domain: BRANCH_DOMAIN
        }, function(err, data) {
            if (err) {
                console.error('Branch initialization error:', err);
                return;
            }
            
            console.log('Branch initialized successfully with domain:', BRANCH_DOMAIN);
            console.log('Branch session data:', data);
            
            // Handle incoming deep link data
            if (data && data.data_parsed) {
                handleIncomingDeepLink(data.data_parsed);
            }
        });
        
        // Track page view
        branch.track('pageview', {
            page: 'shopping_home',
            vertical: 'shopping'
        });
    } else {
        console.warn('Branch SDK not loaded. Deep linking features will be limited.');
        // Provide fallback functionality
        provideFallbackLinks();
    }
})();

// Handle incoming deep link data
function handleIncomingDeepLink(data) {
    console.log('Handling incoming deep link:', data);
    
    // Check if this is a return from app
    if (data.product_id) {
        // User came back from viewing a product in app
        highlightProduct(data.product_id);
    }
    
    if (data.cart_updated) {
        // Cart was updated in app, sync it
        syncCartFromApp(data.cart);
    }
    
    if (data.user_authenticated) {
        // User authenticated in app
        updateUserSession(data.user);
    }
}

// Create Branch deep link
window.createBranchLink = function(options) {
    const {
        feature = 'web_to_app',
        channel = 'web',
        campaign = 'sola_demo',
        data = {}
    } = options;
    
    // Add timestamp and session info
    const linkData = {
        ...data,
        timestamp: new Date().toISOString(),
        web_url: window.location.href
    };
    
    if (typeof branch !== 'undefined') {
        // Set link data
        const linkOptions = {
            channel: channel,
            feature: feature,
            campaign: campaign,
            data: linkData,
            tags: ['demo', 'shopping', feature]
        };
        
        // Add desktop fallback URL
        linkOptions.data['$desktop_url'] = window.location.href;
        linkOptions.data['$ios_url'] = APP_STORE_URL;
        linkOptions.data['$android_url'] = PLAY_STORE_URL;
        
        // Generate and open the link
        branch.link(linkOptions, function(err, link) {
            if (err) {
                console.error('Error creating Branch link:', err);
                openFallbackLink(data);
                return;
            }
            
            console.log('Branch link created:', link);

            // Track the event
            branch.logEvent('SHARE', {
                feature: feature,
                vertical: 'shopping',
                source_surface: 'web'
            });
            
            // Open the link
            openBranchLink(link, data);
        });
    } else {
        // Fallback if Branch is not available
        openFallbackLink(data);
    }
};

// Open Branch link with appropriate behavior
function openBranchLink(link, data) {
    // Check if mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
        // Try to open app directly
        window.location.href = link;
    } else {
        // Desktop: Show modal with QR code and options
        showDeepLinkModal(link, data);
    }
}

// Generate QR code using Branch SDK
function generateQRCode(link, data) {
    console.log('generateQRCode called with:', { link, data });
    console.log('Branch SDK available:', typeof branch !== 'undefined');
    console.log('Branch object:', branch);
    
    // Test if branch.qrCode method exists
    if (typeof branch !== 'undefined' && branch.qrCode) {
        console.log('branch.qrCode method exists');
    } else {
        console.log('branch.qrCode method does not exist');
    }
    
    // Try Branch SDK first, fallback if it fails
    
    if (typeof branch !== 'undefined') {
        const qrCodeSettings = {
            "code_color": "#000000",
            "background_color": "#FFFFFF",
            "margin": 5,
            "width": 1000,
            "image_format": "png"
        };
        
        const qrCodeParams = {
            tags: ['demo', 'shopping', 'product_view'],
            channel: 'web',
            feature: 'create link',
            stage: 'created link',
            type: 1,
            data: {
                ...data,
                '$desktop_url': link || window.location.href,
                '$ios_url': APP_STORE_URL,
                '$android_url': PLAY_STORE_URL,
                '$og_title': 'Sola Shopping - ' + (data.product_name || 'Product'),
                '$og_description': 'Continue shopping in the Sola Shopping app',
                '$og_image_url': 'https://f004.backblazeb2.com/file/sola-shopping/full/sola-logo.svg'
            }
        };
        
        console.log('Calling branch.qrCode with params:', qrCodeParams);
        console.log('QR code settings:', qrCodeSettings);
        
        branch.qrCode(qrCodeParams, qrCodeSettings, function(err, qrCode) {
            console.log('QR Code callback received:', { err, qrCode });
            const qrContainer = document.getElementById('qrCodeContainer');
            
            if (err) {
                console.error('QR Code generation error:', err);
                console.log('Attempting fallback QR code generation');
                generateFallbackQRCode(link, qrContainer);
                return;
            }
            
            if (qrContainer && qrCode) {
                console.log('QR Code generated successfully, displaying image');
                qrContainer.innerHTML = `<img src="data:image/png;charset=utf-8;base64,${qrCode.base64()}" width="200" height="200" alt="QR Code">`;
            } else {
                console.error('QR Code generated but no container or invalid response');
                if (qrContainer) {
                    qrContainer.innerHTML = '<div class="qr-error">QR code generated but failed to display</div>';
                }
            }
        });
    } else {
        console.error('Branch SDK not available');
        // Fallback if Branch is not available
        const qrContainer = document.getElementById('qrCodeContainer');
        if (qrContainer) {
            console.log('Using fallback QR code generation');
            generateFallbackQRCode(link, qrContainer);
        }
    }
}

// Fallback QR code generator using a public API
function generateFallbackQRCode(link, container) {
    console.log('Generating fallback QR code for:', link);
    
    if (!link) {
        // Create a fallback Branch link if no link provided
        const fallbackLink = `https://${BRANCH_DOMAIN}/?feature=product_view&channel=web&campaign=sola_demo`;
        console.log('No link provided, using fallback Branch link:', fallbackLink);
        link = fallbackLink;
    }
    
    // Use a free QR code API as fallback
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(link)}`;
    
    if (container) {
        container.innerHTML = `
            <div class="qr-loading">Generating QR Code...<br><small>This may take a few seconds</small></div>
            <img src="${qrApiUrl}" 
                 width="200" 
                 height="200" 
                 alt="QR Code" 
                 style="display: none;"
                 onload="this.style.display='block'; this.previousElementSibling.style.display='none';"
                 onerror="this.previousElementSibling.innerHTML='<div class=&quot;qr-error&quot;>Failed to generate QR code</div>'; this.style.display='none';">
        `;
    }
}

// Show modal for desktop users
function showDeepLinkModal(link, data) {
    // Remove existing modal if any
    const existingModal = document.getElementById('branchModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal HTML
    const modalHTML = `
        <div id="branchModal" class="branch-modal">
            <div class="branch-modal-content">
                <button class="branch-modal-close" onclick="closeBranchModal()">&times;</button>
                <h2>Continue in the Sola Shopping App</h2>
                <p>Get the best experience with our mobile app</p>
                
                <div class="branch-modal-options">
                    <div class="branch-modal-qr">
                        <div id="qrCodeContainer" class="qr-container">
                            <div class="qr-loading">Generating QR Code...<br><small>This may take a few seconds</small></div>
                        </div>
                        <p>Scan with your phone</p>
                    </div>
                    
                    <div class="branch-modal-buttons">
                        <button class="btn btn-primary" onclick="sendLinkViaSMS('${link}')">
                            Send Link via SMS
                        </button>
                        <button class="btn btn-secondary" onclick="copyLinkToClipboard('${link}')">
                            Copy Link
                        </button>
                    </div>
                </div>
                
                <div class="branch-modal-footer">
                    <p>Branch deep link demo for Sola Shopping</p>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Generate QR code with timeout
    generateQRCode(link, data);
    
    // Add timeout fallback
    setTimeout(() => {
        const qrContainer = document.getElementById('qrCodeContainer');
        if (qrContainer && qrContainer.innerHTML.includes('Generating QR Code')) {
            console.log('QR code generation timed out, using fallback');
            generateFallbackQRCode(link, qrContainer);
        }
    }, 5000); // 5 second timeout
    
    // Add modal styles if not already present
    if (!document.getElementById('branchModalStyles')) {
        const styles = `
            <style id="branchModalStyles">
                .branch-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    animation: fadeIn 0.3s ease;
                }
                
                .branch-modal-content {
                    background: white;
                    border-radius: 8px;
                    padding: 2rem;
                    max-width: 600px;
                    width: 90%;
                    position: relative;
                    animation: slideUp 0.3s ease;
                }
                
                .branch-modal-close {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: none;
                    border: none;
                    font-size: 2rem;
                    cursor: pointer;
                    color: #4b5563;
                }
                
                .branch-modal-content h2 {
                    margin-bottom: 0.5rem;
                    color: #274060;
                }
                
                .branch-modal-content p {
                    color: #6b7280;
                    margin-bottom: 1.5rem;
                }
                
                .branch-modal-options {
                    display: flex;
                    gap: 2rem;
                    margin-bottom: 1.5rem;
                }
                
                .branch-modal-qr {
                    text-align: center;
                }
                
                .qr-container {
                    margin-bottom: 0.5rem;
                    min-height: 200px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .qr-loading {
                    color: #6b7280;
                    font-size: 0.875rem;
                }
                
                .qr-error {
                    color: #ef4444;
                    font-size: 0.875rem;
                }
                
                .qr-container img {
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
                
                .branch-modal-buttons {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                
                .branch-modal-stores {
                    display: flex;
                    gap: 1rem;
                    margin-top: 1rem;
                }
                
                .store-badge img {
                    height: 40px;
                }
                
                .branch-modal-footer {
                    text-align: center;
                    padding-top: 1rem;
                    border-top: 1px solid #e5e7eb;
                    color: #9ca3af;
                    font-size: 0.875rem;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slideUp {
                    from {
                        transform: translateY(20px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
            </style>
        `;
        document.head.insertAdjacentHTML('beforeend', styles);
    }
}

// Close Branch modal
window.closeBranchModal = function() {
    const modal = document.getElementById('branchModal');
    if (modal) {
        modal.remove();
    }
};

// Send link via SMS (demo implementation)
window.sendLinkViaSMS = function(link) {
    // In a real implementation, this would use Twilio or similar
    alert('Demo: SMS would be sent with link:\n' + link);
    
    // Track event
    if (typeof branch !== 'undefined') {
        branch.logEvent('SHARE', {
            channel: 'sms',
            vertical: 'shopping',
            source_surface: 'web'
        });
    }
};

// Copy link to clipboard
window.copyLinkToClipboard = function(link) {
    navigator.clipboard.writeText(link).then(() => {
        alert('Link copied to clipboard!');
        
        // Track event
        if (typeof branch !== 'undefined') {
            branch.logEvent('SHARE', {
                channel: 'clipboard',
                vertical: 'shopping',
                source_surface: 'web'
            });
        }
    }).catch(err => {
        console.error('Failed to copy link:', err);
        alert('Failed to copy link. Please try again.');
    });
};


// Fallback link handling
function openFallbackLink(data) {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    if (isMobile) {
        // Try app scheme first, then fall back to store
        const appScheme = 'solashopping://';
        const params = new URLSearchParams(data).toString();
        const deepLink = `${appScheme}?${params}`;
        
        // Try to open app
        window.location.href = deepLink;
        
        // Fallback to store after delay
        setTimeout(() => {
            if (isIOS) {
                window.location.href = APP_STORE_URL;
            } else {
                window.location.href = PLAY_STORE_URL;
            }
        }, 2000);
    } else {
        // Desktop: Show download options
        showDeepLinkModal('', data);
    }
}

// Provide fallback links when Branch is not available
function provideFallbackLinks() {
    console.log('Providing fallback deep linking functionality');
    
    // Override the createBranchLink function with fallback
    window.createBranchLink = function(options) {
        openFallbackLink(options.data || {});
    };
}

// Utility functions
function highlightProduct(productId) {
    // Highlight the product that was viewed in app
    const productCard = document.querySelector(`[data-id="${productId}"]`);
    if (productCard) {
        productCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        productCard.style.animation = 'highlight 2s ease';
        
        // Add highlight animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes highlight {
                0%, 100% { box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                50% { box-shadow: 0 0 20px rgba(255, 84, 0, 0.5); }
            }
        `;
        document.head.appendChild(style);
    }
}

function syncCartFromApp(cartData) {
    // Sync cart data from app
    if (cartData && typeof cartData === 'string') {
        try {
            const cart = JSON.parse(cartData);
            localStorage.setItem('solaShoppingCart', JSON.stringify(cart));
            
            // Reload cart UI if the function exists
            if (typeof window.loadCart === 'function') {
                window.loadCart();
            }
            
            // Show notification
            showSyncNotification('Cart synced from app');
        } catch (err) {
            console.error('Failed to sync cart:', err);
        }
    }
}

function updateUserSession(userData) {
    // Update user session from app authentication
    if (userData) {
        localStorage.setItem('solaUser', JSON.stringify(userData));
        
        // Update UI if elements exist
        const userName = document.querySelector('.user-name');
        if (userName && userData.name) {
            userName.textContent = userData.name;
        }
        
        showSyncNotification('Logged in as ' + userData.name);
    }
}

function showSyncNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 4px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Analytics tracking
if (typeof branch !== 'undefined') {
    // Track commerce events for demo
    window.trackCommerceEvent = function(eventName, eventData) {
        branch.logEvent(eventName, {
            ...eventData,
            vertical: 'shopping',
            source_surface: 'web'
        });
    };
}

console.log('Branch integration loaded for Sola Shopping demo');