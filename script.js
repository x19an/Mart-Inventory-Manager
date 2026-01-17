
// Initialize data from LocalStorage
let products = JSON.parse(localStorage.getItem('mart_products')) || [];
let categories = JSON.parse(localStorage.getItem('mart_categories')) || ['Beverages', 'Snacks', 'Dairy', 'Produce', 'Meat', 'Bakery'];
let activeView = 'add-product';

// DOM Elements
const viewContainer = document.getElementById('view-container');
const viewTitle = document.getElementById('view-title');
const navButtons = document.querySelectorAll('.nav-btn');
const exitBtn = document.getElementById('exit-btn');
const exitOverlay = document.getElementById('exit-overlay');

// Navigation Logic
navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const view = btn.getAttribute('data-view');
        switchView(view);
    });
});

exitBtn.addEventListener('click', () => {
    exitOverlay.classList.remove('hidden');
});

function switchView(viewName) {
    activeView = viewName;
    navButtons.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-view') === viewName);
    });
    const titles = {
        'add-product': 'Add Product',
        'sell-product': 'Sell Product',
        'search-products': 'Search Products',
        'best-sellers': 'Best Sellers',
        'categories': 'Categories'
    };
    viewTitle.textContent = titles[viewName];
    render();
}

// Data persistence
function save() {
    localStorage.setItem('mart_products', JSON.stringify(products));
    localStorage.setItem('mart_categories', JSON.stringify(categories));
}

// Rendering Engine
function render() {
    viewContainer.innerHTML = '';
    
    if (activeView === 'add-product') {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
            <form id="add-form" class="form-grid">
                <div class="form-group full-width">
                    <label>Product Name</label>
                    <input type="text" id="p-name" required>
                </div>
                <div class="form-group full-width">
                    <label>Category</label>
                    <select id="p-cat">${categories.map(c => `<option>${c}</option>`).join('')}</select>
                </div>
                <div class="form-group">
                    <label>Price (Rs.)</label>
                    <input type="number" id="p-price" step="0.01" required>
                </div>
                <div class="form-group">
                    <label>Initial Stock</label>
                    <input type="number" id="p-stock" required>
                </div>
                <div class="form-group full-width">
                    <label>Reorder Level</label>
                    <input type="number" id="p-reorder" required>
                </div>
                <button type="submit" class="btn-primary">Add Product</button>
            </form>
            <div id="alert" class="alert hidden"></div>
        `;
        viewContainer.appendChild(div);
        document.getElementById('add-form').onsubmit = (e) => {
            e.preventDefault();
            const p = {
                id: Math.random().toString(36).substr(2, 6).toUpperCase(),
                name: document.getElementById('p-name').value,
                category: document.getElementById('p-cat').value,
                price: parseFloat(document.getElementById('p-price').value),
                stock: parseInt(document.getElementById('p-stock').value),
                reorderLevel: parseInt(document.getElementById('p-reorder').value),
                unitsSold: 0
            };
            products.push(p);
            save();
            e.target.reset();
            const al = document.getElementById('alert');
            al.textContent = 'Product added successfully!';
            al.className = 'alert alert-success';
            setTimeout(() => al.className = 'hidden', 3000);
        };
    }

    if (activeView === 'sell-product') {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
            <form id="sell-form" class="form-grid">
                <div class="form-group full-width">
                    <label>Product ID or Name</label>
                    <input type="text" id="s-query" required>
                </div>
                <div class="form-group full-width">
                    <label>Quantity</label>
                    <input type="number" id="s-qty" required>
                </div>
                <button type="submit" class="btn-primary">Complete Sale</button>
            </form>
            <div id="sell-alert" class="alert hidden"></div>
            <div id="receipt-box" class="hidden">
                <button id="btn-receipt" class="btn-primary" style="background:#22c55e; margin-top:1rem">🖨️ Print PDF Receipt</button>
            </div>
        `;
        viewContainer.appendChild(div);
        let lastSale = null;

        document.getElementById('sell-form').onsubmit = (e) => {
            e.preventDefault();
            const q = document.getElementById('s-query').value.toLowerCase();
            const qty = parseInt(document.getElementById('s-qty').value);
            const idx = products.findIndex(p => p.id.toLowerCase() === q || p.name.toLowerCase() === q);
            const al = document.getElementById('sell-alert');

            if (idx === -1) {
                al.textContent = 'Product not found.';
                al.className = 'alert alert-error';
                return;
            }
            if (products[idx].stock < qty) {
                al.textContent = 'Insufficient stock!';
                al.className = 'alert alert-error';
                return;
            }

            products[idx].stock -= qty;
            products[idx].unitsSold += qty;
            lastSale = { product: products[idx], qty };
            save();
            al.textContent = 'Sale successful!';
            al.className = 'alert alert-success';
            document.getElementById('receipt-box').classList.remove('hidden');
        };

        document.getElementById('btn-receipt').onclick = () => {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ unit: 'mm', format: [80, 120] });
            doc.setFontSize(12);
            doc.text('MART INVENTORY', 40, 10, { align: 'center' });
            doc.setFontSize(8);
            doc.text('------------------------------', 40, 15, { align: 'center' });
            doc.text(`Item: ${lastSale.product.name}`, 10, 25);
            doc.text(`Qty: ${lastSale.qty}`, 10, 30);
            doc.text(`Price: Rs. ${lastSale.product.price}`, 10, 35);
            doc.text(`Total: Rs. ${lastSale.product.price * lastSale.qty}`, 10, 45);
            doc.text('------------------------------', 40, 55, { align: 'center' });
            doc.text('Thank you!', 40, 65, { align: 'center' });
            doc.save('receipt.pdf');
        };
    }

    if (activeView === 'search-products') {
        const div = document.createElement('div');
        div.innerHTML = `
            <div class="search-header"><input type="text" id="search" class="search-input" placeholder="Search..."></div>
            <div class="table-container">
                <table>
                    <thead><tr><th>ID</th><th>Name</th><th>Cat</th><th>Price</th><th>Stock</th><th>Status</th></tr></thead>
                    <tbody id="rows"></tbody>
                </table>
            </div>
        `;
        viewContainer.appendChild(div);
        const draw = () => {
            const val = document.getElementById('search').value.toLowerCase();
            document.getElementById('rows').innerHTML = products
                .filter(p => p.name.toLowerCase().includes(val) || p.id.toLowerCase().includes(val))
                .map(p => `
                    <tr>
                        <td style="color:#60a5fa">${p.id}</td>
                        <td>${p.name}</td>
                        <td>${p.category}</td>
                        <td>Rs. ${p.price}</td>
                        <td>${p.stock}</td>
                        <td><span class="status-badge ${p.stock <= p.reorderLevel ? 'status-low' : 'status-ok'}">${p.stock <= p.reorderLevel ? 'Low' : 'OK'}</span></td>
                    </tr>
                `).join('');
        };
        document.getElementById('search').oninput = draw;
        draw();
    }

    if (activeView === 'best-sellers') {
        const div = document.createElement('div');
        div.className = 'table-container';
        div.innerHTML = `
            <table>
                <thead><tr><th>Rank</th><th>Product</th><th>Sold</th><th>Revenue</th></tr></thead>
                <tbody>
                    ${[...products].sort((a,b) => b.unitsSold - a.unitsSold).map((p, i) => `
                        <tr>
                            <td>${i+1}</td>
                            <td>${p.name}</td>
                            <td>${p.unitsSold}</td>
                            <td>Rs. ${p.unitsSold * p.price}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        viewContainer.appendChild(div);
    }

    if (activeView === 'categories') {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
            <div class="form-group">
                <label>New Category</label>
                <div style="display:flex; gap:10px">
                    <input type="text" id="new-cat" style="flex:1">
                    <button id="add-cat-btn" class="btn-primary" style="margin:0; width:auto">Add</button>
                </div>
            </div>
            <div id="cat-list" style="margin-top:2rem"></div>
        `;
        viewContainer.appendChild(div);
        const updateCats = () => {
            document.getElementById('cat-list').innerHTML = categories.map(c => `
                <div class="category-item">
                    <span>${c}</span>
                    <button class="remove-btn" onclick="removeCat('${c}')">✕</button>
                </div>
            `).join('');
        };
        document.getElementById('add-cat-btn').onclick = () => {
            const v = document.getElementById('new-cat').value.trim();
            if (v && !categories.includes(v)) {
                categories.push(v);
                save();
                updateCats();
            }
        };
        window.removeCat = (c) => {
            categories = categories.filter(x => x !== c);
            save();
            updateCats();
        };
        updateCats();
    }
}

// Initial Render
render();
