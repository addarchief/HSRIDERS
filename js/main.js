/**
 * HS RIDERS - Motor Unificado (Main Engine)
 * -------------------------------------------
 * Este archivo es el núcleo de toda la plataforma. 
 * Controla: Inicio, Catálogo, Carrito y Navegación.
 */

// ==========================================
// 1. ESTADO GLOBAL Y CONFIGURACIÓN
// ==========================================
const WHATSAPP_NUMBER = '56929562206';
let cart = JSON.parse(localStorage.getItem('hs-riders-cart')) || [];
let currentCategory = 'TODOS';

// ==========================================
// 2. REFERENCIAS AL DOM
// ==========================================
const DOM = {
    // Navegación
    nav: document.getElementById('main-nav'),
    navLinks: document.querySelectorAll('.nav-link'),
    sections: document.querySelectorAll('section[id]'),

    // Carrito
    cartBtn: document.getElementById('cart-btn'),
    cartDrawer: document.getElementById('cart-drawer'),
    cartOverlay: document.getElementById('cart-overlay'),
    closeCartBtn: document.getElementById('close-cart'),
    cartItemsContainer: document.getElementById('cart-items'),
    cartTotalElement: document.getElementById('cart-total'),
    cartCountIndicators: document.querySelectorAll('.shopping-cart-count'),

    // Contenedores de Productos (Landing e Index)
    productsGrid: document.getElementById('products-grid'), // Slider inicio
    catalogGrid: document.getElementById('catalog-grid'),   // Grid catálogo
    filterButtons: document.querySelectorAll('.filter-btn'),
    noResults: document.getElementById('no-results'),

    // Menú Móvil
    menuBtn: document.getElementById('menu-btn'),
    mobileMenu: document.getElementById('mobile-menu'),
    menuOverlay: document.getElementById('menu-overlay'),
    closeMenuBtn: document.getElementById('close-menu'),

    // Controles Slider Inicio
    prevBtn: document.getElementById('prev-slide'),
    nextBtn: document.getElementById('next-slide'),
    
    // Botón Checkout
    checkoutBtn: document.getElementById('checkout-btn')
};

// ==========================================
// 3. NAVEGACIÓN Y EFECTOS COHERENTES
// ==========================================

// Efecto de transparencia/vidrio al hacer scroll
function handleNavScroll() {
    if (window.scrollY > 50) {
        DOM.nav.classList.add('nav-scrolled');
    } else {
        // En catalogo.html siempre queremos el fondo si no hay Hero dinámico
        if (!document.body.classList.contains('catalog-page')) {
            DOM.nav.classList.remove('nav-scrolled');
        }
    }
}

window.addEventListener('scroll', handleNavScroll);

// Scroll Spy (Solo para index.html con secciones)
if (DOM.sections.length > 0 && !document.body.classList.contains('catalog-page')) {
    const scrollSpyOptions = { threshold: 0.3, rootMargin: "0px 0px -20% 0px" };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                updateActiveNavLink(id);
            }
        });
    }, scrollSpyOptions);
    DOM.sections.forEach(section => observer.observe(section));
}

function updateActiveNavLink(id) {
    DOM.navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === `#${id}` || href === `index.html#${id}`) {
            link.classList.add('text-lime-400', 'border-lime-400', 'text-glow', 'active-nav-link');
            link.classList.remove('text-neutral-400', 'border-transparent');
        } else {
            link.classList.remove('text-lime-400', 'border-lime-400', 'text-glow', 'active-nav-link');
            link.classList.add('text-neutral-400', 'border-transparent');
        }
    });
}

// Desplazamiento suave (Smooth Scroll)
DOM.navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');

        // Si es un enlace a otra página (como catalogo.html), permitimos el comportamiento normal
        if (!href.startsWith('#') && !href.startsWith(window.location.pathname + '#')) {
            return;
        }

        const id = href.includes('#') ? href.split('#')[1] : null;
        if (!id) return;

        const section = document.getElementById(id);
        if (section) {
            e.preventDefault();

            // Cerrar menú móvil si está abierto al navegar
            if (document.body.classList.contains('menu-open')) toggleMobileMenu();

            window.scrollTo({
                top: section.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// ==========================================
// 4. LÓGICA DE PANELES (MÓVIL Y CARRITO)
// ==========================================

// --- Carrito ---
function toggleCart() {
    document.body.classList.toggle('cart-open');
    // Cerrar menú móvil si se abre el carrito
    if (document.body.classList.contains('menu-open')) toggleMobileMenu();
}

if (DOM.cartBtn) DOM.cartBtn.addEventListener('click', toggleCart);
if (DOM.closeCartBtn) DOM.closeCartBtn.addEventListener('click', toggleCart);
if (DOM.cartOverlay) DOM.cartOverlay.addEventListener('click', toggleCart);

// --- Menú Móvil ---
function toggleMobileMenu() {
    document.body.classList.toggle('menu-open');
    // Cerrar carrito si se abre el menú
    if (document.body.classList.contains('cart-open')) toggleCart();
}

if (DOM.menuBtn) DOM.menuBtn.addEventListener('click', toggleMobileMenu);
if (DOM.closeMenuBtn) DOM.closeMenuBtn.addEventListener('click', toggleMobileMenu);
if (DOM.menuOverlay) DOM.menuOverlay.addEventListener('click', toggleMobileMenu);

function addToCart(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    renderCart();
    if (!document.body.classList.contains('cart-open')) toggleCart();
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    item.quantity += change;
    if (item.quantity <= 0) cart = cart.filter(item => item.id !== productId);
    saveCart();
    renderCart();
}

function removeItem(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    renderCart();
}

function saveCart() {
    localStorage.setItem('hs-riders-cart', JSON.stringify(cart));
}

function renderCart() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    DOM.cartCountIndicators.forEach(el => el.textContent = totalItems);

    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (DOM.cartTotalElement) {
        DOM.cartTotalElement.textContent = `CLP$ ${totalPrice.toLocaleString('es-CL')}`;
    }

    if (cart.length === 0) {
        DOM.cartItemsContainer.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
                <span class="material-symbols-outlined text-6xl">inventory_2</span>
                <p class="font-headline font-bold uppercase tracking-widest text-sm">Tu armadura está incompleta</p>
                <button onclick="toggleCart()" class="text-lime-400 text-xs font-bold uppercase tracking-widest hover:underline">Empezar a comprar</button>
            </div>
        `;
        return;
    }

    DOM.cartItemsContainer.innerHTML = cart.map(item => `
        <div class="flex gap-4 cart-item-anim bg-white/5 p-4 rounded-xl border border-white/5 group hover:border-lime-400/20 transition-all">
            <div class="w-20 h-20 bg-surface-container-high rounded-lg overflow-hidden shrink-0">
                <img src="${item.image}" alt="${item.name}" class="w-full h-full object-contain p-2">
            </div>
            <div class="flex-1 flex flex-col justify-between">
                <div>
                    <div class="flex justify-between items-start">
                        <h4 class="font-headline font-bold text-xs uppercase tracking-tight text-white leading-tight">${item.name}</h4>
                        <button onclick="removeItem(${item.id})" class="text-on-surface-variant hover:text-error transition-colors">
                            <span class="material-symbols-outlined text-sm">delete</span>
                        </button>
                    </div>
                </div>
                <div class="flex justify-between items-center mt-2">
                    <div class="flex items-center gap-3 bg-black/30 rounded-full px-3 py-1 scale-90 -ml-2">
                        <button onclick="updateQuantity(${item.id}, -1)" class="text-lime-400 hover:text-white transition-colors">
                            <span class="material-symbols-outlined text-xs">remove</span>
                        </button>
                        <span class="text-xs font-bold w-4 text-center">${item.quantity}</span>
                        <button onclick="updateQuantity(${item.id}, 1)" class="text-lime-400 hover:text-white transition-colors">
                            <span class="material-symbols-outlined text-xs">add</span>
                        </button>
                    </div>
                    <span class="font-headline font-black text-lime-400 text-sm">CLP$ ${(item.price * item.quantity).toLocaleString('es-CL')}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// ==========================================
// 5. RENDERIZADO DE PRODUCTOS (UNIFICADO)
// ==========================================

// Plantilla única para tarjetas de producto
function getProductHTML(product, isGrid = false) {
    const animationClass = isGrid ? 'cart-item-anim' : '';
    const containerWidth = isGrid ? '' : 'min-w-[280px] lg:min-w-0 snap-start';

    return `
        <div class="group ${containerWidth} ${animationClass}">
            <div class="relative bg-white/5 rounded-2xl overflow-hidden aspect-[4/5] mb-6 border border-white/5 group-hover:border-primary-container/20 transition-all duration-500">
                <img class="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-700" 
                     src="${product.image}" 
                     alt="${product.name}"/>
                ${product.tag ? `<div class="absolute top-4 left-4 bg-primary-container text-on-primary px-3 py-1 font-headline font-black text-[10px] uppercase tracking-widest rounded-sm">${product.tag}</div>` : ''}
                <div class="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                    <button onclick="addToCart(${product.id})" class="w-full bg-primary-container text-on-primary py-4 font-headline font-bold uppercase text-xs tracking-widest kinetic-glow rounded-xl shadow-xl shadow-lime-400/5">
                        AÑADIR AL EQUIPO
                    </button>
                </div>
            </div>
            <div class="px-2">
                <div class="flex justify-between items-start mb-1">
                    <h3 class="font-headline font-black uppercase tracking-tight text-lg leading-none">${product.name}</h3>
                    <p class="font-headline font-black text-lime-400 text-lg">CLP$ ${product.price ? product.price.toLocaleString('es-CL') : 'N/A'}</p>
                </div>
                <p class="text-on-surface-variant text-[10px] font-label uppercase tracking-widest opacity-60">${product.category}</p>
            </div>
        </div>
    `;
}

// Render para la página de inicio (Slider)
function renderHomeProducts() {
    if (!DOM.productsGrid) return;
    // Solo mostramos los primeros 8 productos en la landing
    DOM.productsGrid.innerHTML = PRODUCTS.slice(0, 8).map(p => getProductHTML(p)).join('');
}

// Render para la página de catálogo (Grid + Filtros)
function renderCatalogGrid() {
    if (!DOM.catalogGrid) return;

    const filtered = currentCategory === 'TODOS'
        ? PRODUCTS
        : PRODUCTS.filter(p => p.category.toUpperCase().includes(currentCategory));

    if (filtered.length === 0) {
        DOM.catalogGrid.innerHTML = '';
        DOM.noResults.classList.remove('hidden');
    } else {
        DOM.noResults.classList.add('hidden');
        DOM.catalogGrid.innerHTML = filtered.map(p => getProductHTML(p, true)).join('');
    }
}

// Lógica de Filtros (Solo Catálogo)
if (DOM.filterButtons.length > 0) {
    DOM.filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            DOM.filterButtons.forEach(b => b.classList.remove('bg-lime-400', 'text-black'));
            btn.classList.add('bg-lime-400', 'text-black');
            currentCategory = btn.dataset.category;
            renderCatalogGrid();
        });
    });
}

// Controles Slider
if (DOM.prevBtn && DOM.nextBtn) {
    DOM.prevBtn.addEventListener('click', () => DOM.productsGrid.scrollLeft -= 350);
    DOM.nextBtn.addEventListener('click', () => DOM.productsGrid.scrollLeft += 350);
}

// ==========================================
// 6. CHECKOUT (WHATSAPP BUSINESS)
// ==========================================

function checkoutWhatsApp() {
    if (cart.length === 0) {
        alert('Tu carrito está vacío. Agrega algunos productos antes de finalizar la compra.');
        return;
    }

    // 1. Construir el cuerpo del mensaje
    let message = "🚀 *NUEVO PEDIDO - Hs RIDERS*\n";
    message += "------------------------------\n";
    
    cart.forEach(item => {
        message += `✅ ${item.quantity}x ${item.name} - CLP$ ${(item.price * item.quantity).toLocaleString('es-CL')}\n`;
    });

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    message += "------------------------------\n";
    message += `💰 *TOTAL: CLP$ ${total.toLocaleString('es-CL')}*\n`;
    message += "------------------------------\n";
    message += "¿Me podrían confirmar disponibilidad y métodos de pago?";

    // 2. Codificar para URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

    // 3. Abrir en pestaña nueva
    window.open(whatsappUrl, '_blank');
}

if (DOM.checkoutBtn) {
    DOM.checkoutBtn.addEventListener('click', checkoutWhatsApp);
}

// ==========================================
// 7. INICIALIZACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Detectar página de catálogo
    if (document.body.classList.contains('catalog-page')) {
        DOM.nav.classList.add('nav-scrolled');
    }

    renderHomeProducts();
    renderCatalogGrid();
    renderCart();

    console.log('🏁 HS RIDERS - Unificado y Operativo');
});
