const escapeHTML = (str) => {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

async function init() {
    // 1. Inject Header and Footer
    injectHeader();
    injectFooter();

    // 2. Load Products
    try {
        const res = await fetch('/data/products.json');
        products = await res.json();
    } catch (e) {
        console.error("Failed to load products", e);
    }

    // 3. Initialize Features
    initNav();
    initCart();
    initWishlist();
    initSlider();
    initModals();
    initAnimations();

    // 4. Render Page Specific Content
    renderPage();
}

function injectHeader() {
    const header = document.querySelector('header.modern-nav');
    if (!header) return;
    header.innerHTML = `
        <div class="nav-container">
            <div class="logo"><a href="index.html">Thread & Sole</a></div>
            <nav class="main-nav">
                <ul>
                    <li><a href="mens.html">Men</a></li>
                    <li><a href="womens.html">Women</a></li>
                    <li><a href="footwear.html">Footwear</a></li>
                    <li><a href="sale.html">Sale</a></li>
                    <li><a href="about.html">About</a></li>
                </ul>
            </nav>
            <div class="nav-icons">
                <button id="search-btn" class="nav-icon"><i class="fas fa-search"></i></button>
                <button id="wishlist-btn-nav" class="nav-icon"><i class="far fa-heart"></i></button>
                <button id="cart-btn" class="nav-icon"><i class="fas fa-shopping-bag"></i><span class="cart-count">0</span></button>
                <button id="account-btn" class="nav-icon" onclick="location.href='profile.html'"><i class="far fa-user"></i></button>
            </div>
            <button class="hamburger" id="hamburger"><div class="hamburger-line"></div><div class="hamburger-line"></div><div class="hamburger-line"></div></button>
        </div>
        <div class="search-bar" id="search-bar">
            <input type="text" placeholder="Search for items...">
            <button class="close-search" id="close-search"><i class="fas fa-times"></i></button>
        </div>
    `;
}

function injectFooter() {
    const footer = document.querySelector('footer.modern-footer');
    if (!footer) return;
    footer.innerHTML = `
        <div class="footer-container">
            <div class="footer-logo">
                <span>Thread & Sole</span>
                <p>Everyday fashion for modern living</p>
            </div>
            <div class="footer-links">
                <div class="link-column">
                    <h4>Shop</h4>
                    <ul>
                        <li><a href="mens.html">Men's Clothing</a></li>
                        <li><a href="womens.html">Women's Clothing</a></li>
                        <li><a href="footwear.html">Footwear</a></li>
                    </ul>
                </div>
                <div class="link-column">
                    <h4>Help</h4>
                    <ul>
                        <li><a href="faq.html">FAQ</a></li>
                        <li><a href="contact.html">Contact Us</a></li>
                    </ul>
                </div>
                <div class="link-column">
                    <h4>Legal</h4>
                    <ul>
                        <li><a href="privacy.html">Privacy Policy</a></li>
                        <li><a href="terms.html">Terms of Service</a></li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="footer-bottom"><p>© 2023 Thread & Sole. All rights reserved.</p></div>
    `;
}

function initNav() {
    const hamburger = document.getElementById('hamburger');
    const mainNav = document.querySelector('.main-nav');
    if (hamburger && mainNav) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            mainNav.classList.toggle('active');
        });
    }

    const searchBtn = document.getElementById('search-btn');
    const closeSearch = document.getElementById('close-search');
    const searchBar = document.getElementById('search-bar');
    if (searchBtn && searchBar) {
        searchBtn.addEventListener('click', () => searchBar.classList.add('active'));
        if (closeSearch) closeSearch.addEventListener('click', () => searchBar.classList.remove('active'));
    }
}

function initCart() {
    const cartBtn = document.getElementById('cart-btn');
    const closeCart = document.querySelector('.close-cart');
    const floatingCart = document.getElementById('floating-cart');
    if (cartBtn && floatingCart) {
        cartBtn.addEventListener('click', () => floatingCart.classList.add('active'));
        if (closeCart) closeCart.addEventListener('click', () => floatingCart.classList.remove('active'));
    }
    updateCartUI();
}

function updateCartUI() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) cartCount.textContent = cart.reduce((s, i) => s + i.quantity, 0);

    const container = document.getElementById('cart-items');
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = '<div class="empty-cart"><i class="fas fa-shopping-bag"></i><p>Your bag is empty</p></div>';
        document.querySelector('.total-amount').textContent = '$0.00';
    } else {
        container.innerHTML = '';
        let total = 0;
        cart.forEach(item => {
            total += item.price * item.quantity;
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <img src="${escapeHTML(item.image)}" class="cart-item-img">
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${escapeHTML(item.title)}</h4>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                    <div class="cart-item-actions">
                        <div class="cart-item-quantity">
                            <button class="quantity-btn" onclick="changeQty(${item.id}, -1)">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn" onclick="changeQty(${item.id}, 1)">+</button>
                        </div>
                        <button class="remove-item" onclick="removeItem(${item.id})">Remove</button>
                    </div>
                </div>
            `;
            container.appendChild(div);
        });
        document.querySelector('.total-amount').textContent = `$${total.toFixed(2)}`;
    }
    localStorage.setItem('cart', JSON.stringify(cart));
}

window.changeQty = (id, delta) => {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) cart = cart.filter(i => i.id !== id);
        updateCartUI();
    }
};

window.removeItem = (id) => {
    cart = cart.filter(i => i.id !== id);
    updateCartUI();
};

window.addToCart = (id) => {
    const p = products.find(x => x.id === id);
    if (!p) return;
    const existing = cart.find(i => i.id === id);
    if (existing) existing.quantity++;
    else cart.push({...p, quantity: 1});
    updateCartUI();
    document.getElementById('floating-cart').classList.add('active');
};

function initWishlist() {
    const btn = document.getElementById('wishlist-btn-nav');
    if (btn) {
        btn.addEventListener('click', () => alert(`You have ${wishlist.length} items in your wishlist`));
    }
}

window.toggleWishlist = (id) => {
    const idx = wishlist.findIndex(i => i.id === id);
    if (idx === -1) {
        const p = products.find(x => x.id === id);
        if (p) wishlist.push(p);
    } else {
        wishlist.splice(idx, 1);
    }
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    renderPage(); // Re-render to update icons
};

function initSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    if (slides.length === 0) return;
    let current = 0;
    const next = () => {
        slides[current].classList.remove('active');
        current = (current + 1) % slides.length;
        slides[current].classList.add('active');
    };
    setInterval(next, 5000);
}

function initModals() {
    // Quick View and Size Guide logic remains similar to original
    window.openQuickView = (id) => {
        const p = products.find(x => x.id === id);
        if (!p) return;
        document.getElementById('quick-view-title').textContent = p.title;
        document.getElementById('quick-view-price').textContent = `$${p.price.toFixed(2)}`;
        document.getElementById('quick-view-img').src = p.image;
        document.getElementById('quick-view-description').textContent = p.description;

        const modalBtn = document.querySelector('#quick-view-modal .add-to-cart-btn');
        if (modalBtn) {
            modalBtn.onclick = () => {
                addToCart(p.id);
                document.getElementById('quick-view-modal').classList.remove('active');
                document.body.style.overflow = '';
            };
        }

        document.getElementById('quick-view-modal').classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const closeBtns = document.querySelectorAll('.close-modal');
    closeBtns.forEach(btn => btn.addEventListener('click', () => {
        document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
        document.body.style.overflow = '';
    }));
}

function initAnimations() {
    const backToTop = document.getElementById('back-to-top');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) backToTop.classList.add('active');
            else backToTop.classList.remove('active');
        });
        backToTop.addEventListener('click', () => window.scrollTo({top: 0, behavior: 'smooth'}));
    }
}

function renderPage() {
    const grid = document.querySelector('.products-grid');
    if (!grid) return;

    let toRender = products;
    const path = window.location.pathname;
    if (path.includes('mens.html')) toRender = products.filter(p => p.category === 'men');
    else if (path.includes('womens.html')) toRender = products.filter(p => p.category === 'women');
    else if (path.includes('footwear.html')) toRender = products.filter(p => p.category === 'footwear');
    else if (path.includes('sale.html')) toRender = products.filter(p => p.sale);

    grid.innerHTML = '';
    toRender.forEach(p => {
        const isWish = wishlist.some(i => i.id === p.id);
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image-container">
                <img src="${escapeHTML(p.image)}" class="product-image">
                <div class="product-badge">${escapeHTML(p.rating)} <i class="fas fa-star"></i></div>
                <button class="wishlist-btn" onclick="toggleWishlist(${p.id})">
                    <i class="${isWish ? 'fas' : 'far'} fa-heart"></i>
                </button>
            </div>
            <div class="product-info">
                <h3 class="product-title">${escapeHTML(p.title)}</h3>
                <div class="product-price">$${p.price.toFixed(2)}</div>
                <div class="product-actions">
                    <button class="add-to-cart" onclick="addToCart(${p.id})">Add to Cart</button>
                    <button class="quick-view" onclick="openQuickView(${p.id})">Quick View</button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', init);
