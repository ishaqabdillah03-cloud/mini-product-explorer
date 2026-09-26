const API_URL = 'https://dummyjson.com/products';

let allProducts = [];

const loadingState = document.getElementById('loading-state');
const errorState = document.getElementById('error-state');
const emptyState = document.getElementById('empty-state');
const productGrid = document.getElementById('product-grid');
const resultSummary = document.getElementById('result-summary');
const categorySelect = document.getElementById('category-select');
const sortSelect = document.getElementById('sort-select');
const searchInput = document.getElementById('search-input');
const resetBtn = document.getElementById('reset-btn');
const productDialog = document.getElementById('product-dialog');
const dialogClose = document.getElementById('dialog-close');
const dialogContent = document.getElementById('dialog-content');

loadingState.hidden = true;
errorState.hidden = true;
emptyState.hidden = true;

async function loadProducts() {
  const response = await fetch(`${API_URL}?limit=100`);
  const data = await response.json();
  allProducts = data.products;
  applyFilters();
}

async function loadCategories() {
  const response = await fetch(`${API_URL}/categories`);
  const data = await response.json();
  categorySelect.innerHTML = '<option value="all">Semua kategori</option>';
  data.forEach(cat => {
    categorySelect.innerHTML += `<option value="${cat.slug}">${cat.name}</option>`;
  });
}

function applyFilters() {
  const keyword = searchInput.value.trim().toLowerCase();
  const category = categorySelect.value;
  const sort = sortSelect.value;

  let result = allProducts.filter(product => {
    const matchSearch = product.title.toLowerCase().includes(keyword);
    const matchCategory = category === 'all' || product.category === category;
    return matchSearch && matchCategory;
  });

  if (sort === 'price-asc') {
    result.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-desc') {
    result.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating-desc') {
    result.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'name-asc') {
    result.sort((a, b) => a.title.localeCompare(b.title));
  }

  renderProducts(result);
}

function renderProducts(list) {
  resultSummary.textContent = `${list.length} dari ${allProducts.length} product ditampilkan.`;

  if (list.length === 0) {
    productGrid.hidden = true;
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;
  productGrid.hidden = false;
  productGrid.innerHTML = '';

  list.forEach(product => {
    const { id, title, price, category, thumbnail, rating } = product;
    productGrid.innerHTML += `
      <article class="product-card">
        <div class="product-image-wrap">
          <img class="product-image" src="${thumbnail}" alt="${title}" loading="lazy">
        </div>

        <div class="product-body">
          <span class="product-category">${category}</span>
          <h3 class="product-title">${title}</h3>
          <div class="product-meta">
            <span class="product-price">$${price}</span>
            <span class="product-rating">⭐ ${rating}</span>
          </div>
          <button type="button" class="detail-btn" data-id="${id}">
            Lihat Detail
          </button>
        </div>
      </article>
    `;
  });
}

function showDetail(id) {
  const product = allProducts.find(item => item.id === id);
  if (!product) return;

  const { thumbnail, title, description, price, rating, stock, brand, category } = product;

  dialogContent.innerHTML = `
    <div class="dialog-detail">
      <img class="dialog-image" src="${thumbnail}" alt="${title}">
      <div class="dialog-copy">
        <span class="product-category">${category}</span>
        <h2>${title}</h2>
        <p>${description}</p>
        <div class="detail-list">
          <div class="detail-row"><span>Price</span><strong>$${price}</strong></div>
          <div class="detail-row"><span>Rating</span><strong>⭐ ${rating}</strong></div>
          <div class="detail-row"><span>Stock</span><strong>${stock}</strong></div>
          <div class="detail-row"><span>Brand</span><strong>${brand || '-'}</strong></div>
        </div>
      </div>
    </div>
  `;

  productDialog.showModal();
}

searchInput.addEventListener('input', applyFilters);
categorySelect.addEventListener('change', applyFilters);
sortSelect.addEventListener('change', applyFilters);

resetBtn.addEventListener('click', () => {
  searchInput.value = '';
  categorySelect.value = 'all';
  sortSelect.value = 'default';
  applyFilters();
});

productGrid.addEventListener('click', (event) => {
  const detailBtn = event.target.closest('.detail-btn');
  if (detailBtn) {
    showDetail(parseInt(detailBtn.dataset.id));
  }
});

dialogClose.addEventListener('click', () => {
  productDialog.close();
});

loadCategories();
loadProducts();