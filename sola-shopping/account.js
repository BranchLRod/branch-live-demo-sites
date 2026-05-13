// Sola Shopping - Account & Identity Management
// Handles user authentication UI, identity capture, and session management

// Helper to safely show notifications
function safeShowNotification(message) {
    if (typeof showNotification === 'function') {
        showNotification(message);
    } else {
        console.log('[Notification]', message);
        alert(message);
    }
}

// User state management
const AccountState = {
    user: null,
    isAuthenticated: false
};

// Initialize account system
function initAccountSystem() {
    loadUserSession();
    updateUIForAuthState();
}

// Load user from localStorage
function loadUserSession() {
    const savedUser = localStorage.getItem('solaUser');
    if (savedUser) {
        try {
            AccountState.user = JSON.parse(savedUser);
            AccountState.isAuthenticated = true;
            console.log('[Account] signed in with saved profile');

            // Update global state for compatibility
            if (typeof state !== 'undefined') {
                state.user = AccountState.user;
            }
        } catch (err) {
            console.error('Failed to load user session:', err);
            localStorage.removeItem('solaUser');
        }
    }
}

// Save user to localStorage
function saveUserSession(user) {
    // Attach acquisition context to user profile
    if (window.solaAcquisition) {
        const firstTouch = window.solaAcquisition.getFirstTouch();
        if (firstTouch) {
            user.acquisition_context = {
                campaign: firstTouch.campaign,
                channel: firstTouch.channel,
                feature: firstTouch.feature,
                utm_source: firstTouch.utm_source,
                utm_medium: firstTouch.utm_medium,
                utm_campaign: firstTouch.utm_campaign,
                first_touch_timestamp: firstTouch.first_touch_timestamp,
                landing_url: firstTouch.landing_url,
                referrer: firstTouch.referrer
            };
        }
    }

    AccountState.user = user;
    AccountState.isAuthenticated = true;
    localStorage.setItem('solaUser', JSON.stringify(user));

    // Update global state for compatibility
    if (typeof state !== 'undefined') {
        state.user = user;
    }

    // Set Branch identity with acquisition context
    console.log('[Branch] setIdentity called for web demo user');
    if (window.solaBranch && window.solaBranch.setIdentity) {
        window.solaBranch.setIdentity(user.id, {
            firstName: user.firstName,
            source_surface: 'web',
            lead_source: 'sola_shopping_demo'
        });
    }

    // Update Branch view data for Journey personalization
    if (window.solaBranch && window.solaBranch.updateViewData) {
        window.solaBranch.updateViewData({
            first_name: user.firstName,
            company: user.company || null
        });
    }

    updateUIForAuthState();
}

// Sign out user
function signOutUser() {
    AccountState.user = null;
    AccountState.isAuthenticated = false;
    localStorage.removeItem('solaUser');

    // Update global state for compatibility
    if (typeof state !== 'undefined') {
        state.user = {
            id: null,
            name: null,
            email: null
        };
    }

    // Log out from Branch
    if (window.solaBranch && window.solaBranch.logout) {
        window.solaBranch.logout();
    }

    updateUIForAuthState();

    if (typeof safeShowNotification === 'function') {
        safeShowNotification('Signed out successfully');
    }
}

// Update UI based on authentication state
function updateUIForAuthState() {
    const userDropdownBtn = document.getElementById('userDropdownBtn');
    const userName = document.querySelector('.user-name');

    if (!userDropdownBtn) return;

    if (AccountState.isAuthenticated && AccountState.user) {
        // Logged in state
        const displayName = AccountState.user.firstName || AccountState.user.name || 'Account';
        if (userName) {
            userName.textContent = displayName;
        }

        // Update dropdown to show logged-in options
        updateDropdownForLoggedIn();
    } else {
        // Logged out state
        if (userName) {
            userName.textContent = 'Sign In';
        }

        // Update dropdown to show sign-in prompt
        updateDropdownForLoggedOut();
    }
}

// Update dropdown menu for logged-in users
function updateDropdownForLoggedIn() {
    const dropdown = document.getElementById('userDropdown');
    if (!dropdown) return;

    dropdown.innerHTML = `
        <a href="#" class="dropdown-item" onclick="event.preventDefault(); safeShowNotification('Account settings coming soon');">My Account</a>
        <a href="#" class="dropdown-item" onclick="event.preventDefault(); safeShowNotification('Order history coming soon');">My Orders</a>
        <div class="dropdown-divider"></div>
        <a href="#" class="dropdown-item" onclick="event.preventDefault(); signOutUser();">Sign Out</a>
    `;
}

// Update dropdown menu for logged-out users
function updateDropdownForLoggedOut() {
    const dropdown = document.getElementById('userDropdown');
    if (!dropdown) return;

    dropdown.innerHTML = `
        <a href="#" class="dropdown-item" onclick="event.preventDefault(); showAccountModal('signin');">Sign In</a>
        <a href="#" class="dropdown-item" onclick="event.preventDefault(); showAccountModal('signup');">Create Account</a>
        <div class="dropdown-divider"></div>
        <a href="#" class="dropdown-item" onclick="event.preventDefault(); safeShowNotification('Browse as guest');">Continue as Guest</a>
    `;
}

// Show account modal
function showAccountModal(mode = 'signin', context = {}) {
    // Remove existing modal if any
    const existingModal = document.getElementById('accountModal');
    if (existingModal) {
        existingModal.remove();
    }

    const isSignIn = mode === 'signin';
    const title = isSignIn ? 'Welcome Back' : 'Create Your Demo Profile';
    const subtitle = isSignIn
        ? 'Sign in to continue your personalized shopping experience'
        : 'Create your demo profile to personalize this Branch-powered shopping journey.';
    const submitText = isSignIn ? 'Sign In' : 'Create Profile';
    const switchText = isSignIn ? "Don't have an account?" : 'Already have an account?';
    const switchAction = isSignIn ? 'signup' : 'signin';
    const switchLabel = isSignIn ? 'Create profile' : 'Sign in';

    // Store context for post-auth actions
    window.accountModalContext = context;

    const modalHTML = `
        <div id="accountModal" class="modal active">
            <div class="modal-content account-modal-content">
                <button class="modal-close" onclick="closeAccountModal()">&times;</button>

                <div class="account-modal-body">
                    <div class="account-modal-header">
                        <h2>${title}</h2>
                        <p class="account-modal-subtitle">${subtitle}</p>
                    </div>

                    <form id="accountForm" class="account-form" onsubmit="handleAccountSubmit(event, '${mode}'); return false;">
                        ${!isSignIn ? `
                        <div class="form-row">
                            <div class="form-group">
                                <label for="firstName">First Name</label>
                                <input type="text" id="firstName" name="firstName" required>
                            </div>
                            <div class="form-group">
                                <label for="lastName">Last Name</label>
                                <input type="text" id="lastName" name="lastName" required>
                            </div>
                        </div>
                        ` : ''}

                        <div class="form-group">
                            <label for="email">Work Email</label>
                            <input type="email" id="email" name="email" placeholder="you@company.com" required>
                        </div>

                        ${!isSignIn ? `
                        <div class="form-group">
                            <label for="phone">Work Phone</label>
                            <input type="tel" id="phone" name="phone" placeholder="(555) 123-4567" required>
                        </div>
                        <div class="form-group">
                            <label for="company">Company (optional)</label>
                            <input type="text" id="company" name="company" placeholder="Acme Inc.">
                        </div>
                        ` : ''}

                        <div class="form-group">
                            <label for="password">Password</label>
                            <input type="password" id="password" name="password" placeholder="••••••••" required>
                        </div>

                        ${!isSignIn ? `
                        <div class="form-checkbox">
                            <input type="checkbox" id="newsletter" name="newsletter" checked>
                            <label for="newsletter">Send me exclusive deals and new arrivals</label>
                        </div>
                        ` : ''}

                        <button type="submit" class="btn btn-primary btn-block btn-auth-submit">
                            ${submitText}
                        </button>
                    </form>

                    <div class="auth-switch">
                        <span>${switchText}</span>
                        <a href="#" onclick="event.preventDefault(); showAccountModal('${switchAction}', window.accountModalContext);">${switchLabel}</a>
                    </div>

                    ${context.reason ? `
                    <div class="auth-context-message">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                        ${context.reason}
                    </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Lock body scroll when modal is active
    document.body.style.overflow = 'hidden';
}

// Close account modal
function closeAccountModal() {
    const modal = document.getElementById('accountModal');
    if (modal) {
        modal.remove();
    }

    // Restore body scroll
    document.body.style.overflow = '';

    window.accountModalContext = null;
}

// Handle social auth (UI only - no real auth)
function handleSocialAuth(provider) {
    const providerName = provider === 'apple' ? 'Apple' : 'Google';

    // Simulate social auth with delay
    const submitBtn = document.querySelector('.btn-auth-submit');
    const originalText = submitBtn ? submitBtn.textContent : '';

    if (submitBtn) {
        submitBtn.textContent = `Connecting to ${providerName}...`;
        submitBtn.disabled = true;
    }

    setTimeout(() => {
        // Create mock user from social auth (realistic demo data)
        const mockNames = {
            apple: { firstName: 'Sarah', lastName: 'Chen', email: 'sarah.chen@icloud.com' },
            google: { firstName: 'Alex', lastName: 'Morgan', email: 'alex.morgan@gmail.com' }
        };
        const mockData = mockNames[provider] || mockNames.google;

        const mockUser = {
            id: `usr_${provider}_${Date.now()}`,
            email: mockData.email,
            firstName: mockData.firstName,
            lastName: mockData.lastName,
            name: `${mockData.firstName} ${mockData.lastName}`,
            phone: null,
            company: null,
            createdAt: new Date().toISOString(),
            source: `social_${provider}`,
            authProvider: provider,
            source_surface: 'web',
            lead_source: 'sola_shopping_demo'
        };

        console.log('[Account] demo profile created');
        saveUserSession(mockUser);
        closeAccountModal();

        safeShowNotification(`Welcome, ${mockUser.firstName}!`);

        // Handle post-auth context actions
        handlePostAuthActions();
    }, 1500);
}

// Handle form submission
function handleAccountSubmit(event, mode) {
    if (event && event.preventDefault) {
        event.preventDefault();
    }
    console.log('[Account] create account clicked, mode:', mode);

    const form = event.target;
    const formData = new FormData(form);

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = mode === 'signin' ? 'Signing in...' : 'Creating account...';
    submitBtn.disabled = true;

    // Simulate API call with delay
    setTimeout(() => {
        const email = formData.get('email');
        const firstName = formData.get('firstName') || email.split('@')[0];
        const lastName = formData.get('lastName') || '';
        const phone = formData.get('phone') || null;
        const company = formData.get('company') || null;
        const newsletter = formData.get('newsletter') === 'on';

        const user = {
            id: `usr_${Date.now()}`,
            email: email,
            firstName: firstName,
            lastName: lastName,
            name: `${firstName} ${lastName}`.trim(),
            phone: phone,
            company: company,
            newsletter: newsletter,
            createdAt: new Date().toISOString(),
            source: mode === 'signup' ? 'email_signup' : 'email_signin',
            authProvider: 'email',
            source_surface: 'web',
            lead_source: 'sola_shopping_demo'
        };

        console.log('[Account] demo profile created');
        saveUserSession(user);
        console.log('[Account] create profile success');
        closeAccountModal();

        const message = mode === 'signin'
            ? `Welcome back, ${user.firstName}!`
            : `Account created! Welcome, ${user.firstName}!`;
        safeShowNotification(message);

        // Handle post-auth context actions
        handlePostAuthActions();
    }, 1000);
}

// Handle actions after successful authentication
function handlePostAuthActions() {
    const context = window.accountModalContext;
    if (!context) return;

    if (context.action === 'checkout') {
        // Close cart and proceed to checkout confirmation
        if (typeof toggleCart === 'function') {
            // Close cart if open
            const cartSidebar = document.getElementById('cartSidebar');
            if (cartSidebar && cartSidebar.classList.contains('active')) {
                toggleCart();
            }
        }

        // Continue with checkout confirmation
        setTimeout(() => {
            if (typeof showCheckoutConfirmation === 'function') {
                showCheckoutConfirmation();
            }
        }, 300); // Small delay to allow cart close animation
    } else if (context.action === 'newsletter') {
        // Track newsletter signup
        safeShowNotification('You\'re subscribed! Check your email for exclusive deals.');
    }

    window.accountModalContext = null;
}

// Check if user is authenticated
function isUserAuthenticated() {
    return AccountState.isAuthenticated && AccountState.user !== null;
}

// Get current user
function getCurrentUser() {
    return AccountState.user;
}

// Require authentication (show modal if not logged in)
function requireAuth(reason = 'Please sign in to continue', action = null) {
    if (isUserAuthenticated()) {
        return true;
    }

    showAccountModal('signin', {
        reason: reason,
        action: action
    });

    return false;
}

// Wishlist removed - not used in this demo

// Handle checkout with auth check
function handleCheckoutWithAuth() {
    if (!isUserAuthenticated()) {
        const cart = typeof state !== 'undefined' ? state.cart : [];
        if (cart.length === 0) {
            safeShowNotification('Your cart is empty');
            return;
        }

        // Show simplified email capture for checkout
        showQuickCheckoutCapture();
    } else {
        // Proceed with normal checkout
        if (typeof showCheckoutConfirmation === 'function') {
            showCheckoutConfirmation();
        }
    }
}

// Show quick email capture for checkout
function showQuickCheckoutCapture() {
    // Close cart before showing account modal
    if (typeof toggleCart === 'function') {
        const cartSidebar = document.getElementById('cartSidebar');
        if (cartSidebar && cartSidebar.classList.contains('active')) {
            toggleCart();
        }
    }

    // Show account modal after cart closes
    setTimeout(() => {
        showAccountModal('signup', {
            reason: 'Create an account to continue checkout',
            action: 'checkout'
        });
    }, 300); // Small delay to allow cart close animation
}

// Newsletter signup handler
function handleNewsletterSignup(email) {
    if (!email || !email.includes('@')) {
        safeShowNotification('Please enter a valid email address');
        return;
    }

    // Save as lead
    const lead = {
        id: `lead_${Date.now()}`,
        email: email,
        source: 'newsletter',
        createdAt: new Date().toISOString()
    };

    // Store newsletter leads separately
    const leads = JSON.parse(localStorage.getItem('solaNewsletterLeads') || '[]');
    leads.push(lead);
    localStorage.setItem('solaNewsletterLeads', JSON.stringify(leads));

    safeShowNotification('Thanks for subscribing! Check your email for exclusive deals.');
}

// Get complete lead profile payload for future backend ingestion
function getSolaLeadProfilePayload() {
    const user = getCurrentUser();
    if (!user) {
        return null;
    }

    // Get acquisition context
    const firstTouch = window.solaAcquisition ? window.solaAcquisition.getFirstTouch() : null;
    const lastTouch = window.solaAcquisition ? window.solaAcquisition.getLastTouch() : null;

    // Get cart snapshot
    let cartSnapshot = null;
    if (typeof state !== 'undefined' && state.cart && state.cart.length > 0) {
        const cartTotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const cartItemCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);

        cartSnapshot = {
            items: state.cart.map(item => ({
                product_id: item.id,
                product_name: item.name,
                price: item.price,
                quantity: item.quantity
            })),
            total_value: cartTotal,
            item_count: cartItemCount,
            snapshot_timestamp: new Date().toISOString()
        };
    }

    // Get last viewed product
    let lastViewedProduct = null;
    try {
        const lastViewed = localStorage.getItem('sola_last_viewed_product');
        if (lastViewed) {
            lastViewedProduct = JSON.parse(lastViewed);
        }
    } catch (err) {
        // Ignore parsing errors
    }

    // Build complete profile payload
    const payload = {
        // User profile
        user_id: user.id,
        email: user.email,
        first_name: user.firstName || user.first_name,
        last_name: user.lastName || user.last_name,
        phone: user.phone,
        company: user.company,
        created_at: user.createdAt,
        auth_provider: user.authProvider,
        newsletter_opted_in: user.newsletter || false,

        // Acquisition context
        acquisition: {
            first_touch: firstTouch ? {
                timestamp: firstTouch.first_touch_timestamp,
                landing_url: firstTouch.landing_url,
                referrer: firstTouch.referrer,
                campaign: firstTouch.campaign,
                channel: firstTouch.channel,
                feature: firstTouch.feature,
                utm_source: firstTouch.utm_source,
                utm_medium: firstTouch.utm_medium,
                utm_campaign: firstTouch.utm_campaign,
                utm_content: firstTouch.utm_content,
                utm_term: firstTouch.utm_term
            } : null,
            last_touch: lastTouch ? {
                timestamp: lastTouch.last_touch_timestamp,
                landing_url: lastTouch.landing_url,
                referrer: lastTouch.referrer,
                campaign: lastTouch.campaign,
                channel: lastTouch.channel
            } : null
        },

        // Cart snapshot
        cart_snapshot: cartSnapshot,

        // Last viewed product
        last_viewed_product: lastViewedProduct,

        // Metadata
        source_surface: 'web',
        lead_source: 'sola_shopping_demo',
        payload_timestamp: new Date().toISOString()
    };

    return payload;
}

// Export functions for global access
window.initAccountSystem = initAccountSystem;
window.showAccountModal = showAccountModal;
window.closeAccountModal = closeAccountModal;
window.handleSocialAuth = handleSocialAuth;
window.handleAccountSubmit = handleAccountSubmit;
window.signOutUser = signOutUser;
window.isUserAuthenticated = isUserAuthenticated;
window.getCurrentUser = getCurrentUser;
window.requireAuth = requireAuth;
window.handleCheckoutWithAuth = handleCheckoutWithAuth;
window.handleNewsletterSignup = handleNewsletterSignup;
window.getSolaLeadProfilePayload = getSolaLeadProfilePayload;
