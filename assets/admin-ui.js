// AKM POS - Admin Management Modules (Products, Categories, Users, Stores)
window.money = window.money || (n => new Intl.NumberFormat('vi-VN').format(+n || 0) + ' ₫');
window.formatMoney = window.money;
const money = window.money;

// Product Columns Definition & Visibility Configuration
window.PRODUCT_COLUMNS = [
  { id: 'image', label: 'Ảnh', default: true },
  { id: 'name', label: 'Tên sản phẩm', default: true },
  { id: 'category', label: 'Nhóm hàng', default: true },
  { id: 'stock', label: 'Số lượng tồn kho', default: true },
  { id: 'cost_price', label: 'Giá vốn', default: true },
  { id: 'selling_price', label: 'Giá bán niêm yết', default: true },
  { id: 'discount', label: 'Giảm giá', default: false },
  { id: 'status', label: 'Trạng thái', default: true },
  { id: 'actions', label: 'Thao tác', default: true }
];

window.getProductColumnsConfig = function() {
  try {
    const saved = localStorage.getItem('akm_prod_columns');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        const config = {};
        window.PRODUCT_COLUMNS.forEach(c => {
          config[c.id] = parsed[c.id] !== undefined ? Boolean(parsed[c.id]) : c.default;
        });
        return config;
      }
    }
  } catch (e) {}
  const def = {};
  window.PRODUCT_COLUMNS.forEach(c => { def[c.id] = c.default; });
  return def;
};

window.saveProductColumnsConfig = function(config) {
  try {
    localStorage.setItem('akm_prod_columns', JSON.stringify(config));
    toast('Đã lưu cấu hình hiển thị cột sản phẩm!');
    if (S.page === 'products') {
      productRows($('#productSearch')?.value || '');
    }
  } catch (e) {
    toast('Lỗi khi lưu cấu hình', 'error');
  }
};

window.configureProductColumnsModal = function() {
  const current = window.getProductColumnsConfig();
  modal(`
    <div class="sheet-drag-handle"></div>
    <div class="modal-header">
      <h2>Tùy chỉnh hiển thị cột dữ liệu Sản phẩm</h2>
      <p>Chọn các cột thông tin bạn muốn hiển thị hoặc ẩn trên bảng danh sách sản phẩm</p>
    </div>
    <form id="prodColsModalForm" onsubmit="event.preventDefault(); applyProdColsFromModal();">
      <div class="grid grid-cols-2 sm:grid-cols-2 gap-2.5 my-4">
        ${window.PRODUCT_COLUMNS.map(c => `
          <label class="flex items-center gap-2.5 p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 cursor-pointer text-xs font-medium text-slate-700 select-none transition-colors">
            <input type="checkbox" name="${c.id}" ${current[c.id] ? 'checked' : ''} style="width:17px;height:17px;min-height:auto;cursor:pointer;">
            <span>${esc(c.label)}</span>
          </label>
        `).join('')}
      </div>
      <div class="flex items-center justify-between pt-3 border-t border-slate-100">
        <button type="button" class="btn ghost sm" onclick="resetDefaultProdCols()">Khôi phục mặc định</button>
        <div class="flex gap-2">
          <button type="button" class="btn secondary sm" onclick="closeModal()">Hủy</button>
          <button type="submit" class="btn primary sm">${icon('check', 14)} <span>Lưu thay đổi</span></button>
        </div>
      </div>
    </form>
  `);
};

window.applyProdColsFromModal = function() {
  const form = document.getElementById('prodColsModalForm');
  if (!form) return;
  const config = {};
  window.PRODUCT_COLUMNS.forEach(c => {
    config[c.id] = form.querySelector(`input[name="${c.id}"]`)?.checked || false;
  });
  window.saveProductColumnsConfig(config);
  closeModal();
};

window.resetDefaultProdCols = function() {
  const def = {};
  window.PRODUCT_COLUMNS.forEach(c => { def[c.id] = c.default; });
  window.saveProductColumnsConfig(def);
  closeModal();
};

window.previewImage = (url, title = 'Ảnh sản phẩm') => {
  if (!url) return;
  modal(`
    <div class="modal-header">
      <h2>${esc(title)}</h2>
    </div>
    <div class="p-4 grid place-items-center bg-slate-900/5 rounded-2xl border border-slate-200 overflow-hidden my-3">
      <img src="${esc(url)}" alt="${esc(title)}" class="max-h-[65vh] max-w-full rounded-xl object-contain shadow-md" onerror="this.onerror=null; this.src='assets/icon.svg';">
    </div>
    <div class="form-actions">
      <button class="btn primary" onclick="closeModal()">Đóng</button>
    </div>
  `);
};

const thumb = (p, n = '') => p 
  ? `<img class="w-16 h-16 min-w-[64px] rounded-xl object-cover border border-slate-200 cursor-pointer hover:scale-105 transition-transform shadow-sm bg-white" src="${esc(p)}" alt="${esc(n)}" loading="lazy" title="Bấm để phóng to ảnh" onclick="previewImage('${esc(p)}', '${esc(n)}')" onerror="this.onerror=null; this.style.display='none'; this.nextElementSibling.style.display='grid';"><div class="w-16 h-16 min-w-[64px] rounded-xl bg-slate-100 border border-slate-200 grid place-items-center text-slate-400 font-bold text-xs" style="display:none">◇</div>`
  : `<div class="w-16 h-16 min-w-[64px] rounded-xl bg-slate-100 border border-slate-200 grid place-items-center text-slate-400 font-bold text-xs">◇</div>`;

async function uploadImage(type, id, file) {
  if (!file || !file.size) return;
  const f = new FormData();
  f.append('entity_type', type);
  f.append('entity_id', id);
  f.append('image', file);
  await api('media.upload', { method: 'POST', body: f });
}

/* =========================================================================
   PRODUCTS MANAGEMENT
   ========================================================================= */

function nonAccent(str = '') {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase();
}

window.products = async function() {
  window._categories = await api('categories.list').catch(() => []);
  window._products = await api('products.list', { params: { all: 1, limit: 1000, store_id: S.store } });
  window._prodCategory = 0;
  window._prodSort = 'name_asc';

  const currentStoreName = S.store === 0
    ? '⭐ Tất cả hệ thống AKM'
    : (S.stores.find(s => s.id === S.store)?.name || 'Chi nhánh hiện tại');

  $('#content').innerHTML = head(
    'Quản lý Sản phẩm & Tồn kho',
    S.user.role === 'ADMIN' ? `
      <button class="btn secondary sm" onclick="exportStoreProductsCurrent()">${icon('download', 15)} <span>Tải Excel SP</span></button>
      <button class="btn secondary sm" onclick="importForm()">${icon('orders', 15)} <span>Import CSV</span></button>
      <button class="btn primary sm" onclick="productForm()">${icon('plus', 15)} <span>Thêm sản phẩm</span></button>
    ` : '',
    `Kho dữ liệu: <b class="text-teal-800">${esc(currentStoreName)}</b> · Tổng <b>${window._products.length}</b> sản phẩm (Nhấp vào dòng để xem & sửa)`
  ) + `
    <div class="pos-main-col">
      <!-- Category Horizontal Pills Bar for Products with Scroll Controls -->
      <div class="category-pills-wrapper">
        <button type="button" class="pills-scroll-btn prev" onclick="scrollPills('productCategoryPills', -220)" title="Cuộn trái">${icon('chevron-left', 16)}</button>
        <div class="category-pills" id="productCategoryPills">
          <button class="category-pill ${window._prodCategory === 0 ? 'active' : ''}" data-cat-id="0" onclick="selectProductCategory(0)">
            <span class="cat-pill-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg></span>
            <span>Tất cả (${window._products.length})</span>
          </button>
          ${window._categories.filter(c => +c.is_active).map(c => {
            const count = window._products.filter(p => +p.category_id === +c.id).length;
            return `
              <button class="category-pill ${window._prodCategory === c.id ? 'active' : ''}" data-cat-id="${c.id}" onclick="selectProductCategory(${c.id})">
                <span class="cat-pill-icon">${getCategoryIcon(c.name, 14)}</span>
                <span>${esc(c.name)} (${count})</span>
              </button>
            `;
          }).join('')}
        </div>
        <button type="button" class="pills-scroll-btn next" onclick="scrollPills('productCategoryPills', 220)" title="Cuộn phải">${icon('chevron-right', 16)}</button>
      </div>

      <!-- Search Box with Clear Button -->
      <div class="search-box">
        ${icon('search', 18)}
        <input id="productSearch" placeholder="Tìm theo tên sản phẩm, thương hiệu, nhóm hàng...">
        <button id="prodClearBtn" class="search-clear-btn hidden" onclick="clearProductSearch()">${icon('x', 14)}</button>
      </div>

      <!-- Sort Toolbar for Products -->
      <div class="pos-sort-bar" id="productSortBar">
        <span class="pos-sort-label">${icon('settings', 12)} Sắp xếp:</span>
        <button class="pos-sort-btn active" onclick="setProductSort('name_asc')">Tên A-Z</button>
        <button class="pos-sort-btn" onclick="setProductSort('name_desc')">Tên Z-A</button>
        <button class="pos-sort-btn" onclick="setProductSort('price_asc')">Giá bán: Thấp → Cao</button>
        <button class="pos-sort-btn" onclick="setProductSort('price_desc')">Giá bán: Cao → Thấp</button>
        <button class="pos-sort-btn" onclick="setProductSort('cost_desc')">Giá vốn: Cao → Thấp</button>
        <button class="pos-sort-btn" onclick="setProductSort('stock_desc')">Tồn: Nhiều → Ít</button>
      </div>

      <div id="productTable"></div>
    </div>
  `;

  if (typeof initPillsScroll === 'function') {
    initPillsScroll('productCategoryPills');
  }

  const sInput = $('#productSearch');
  sInput.oninput = debounce(e => {
    const val = e.target.value.trim();
    $('#prodClearBtn')?.classList.toggle('hidden', !val);
    productRows(val);
  }, 140);

  productRows('');
};

window.clearProductSearch = () => {
  const input = $('#productSearch');
  if (!input) return;
  input.value = '';
  $('#prodClearBtn')?.classList.add('hidden');
  input.focus();
  productRows('');
};

window.selectProductCategory = catId => {
  window._prodCategory = +catId;
  document.querySelectorAll('#productCategoryPills .category-pill').forEach(b => {
    b.classList.toggle('active', +b.dataset.catId === window._prodCategory);
  });
  productRows($('#productSearch')?.value || '');
};

window.setProductSort = sort => {
  window._prodSort = sort;
  document.querySelectorAll('#productSortBar .pos-sort-btn').forEach(b => b.classList.remove('active'));
  event?.target?.classList?.add('active');
  productRows($('#productSearch')?.value || '');
};

function productRows(q = '') {
  const qClean = q.trim().toLowerCase();
  const qNonAccent = nonAccent(qClean);

  let list = (window._products || []).filter(p => {
    const term = `${p.name || ''} ${p.brand || ''} ${p.category_name || ''}`.toLowerCase();
    const termNonAccent = nonAccent(term);
    const matchesQ = !qClean || term.includes(qClean) || termNonAccent.includes(qNonAccent);
    const matchesCat = !window._prodCategory || +p.category_id === window._prodCategory;
    return matchesQ && matchesCat;
  });

  const sort = window._prodSort || 'name_asc';
  list.sort((a, b) => {
    if (sort === 'name_asc') return (a.name || '').localeCompare(b.name || '', 'vi');
    if (sort === 'name_desc') return (b.name || '').localeCompare(a.name || '', 'vi');
    if (sort === 'price_asc') return (+a.selling_price || 0) - (+b.selling_price || 0);
    if (sort === 'price_desc') return (+b.selling_price || 0) - (+a.selling_price || 0);
    if (sort === 'cost_desc') return (+b.cost_price || 0) - (+a.cost_price || 0);
    if (sort === 'stock_desc') return (+b.quantity || 0) - (+a.quantity || 0);
    return 0;
  });

  if (!list.length) {
    $('#productTable').innerHTML = `
      <div class="card p-10 text-center text-slate-400">
        <div class="mb-2">${icon('products', 32, 'text-slate-300 inline-block')}</div>
        <p class="font-medium">Không tìm thấy sản phẩm nào phù hợp</p>
        <span class="text-xs text-slate-400">Thử đổi từ khóa hoặc nhóm hàng</span>
      </div>
    `;
    return;
  }

  $('#productTable').innerHTML = `
    <div class="product-list-container">
      ${list.map(p => {
        const imgUrl = p.image_path || p.image_url;
        const imgHtml = imgUrl
          ? `<img src="${esc(imgUrl)}" alt="${esc(p.name)}" class="prod-thumb-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"><div class="prod-thumb-fallback" style="display:none">${getCategoryIcon(p.category_name, 22)}</div>`
          : `<div class="prod-thumb-fallback">${getCategoryIcon(p.category_name, 22)}</div>`;

        const isInactive = +p.is_active === 0;
        const isAvail = +(p.quantity ?? 0) > 0;
        const stockHtml = isAvail
          ? `<span class="prod-stock-tag in-stock">${icon('inventory', 11)} Tồn: ${p.quantity}</span>`
          : `<span class="prod-stock-tag out-stock">${icon('alert', 11)} Hết hàng (0)</span>`;

        return `
          <div class="product-row-card ${isInactive ? 'inactive' : ''}" onclick="productForm(${p.id})" title="Nhấp để xem & chỉnh sửa chi tiết: ${esc(p.name)}">
            <!-- CỘT 1: ẢNH THUMBNAIL (20% width) -->
            <div class="prod-col-thumb">
              <div class="prod-thumb-box">
                ${imgHtml}
              </div>
            </div>

            <!-- CỘT 2: TÊN SẢN PHẨM (Dòng 1) & NHÓM HÀNG (Dòng 2) (40% width) -->
            <div class="prod-col-info">
              <!-- Dòng 1: Tên sản phẩm -->
              <div class="prod-name-line">
                <span class="prod-name-text" title="${esc(p.name)}">${esc(p.name)}</span>
                ${p.brand ? `<span class="prod-brand-badge">${esc(p.brand)}</span>` : ''}
                ${isInactive ? `<span class="badge danger text-[9.5px] py-0 px-1 ml-0.5">Ngừng bán</span>` : ''}
              </div>
              <!-- Dòng 2: Nhóm sản phẩm -->
              <div class="prod-cat-line">
                <span class="prod-cat-text">
                  ${getCategoryIcon(p.category_name, 12)}
                  <span>${esc(p.category_name || 'Chưa phân nhóm')}</span>
                </span>
              </div>
            </div>

            <!-- CỘT 3: GIÁ BÁN LẺ (Dòng 1) & SỐ LƯỢNG TỒN (Dòng 2) (40% width) -->
            <div class="prod-col-pricing">
              <!-- Dòng 1: Giá bán lẻ -->
              <div class="prod-price-line">
                <span class="prod-price-text">${money(p.selling_price)}</span>
              </div>
              <!-- Dòng 2: Số lượng tồn -->
              <div class="prod-stock-line">
                ${stockHtml}
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

window.productForm = async id => {
  const cs = await api('categories.list');
  const p = (window._products || []).find(x => +x.id === +id) || {};
  const activeStoreId = S.store || S.stores[0]?.id || 1;
  modal(`
    <div class="sheet-drag-handle"></div>
    <div class="modal-header">
      <h2>${id ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
      <p>Thông tin sản phẩm, thương hiệu, nhóm hàng, số lượng tồn kho, giá vốn & giá bán lẻ</p>
    </div>
    <form onsubmit="saveProduct2(event)">
      <input type="hidden" name="id" value="${id || ''}">
      
      <!-- 1. Thông tin định danh & Số lượng -->
      <div class="form-section">
        <div class="form-section-title">${icon('products', 14)} <span>1. Thông tin sản phẩm & Số lượng tồn kho</span></div>
        <div class="form-grid">
          <div class="full">
            <label>Tên sản phẩm (Bắt buộc)
              <input name="name" value="${esc(p.name || '')}" placeholder="vd: Cáp sạc Anker 60W Type-C sang Type-C" required autofocus>
            </label>
          </div>
          <div>
            <label>Số lượng tồn kho (Bắt buộc)
              <input name="quantity" type="number" min="0" value="${p.quantity !== undefined ? p.quantity : 10}" placeholder="vd: 10" required>
            </label>
          </div>
          <div>
            <label>Chi nhánh nhập kho
              <select name="store_id">
                ${(S.stores || []).map(s => `<option value="${s.id}" ${+s.id === +activeStoreId ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}
              </select>
            </label>
          </div>
          <div>
            <label>Thương hiệu / Hãng
              <input name="brand" value="${esc(p.brand || '')}" placeholder="vd: Hoco, Anker, Apple, Samsung...">
            </label>
          </div>
          <div>
            <label>Nhóm sản phẩm
              <select name="category_id">
                <option value="">-- Không chọn nhóm --</option>
                ${cs.filter(c => +c.is_active).map(c => `<option value="${c.id}" ${+p.category_id === +c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}
              </select>
            </label>
          </div>
        </div>
      </div>

      <!-- 2. Giá bán & Giá vốn -->
      <div class="form-section">
        <div class="form-section-title">${icon('pos', 14)} <span>2. Giá vốn, Giá bán niêm yết & Chính sách</span></div>
        <div class="form-grid">
          <div>
            <label>Giá vốn nhập hàng (VNĐ)
              <input name="cost_price" type="number" min="0" value="${p.cost_price || 0}">
            </label>
          </div>
          <div>
            <label>Giá bán niêm yết (VNĐ, Bắt buộc)
              <input name="selling_price" type="number" min="0" value="${p.selling_price || 0}" required>
            </label>
          </div>
          <div>
            <label>Áp dụng giảm giá
              <select name="allow_discount">
                <option value="1">Cho phép giảm giá</option>
                <option value="0" ${+p.allow_discount === 0 ? 'selected' : ''}>Không áp dụng</option>
              </select>
            </label>
          </div>
          <div>
            <label>Trạng thái kinh doanh
              <select name="is_active">
                <option value="1">Đang kinh doanh</option>
                <option value="0" ${+p.is_active === 0 ? 'selected' : ''}>Ngừng kinh doanh</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      <!-- 3. Hình ảnh & Mô tả -->
      <div class="form-section">
        <div class="form-section-title">${icon('camera', 14)} <span>3. Hình ảnh sản phẩm (Link CDN / Upload)</span></div>
        <div class="form-grid">
          <div class="full">
            <label>Đường dẫn hình ảnh trực tiếp (Image URL / CDN KiotViet)
              <input name="image_url" id="prodImageUrlInput" value="${esc(p.image_url || '')}" placeholder="https://cdn2-retail-images.kiotviet.vn/..." oninput="updateProdImagePreview(this.value)">
            </label>
          </div>
          <div class="full">
            <label>Hoặc Upload ảnh từ máy tính (JPG, PNG, WebP)
              <input name="image" type="file" accept="image/jpeg,image/png,image/webp" onchange="previewUploadedImage(this)">
            </label>
            <div class="img-preview-box mt-3" id="prodImgPreviewBox" style="${(p.image_path || p.image_url) ? '' : 'display:none;'}">
              <img id="prodPreviewImg" src="${esc(p.image_path || p.image_url || '')}" alt="Xem trước ảnh" class="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-sm" onerror="this.src='assets/icon.svg';">
              <div>
                <b class="text-xs text-slate-800" id="prodImgStatus">Ảnh sản phẩm hiện tại</b>
                <p class="text-[11px] text-slate-400">Hiển thị sắc nét trên cả màn hình POS và danh sách hàng hóa</p>
              </div>
            </div>
          </div>
          <div class="full">
            <label>Mô tả chi tiết sản phẩm
              <textarea name="description" rows="3" placeholder="Thông số kỹ thuật, quy cách đóng gói, bảo hành...">${esc(p.description || '')}</textarea>
            </label>
          </div>
        </div>
      </div>

      <div class="form-actions">
        ${id && S.user.role === 'ADMIN' ? `
          <button class="btn danger sm" type="button" onclick="closeModal(); deleteProduct(${id});" title="Xóa hoặc ngừng bán sản phẩm này">
            ${icon('trash', 14)} <span>Xóa / Ngừng bán</span>
          </button>
        ` : ''}
        <div class="flex-1"></div>
        <button class="btn secondary" type="button" onclick="closeModal()">Hủy</button>
        <button class="btn primary" type="submit">
          ${icon('check', 14)}
          <span>Lưu sản phẩm</span>
        </button>
      </div>
    </form>
  `);
};

window.updateProdImagePreview = url => {
  const box = $('#prodImgPreviewBox');
  const img = $('#prodPreviewImg');
  const status = $('#prodImgStatus');
  if (!url.trim()) {
    if (box) box.style.display = 'none';
    return;
  }
  if (box && img) {
    box.style.display = 'flex';
    img.src = url.trim();
    if (status) status.textContent = 'Link ảnh CDN trực tiếp';
  }
};

window.previewUploadedImage = input => {
  const file = input.files?.[0];
  if (!file) return;
  const box = $('#prodImgPreviewBox');
  const img = $('#prodPreviewImg');
  const status = $('#prodImgStatus');
  if (box && img) {
    box.style.display = 'flex';
    img.src = URL.createObjectURL(file);
    if (status) status.textContent = 'File ảnh mới chuẩn bị upload: ' + file.name;
  }
};

window.saveProduct2 = async e => {
  e.preventDefault();
  const f = new FormData(e.target);
  const img = f.get('image');
  const d = Object.fromEntries(f);
  delete d.image;
  try {
    const r = await api('products.save', { method: 'POST', body: d });
    if (img && img.size) {
      await uploadImage('PRODUCT', r.id, img);
    }
    closeModal();
    toast('Đã lưu thông tin sản phẩm thành công');
    if (typeof window.broadcastStockUpdated === 'function') {
      window.broadcastStockUpdated({ productId: r.id });
    }
    products();
  } catch (x) { toast(x.message, 'error'); }
};

window.deleteProduct = async id => {
  if (!confirm('Xác nhận ngừng bán sản phẩm này? Sản phẩm sẽ không xuất hiện trong quầy POS nữa.')) return;
  try {
    await api('products.delete', { method: 'POST', body: { id } });
    toast('Đã chuyển trạng thái sản phẩm sang ngừng bán');
    products();
  } catch (x) { toast(x.message, 'error'); }
};

window.openExportProductsStoreModal = function(defaultStoreId) {
  const stores = S.stores || [];
  const selId = defaultStoreId || (S.store > 0 ? S.store : (stores[0]?.id || 1));

  modal(`
    <div class="sheet-drag-handle"></div>
    <div class="modal-header">
      <div class="flex items-center gap-2">
        <h2>${icon('download', 20, 'text-teal-700')} <span>Tải file Excel Danh mục sản phẩm</span></h2>
      </div>
      <p>Hệ thống chỉ cho phép tải danh mục sản phẩm theo <b>từng cửa hàng cụ thể</b> để đảm bảo hiển thị đầy đủ thông tin tồn kho và sắp xếp theo nhóm hàng.</p>
    </div>

    <form onsubmit="downloadProductsExport(event)">
      <div class="form-section">
        <div class="form-section-title">${icon('stores', 14)} <span>1. Chọn chi nhánh / Cửa hàng cần tải</span></div>
        <div class="form-grid">
          <div class="full">
            <label class="font-bold text-slate-800">Cửa hàng tải danh mục (Bắt buộc)
              <select name="store_id" required autofocus>
                ${stores.map(s => `<option value="${s.id}" ${+s.id === +selId ? 'selected' : ''}>${esc(s.code)} · ${esc(s.name)}</option>`).join('')}
              </select>
            </label>
            <small class="text-slate-500 block mt-1">Dữ liệu tải về sẽ hiển thị đúng số lượng tồn, giá vốn, giá bán và lịch sử bán của cửa hàng này.</small>
          </div>
        </div>
      </div>

      <div class="form-section">
        <div class="form-section-title">${icon('settings', 14)} <span>2. Định dạng file tải về</span></div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <label class="flex items-start gap-2.5 p-3 bg-white border border-teal-500 rounded-xl cursor-pointer shadow-sm">
            <input type="radio" name="format" value="excel" checked style="width:16px;height:16px;min-height:auto;margin-top:2px;cursor:pointer;">
            <div>
              <b class="text-teal-950 block font-bold text-sm">📊 File Excel (.XLS / .XLSX)</b>
              <span class="text-slate-500 text-[11px] block mt-0.5">Sắp xếp theo nhóm hàng, có màu sắc, định dạng tiền tệ và dòng tổng cộng.</span>
            </div>
          </label>
          <label class="flex items-start gap-2.5 p-3 bg-white border border-slate-200 hover:border-slate-300 rounded-xl cursor-pointer">
            <input type="radio" name="format" value="csv" style="width:16px;height:16px;min-height:auto;margin-top:2px;cursor:pointer;">
            <div>
              <b class="text-slate-800 block font-bold text-sm">📄 File CSV (.CSV)</b>
              <span class="text-slate-500 text-[11px] block mt-0.5">Dữ liệu thô chuẩn UTF-8, tương thích nạp vào các phần mềm khác.</span>
            </div>
          </label>
        </div>
      </div>

      <div class="form-actions">
        <button class="btn secondary" type="button" onclick="closeModal()">Đóng</button>
        <button class="btn primary" type="submit">${icon('download', 16)} <span>Tải xuống file</span></button>
      </div>
    </form>
  `);
};

window.downloadProductsExport = function(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const storeId = fd.get('store_id');
  const format = fd.get('format') || 'excel';
  if (!storeId) {
    return toast('Vui lòng chọn cửa hàng cần tải dữ liệu', 'error');
  }
  window.open(`api.php?action=export.products&store_id=${storeId}&format=${format}`, '_blank');
  closeModal();
  toast('Đang tạo và tải file danh mục sản phẩm...');
};

window.exportStoreProductsCurrent = function() {
  if (S.store && S.store > 0) {
    window.open(`api.php?action=export.products&store_id=${S.store}&format=excel`, '_blank');
    toast('Đang tải file Excel danh mục sản phẩm cho chi nhánh hiện tại...');
  } else {
    window.openExportProductsStoreModal();
  }
};

window.importForm = () => {
  const stores = S.stores || [];
  modal(`
    <div class="modal-header">
      <h2>Import sản phẩm & Tồn kho từ file CSV / KiotViet</h2>
      <p>Hỗ trợ file xuất thực tế từ <b>KiotViet</b> (dấu chấm phẩy <code>;</code>, ảnh CDN, giá vốn, nhóm hàng, thương hiệu) và file Excel/CSV chuẩn.</p>
    </div>

    <!-- Quick Sync KiotViet 100 Products Button -->
    <div class="mb-5 p-4 rounded-2xl bg-teal-50/70 border border-teal-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div>
        <b class="text-sm text-teal-900 flex items-center gap-1.5">${icon('products', 16, 'text-teal-700')} Nạp nhanh 100 sản phẩm thực tế từ KiotViet</b>
        <p class="text-xs text-teal-700 mt-0.5">Tệp <code>Products_KV.csv</code> có sẵn trong hệ thống (2.439 tồn kho, 99 ảnh CDN, 6 nhóm hàng)</p>
      </div>
      <button class="btn primary sm whitespace-nowrap" onclick="syncKiotVietProducts(this)">⚡ Nạp ngay dữ liệu</button>
    </div>

    <form onsubmit="importCsv(event)">
      <div class="mb-4">
        <label class="block text-xs font-bold text-slate-700 mb-1">Chọn chi nhánh nhận số lượng tồn kho:
          <select name="store_id" class="w-full mt-1">
            ${stores.map(s => `<option value="${s.id}" ${s.id === S.store ? 'selected' : ''}>${esc(s.name)} (${esc(s.code)})</option>`).join('')}
          </select>
        </label>
      </div>

      <label class="p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 text-center cursor-pointer hover:border-teal-500 block">
        <span class="text-sm font-semibold text-slate-700 block mb-1">Chọn file CSV / Products_KV.csv từ máy tính</span>
        <span class="text-xs text-slate-400">Hệ thống tự động nhận diện cột tiếng Việt và định dạng số Việt Nam</span>
        <input name="file" type="file" accept=".csv,text/csv" required class="hidden" onchange="this.previousElementSibling.textContent = this.files[0]?.name || ''">
      </label>
      
      <div class="form-actions mt-4">
        <button class="btn secondary" type="button" onclick="closeModal()">Hủy</button>
        <button class="btn primary" type="submit">Bắt đầu Import</button>
      </div>
    </form>
  `);
};

window.syncKiotVietProducts = async btn => {
  btn.disabled = true;
  btn.textContent = 'Đang đồng bộ...';
  try {
    const r = await api('system.import_products_kv', { method: 'POST' });
    closeModal();
    toast(r.message || 'Đã đồng bộ thành công dữ liệu sản phẩm từ KiotViet');
    products();
  } catch (err) {
    btn.disabled = false;
    btn.textContent = '⚡ Nạp ngay dữ liệu';
    toast(err.message, 'error');
  }
};

window.importCsv = async e => {
  e.preventDefault();
  try {
    const r = await api('products.import', { method: 'POST', body: new FormData(e.target) });
    closeModal();
    toast(`Đã import thành công ${r.imported} dòng dữ liệu`);
    products();
  } catch (x) { toast(x.message, 'error'); }
};

/* =========================================================================
   CATEGORIES MANAGEMENT
   ========================================================================= */

window._catFilterStatus = 'all';
window._catSearchQ = '';
window._catSort = 'order_asc';

window.categories = async function() {
  const rows = await api('categories.list');
  window._categories = rows || [];
  window._catFilterStatus = 'all';
  window._catSearchQ = '';
  window._catSort = 'order_asc';

  const allCount = rows.length;
  const activeCount = rows.filter(c => +c.is_active).length;
  const inactiveCount = rows.filter(c => !+c.is_active).length;

  $('#content').innerHTML = head(
    'Quản lý Nhóm sản phẩm',
    `<button class="btn primary sm" onclick="categoryForm()">${icon('plus', 16)} <span>Thêm nhóm mới</span></button>`,
    `Tổng cộng <b>${allCount}</b> nhóm sản phẩm · Phân cấp danh mục (Điện thoại, Phụ kiện, Cường lực, Linh kiện...)`
  ) + `
    <div class="pos-main-col">
      <!-- Search Box with Clear Button -->
      <div class="search-box">
        ${icon('search', 18)}
        <input id="catSearch" placeholder="Tìm theo tên nhóm hàng, nhóm cha...">
        <button id="catClearBtn" class="search-clear-btn hidden" onclick="clearCatSearch()">${icon('x', 14)}</button>
      </div>

      <!-- Status Filter Bar for Categories -->
      <div class="pos-sort-bar" id="catStatusBar" style="margin-bottom:8px;">
        <span class="pos-sort-label">${icon('filter', 12)} Trạng thái:</span>
        <button class="pos-sort-btn active" onclick="setCatStatus('all', this)">Tất cả (${allCount})</button>
        <button class="pos-sort-btn" onclick="setCatStatus('active', this)">Đang dùng (${activeCount})</button>
        <button class="pos-sort-btn" onclick="setCatStatus('inactive', this)">Đang ẩn (${inactiveCount})</button>
      </div>

      <!-- Sort Toolbar for Categories -->
      <div class="pos-sort-bar" id="catSortBar">
        <span class="pos-sort-label">${icon('settings', 12)} Sắp xếp:</span>
        <button class="pos-sort-btn active" onclick="setCatSort('order_asc', this)">Thứ tự hiển thị</button>
        <button class="pos-sort-btn" onclick="setCatSort('name_asc', this)">Tên A-Z</button>
        <button class="pos-sort-btn" onclick="setCatSort('name_desc', this)">Tên Z-A</button>
      </div>

      <div id="catListTable"></div>
    </div>
  `;

  const sInput = $('#catSearch');
  if (sInput) {
    sInput.oninput = debounce(e => {
      const val = e.target.value.trim();
      $('#catClearBtn')?.classList.toggle('hidden', !val);
      window._catSearchQ = val;
      renderCatRows(val);
    }, 140);
  }

  renderCatRows('');
};

window.clearCatSearch = () => {
  const input = $('#catSearch');
  if (!input) return;
  input.value = '';
  $('#catClearBtn')?.classList.add('hidden');
  window._catSearchQ = '';
  input.focus();
  renderCatRows('');
};

window.setCatStatus = (status, btn) => {
  window._catFilterStatus = status;
  document.querySelectorAll('#catStatusBar .pos-sort-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderCatRows($('#catSearch')?.value || '');
};

window.setCatSort = (sort, btn) => {
  window._catSort = sort;
  document.querySelectorAll('#catSortBar .pos-sort-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderCatRows($('#catSearch')?.value || '');
};

function renderCatRows(q = '') {
  const rows = window._categories || [];
  const names = Object.fromEntries(rows.map(x => [x.id, x.name]));
  const qClean = q.trim().toLowerCase();
  const qNonAccent = nonAccent(qClean);
  const statusFilter = window._catFilterStatus || 'all';

  let list = rows.filter(c => {
    const parentName = names[c.parent_id] || '';
    const term = `${c.name || ''} ${parentName}`.toLowerCase();
    const termNonAccent = nonAccent(term);
    const matchesQ = !qClean || term.includes(qClean) || termNonAccent.includes(qNonAccent);

    let matchesStatus = true;
    if (statusFilter === 'active') matchesStatus = +c.is_active === 1;
    else if (statusFilter === 'inactive') matchesStatus = +c.is_active === 0;

    return matchesQ && matchesStatus;
  });

  const sort = window._catSort || 'order_asc';
  list.sort((a, b) => {
    if (sort === 'order_asc') return (+a.sort_order || 0) - (+b.sort_order || 0);
    if (sort === 'name_asc') return (a.name || '').localeCompare(b.name || '', 'vi');
    if (sort === 'name_desc') return (b.name || '').localeCompare(a.name || '', 'vi');
    return 0;
  });

  if (!list.length) {
    $('#catListTable').innerHTML = `
      <div class="card p-10 text-center text-slate-400">
        <div class="mb-2">${icon('categories', 32, 'text-slate-300 inline-block')}</div>
        <p class="font-medium text-sm">Không tìm thấy nhóm hàng nào</p>
        <small class="text-xs text-slate-400">Thử tìm kiếm với từ khóa khác hoặc chuyển bộ lọc</small>
      </div>
    `;
    return;
  }

  $('#catListTable').innerHTML = `
    <div class="product-list-container">
      ${list.map(c => {
        const isInactive = !+c.is_active;
        const imgUrl = c.image_path;
        const imgHtml = imgUrl
          ? `<img src="${esc(imgUrl)}" alt="${esc(c.name)}" class="prod-thumb-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"><div class="prod-thumb-fallback" style="display:none">${getCategoryIcon(c.name, 22)}</div>`
          : `<div class="prod-thumb-fallback">${getCategoryIcon(c.name, 22)}</div>`;

        return `
          <div class="product-row-card ${isInactive ? 'inactive' : ''}" onclick="categoryForm(${c.id})" title="Nhấp chỉnh sửa nhóm: ${esc(c.name)}">
            <!-- CỘT 1: ICON / THUMBNAIL (20% width) -->
            <div class="prod-col-thumb">
              <div class="prod-thumb-box" style="background:#f0fdfa;border-color:#ccfbf1;">
                ${imgHtml}
              </div>
            </div>

            <!-- CỘT 2: TÊN NHÓM & NHÓM CHA (40% width) -->
            <div class="prod-col-info">
              <div class="prod-name-line">
                <span class="prod-name-text">
                  ${esc(c.name)}
                </span>
                ${isInactive ? `<span class="badge danger text-[9.5px] py-0 px-1 ml-0.5">Ẩn</span>` : ''}
              </div>
              <div class="prod-cat-line">
                <span class="prod-cat-text">
                  ${icon('categories', 12)}
                  <span>${esc(names[c.parent_id] || 'Nhóm gốc')}</span>
                </span>
                <span class="prod-sku-sub">· Thứ tự: ${c.sort_order}</span>
              </div>
            </div>

            <!-- CỘT 3: TRẠNG THÁI & NÚT SỬA/XÓA (40% width) -->
            <div class="prod-col-pricing">
              <div class="prod-price-line">
                ${+c.is_active ? `<span class="badge success" style="font-size:10px;padding:2px 6px;">Đang dùng</span>` : `<span class="badge danger" style="font-size:10px;padding:2px 6px;">Đang ẩn</span>`}
              </div>
              <div class="prod-stock-line" onclick="event.stopPropagation()">
                <div class="flex gap-1.5 mt-0.5">
                  <button type="button" class="btn secondary sm" style="padding:2px 7px;font-size:10.5px;" onclick="categoryForm(${c.id})">Sửa</button>
                  <button type="button" class="btn danger sm" style="padding:2px 7px;font-size:10.5px;" onclick="deleteCategory(${c.id})">Xóa</button>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

window.categoryForm = id => {
  const rows = window._categories || [];
  const c = rows.find(x => +x.id === +id) || {};
  modal(`
    <div class="sheet-drag-handle"></div>
    <div class="modal-header">
      <h2>${id ? 'Chỉnh sửa nhóm hàng' : 'Thêm nhóm hàng mới'}</h2>
      <p>Cấu hình cây phân cấp danh mục hàng hóa (Điện thoại, Phụ kiện, Cường lực...)</p>
    </div>
    <form onsubmit="saveCategory2(event)">
      <input type="hidden" name="id" value="${id || ''}">

      <div class="form-section">
        <div class="form-section-title">${icon('categories', 14)} <span>1. Thông tin phân loại nhóm</span></div>
        <div class="form-grid">
          <div class="full">
            <label>Tên nhóm sản phẩm (Bắt buộc)
              <input name="name" value="${esc(c.name || '')}" placeholder="vd: Cường lực & Ốp lưng" required autofocus>
            </label>
          </div>
          <div>
            <label>Nhóm cha (Cấp trên)
              <select name="parent_id">
                <option value="">-- Là nhóm danh mục gốc --</option>
                ${rows.filter(x => +x.id !== +id).map(x => `<option value="${x.id}" ${+c.parent_id === +x.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}
              </select>
            </label>
          </div>
          <div>
            <label>Thứ tự hiển thị
              <input name="sort_order" type="number" value="${c.sort_order || 0}">
            </label>
          </div>
          <div class="full">
            <label>Trạng thái kích hoạt
              <select name="is_active">
                <option value="1">Đang kích hoạt</option>
                <option value="0" ${+c.is_active === 0 ? 'selected' : ''}>Tạm ẩn</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      <div class="form-section">
        <div class="form-section-title">${icon('camera', 14)} <span>2. Ảnh đại diện nhóm hàng</span></div>
        <div class="form-grid">
          <div class="full">
            <label>Ảnh biểu trưng (JPG, PNG, WebP)
              <input name="image" type="file" accept="image/jpeg,image/png,image/webp">
            </label>
            ${c.image_path ? `
              <div class="img-preview-box">
                <img src="${esc(c.image_path)}" alt="${esc(c.name)}">
                <div>
                  <b class="text-xs text-slate-800">Ảnh hiện tại</b>
                  <p class="text-[11px] text-slate-400">Chọn file mới nếu muốn cập nhật</p>
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button class="btn secondary" type="button" onclick="closeModal()">Hủy</button>
        <button class="btn primary" type="submit">Lưu nhóm hàng</button>
      </div>
    </form>
  `);
};

window.saveCategory2 = async e => {
  e.preventDefault();
  const f = new FormData(e.target);
  const img = f.get('image');
  const d = Object.fromEntries(f);
  delete d.image;
  try {
    const r = await api('categories.save', { method: 'POST', body: d });
    if (img && img.size) {
      await uploadImage('CATEGORY', r.id, img);
    }
    closeModal();
    toast('Đã lưu nhóm sản phẩm');
    categories();
  } catch (x) { toast(x.message, 'error'); }
};

window.deleteCategory = async id => {
  if (!confirm('Xóa nhóm sản phẩm này? Nhóm đang có sản phẩm hoặc nhóm con sẽ không được xóa.')) return;
  try {
    await api('categories.delete', { method: 'POST', body: { id } });
    toast('Đã xóa nhóm sản phẩm');
    categories();
  } catch (x) { toast(x.message, 'error'); }
};

/* =========================================================================
   USERS MANAGEMENT (Phân quyền chi tiết & Chi nhánh)
   ========================================================================= */

const permissionGroups = [
  {
    group: 'Bán hàng POS & Đơn hàng',
    icon: 'pos',
    permissions: [
      ['pos.access', 'Bán hàng tại quầy POS'],
      ['pos.discount', 'Chiết khấu / Giảm giá đơn hàng'],
      ['pos.cancel_order', 'Hủy đơn hàng / Trả hóa đơn'],
      ['orders.view', 'Xem danh sách & Chi tiết hóa đơn'],
      ['orders.export', 'Xuất dữ liệu hóa đơn Excel/CSV']
    ]
  },
  {
    group: 'Sản phẩm & Danh mục',
    icon: 'products',
    permissions: [
      ['products.view', 'Xem danh sách sản phẩm & giá bán'],
      ['products.create_edit', 'Thêm mới & Chỉnh sửa sản phẩm / giá vốn'],
      ['products.delete', 'Xóa sản phẩm khỏi danh mục'],
      ['products.import_export', 'Import / Export dữ liệu sản phẩm']
    ]
  },
  {
    group: 'Quản lý Kho & Điều chuyển',
    icon: 'inventory',
    permissions: [
      ['inventory.view', 'Xem số lượng tồn kho từng chi nhánh'],
      ['inventory.adjust', 'Kiểm kê & Điều chỉnh tồn kho'],
      ['transfers.create', 'Tạo phiếu chuyển kho'],
      ['transfers.approve', 'Duyệt & Nhận hàng chuyển kho']
    ]
  },
  {
    group: 'Đổi trả & Sửa chữa bảo hành',
    icon: 'repairs',
    permissions: [
      ['returns.create', 'Tiếp nhận đổi / trả hàng & hoàn tiền'],
      ['repairs.view', 'Xem danh sách phiếu sửa chữa'],
      ['repairs.manage', 'Tiếp nhận, báo giá & hoàn tất sửa chữa']
    ]
  },
  {
    group: 'Báo cáo, Nhật ký & Cài đặt',
    icon: 'reports',
    permissions: [
      ['reports.view', 'Xem báo cáo doanh thu & lợi nhuận'],
      ['reports.export', 'Xuất báo cáo tài chính / doanh số'],
      ['audit.view', 'Xem nhật ký hoạt động hệ thống'],
      ['settings.manage', 'Cấu hình chi nhánh & hệ thống']
    ]
  }
];

window.applyPermissionPreset = function(presetKey) {
  const checkboxes = document.querySelectorAll('input[name^="p_"]');
  if (presetKey === 'all') {
    checkboxes.forEach(cb => cb.checked = true);
    return;
  }
  if (presetKey === 'none') {
    checkboxes.forEach(cb => cb.checked = false);
    return;
  }
  checkboxes.forEach(cb => cb.checked = false);
  const presets = {
    'cashier': ['pos.access', 'orders.view', 'products.view', 'returns.create', 'repairs.view'],
    'stock': ['products.view', 'products.create_edit', 'inventory.view', 'inventory.adjust', 'transfers.create', 'transfers.approve'],
    'technician': ['products.view', 'inventory.view', 'repairs.view', 'repairs.manage']
  };
  (presets[presetKey] || []).forEach(k => {
    const cb = document.querySelector(`input[name="p_${k}"]`);
    if (cb) cb.checked = true;
  });
};

window.users = async function() {
  window._users = await api('users.list');
  $('#content').innerHTML = head(
    'Quản lý Nhân viên & Tài khoản',
    `<button class="btn primary sm" onclick="userForm()">${icon('plus', 16)} <span>Thêm nhân viên</span></button>`,
    'Tài khoản đăng nhập, phân quyền chi tiết và chỉ định chi nhánh làm việc'
  ) + table(
    ['Họ và tên', 'Email đăng nhập', 'Số điện thoại', 'Vai trò', 'Chi nhánh được phép', 'Trạng thái', 'Thao tác'],
    window._users.map(u => [
      `<b>${esc(u.full_name)}</b>`,
      esc(u.email),
      esc(u.phone || '—'),
      `<span class="badge ${u.role === 'ADMIN' ? 'warning' : 'info'}">${u.role}</span>`,
      esc(u.store_ids || 'Tất cả chi nhánh'),
      +u.is_active ? '<span class="badge success">Hoạt động</span>' : '<span class="badge danger">Đã khóa</span>',
      `
        <div class="flex items-center gap-2">
          <button class="btn secondary sm" onclick="userForm(${u.id})">Sửa</button>
          ${+u.is_active && u.id !== S.user.id ? `<button class="btn danger sm" onclick="deleteUser(${u.id})">Khóa</button>` : ''}
        </div>
      `
    ])
  );
};

window.userForm = id => {
  const u = (window._users || []).find(x => +x.id === +id) || {};
  const assignedStores = String(u.store_ids || '').split(',').map(s => s.trim());
  const userPerms = typeof u.permissions === 'string' ? JSON.parse(u.permissions || '{}') : (u.permissions || {});

  modal(`
    <div class="modal-header">
      <h2>${id ? 'Chỉnh sửa tài khoản nhân viên' : 'Thêm tài khoản nhân viên mới'}</h2>
      <p>Cấp quyền đăng nhập, thiết lập chi nhánh và phân quyền chức năng chi tiết</p>
    </div>
    <form onsubmit="saveUser2(event)">
      <input type="hidden" name="id" value="${id || ''}">
      
      <!-- 1. Thông tin đăng nhập -->
      <div class="form-section">
        <div class="form-section-title">${icon('users', 14)} <span>1. Thông tin định danh & Tài khoản</span></div>
        <div class="form-grid">
          <div>
            <label>Họ và tên nhân viên (Bắt buộc)
              <input name="full_name" value="${esc(u.full_name || '')}" placeholder="Nguyễn Văn A" required autofocus>
            </label>
          </div>
          <div>
            <label>Email đăng nhập (Bắt buộc)
              <input name="email" type="email" value="${esc(u.email || '')}" placeholder="nhanvien@anhkhoamobile.com" required>
            </label>
          </div>
          <div>
            <label>Số điện thoại liên hệ
              <input name="phone" value="${esc(u.phone || '')}" placeholder="0901234567">
            </label>
          </div>
          <div>
            <label>Vai trò hệ thống
              <select name="role">
                <option value="EMPLOYEE" ${u.role === 'EMPLOYEE' ? 'selected' : ''}>Nhân viên (Employee)</option>
                <option value="ADMIN" ${u.role === 'ADMIN' ? 'selected' : ''}>Quản trị viên (Admin)</option>
              </select>
            </label>
          </div>
          <div>
            <label>Mật khẩu ${id ? '<small>(Để trống nếu giữ nguyên)</small>' : '(Bắt buộc)'}
              <input name="password" type="password" minlength="8" placeholder="Tối thiểu 8 ký tự" ${id ? '' : 'required'}>
            </label>
          </div>
          <div>
            <label>Trạng thái tài khoản
              <select name="is_active">
                <option value="1">Đang hoạt động</option>
                <option value="0" ${+u.is_active === 0 ? 'selected' : ''}>Tạm khóa</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      <!-- 2. Chi nhánh phụ trách -->
      <div class="form-section">
        <div class="form-section-title">${icon('stores', 14)} <span>2. Chi nhánh được phép thao tác</span></div>
        <label class="text-xs text-slate-500 mb-2 block">Giữ Ctrl (Windows) hoặc Cmd (Mac) để chọn một hoặc nhiều chi nhánh:</label>
        <select name="store_ids" multiple size="4" style="height:auto; min-height:85px; padding:6px 10px;">
          ${S.stores.map(s => `
            <option value="${s.id}" ${assignedStores.includes(String(s.id)) ? 'selected' : ''}>${esc(s.code)} · ${esc(s.name)}</option>
          `).join('')}
        </select>
      </div>

      <!-- 3. Phân quyền chức năng chi tiết -->
      <div class="form-section">
        <div class="form-section-title">${icon('shield', 14)} <span>3. Bảng phân quyền chức năng chi tiết</span></div>
        
        <!-- Quick Presets Toolbar -->
        <div class="perm-preset-bar">
          <span class="text-xs font-semibold text-slate-600 mr-1">Gán quyền nhanh:</span>
          <button type="button" class="perm-preset-btn" onclick="applyPermissionPreset('cashier')">🏷️ Thu ngân POS</button>
          <button type="button" class="perm-preset-btn" onclick="applyPermissionPreset('stock')">📦 Thủ kho</button>
          <button type="button" class="perm-preset-btn" onclick="applyPermissionPreset('technician')">🛠️ Kỹ thuật viên</button>
          <button type="button" class="perm-preset-btn text-teal-700 font-bold" onclick="applyPermissionPreset('all')">✓ Chọn tất cả</button>
          <button type="button" class="perm-preset-btn text-rose-600" onclick="applyPermissionPreset('none')">✕ Bỏ chọn</button>
        </div>

        <div class="space-y-3">
          ${permissionGroups.map(g => `
            <div class="perm-group-card">
              <div class="perm-group-header">
                <div class="perm-group-title">${icon(g.icon, 14)} <span>${esc(g.group)}</span></div>
                <button type="button" class="text-xs text-teal-700 font-medium hover:underline" onclick="this.closest('.perm-group-card').querySelectorAll('input[type=checkbox]').forEach(cb => cb.checked = !cb.checked)">Đảo chọn</button>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                ${g.permissions.map(([k, label]) => {
                  const isChecked = Boolean(
                    userPerms[k] ||
                    (k === 'pos.access' && userPerms['sales']) ||
                    (k === 'orders.view' && userPerms['orders']) ||
                    (k === 'inventory.view' && userPerms['inventory']) ||
                    (k === 'transfers.create' && userPerms['transfers']) ||
                    (k === 'returns.create' && userPerms['returns']) ||
                    (k === 'repairs.manage' && userPerms['repairs']) ||
                    (k === 'reports.view' && userPerms['reports'])
                  );
                  return `
                    <label class="flex items-center gap-2 p-2 bg-slate-50/70 border border-slate-200 rounded-lg cursor-pointer hover:border-teal-500 hover:bg-teal-50/30 transition-all font-medium">
                      <input type="checkbox" name="p_${k}" ${isChecked ? 'checked' : ''} style="width:auto;min-height:auto;">
                      <span>${label}</span>
                    </label>
                  `;
                }).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="form-actions">
        <button class="btn secondary" type="button" onclick="closeModal()">Hủy</button>
        <button class="btn primary" type="submit">Lưu tài khoản nhân viên</button>
      </div>
    </form>
  `);
};

window.saveUser2 = async e => {
  e.preventDefault();
  const f = new FormData(e.target);
  const d = Object.fromEntries(f);
  d.store_ids = f.getAll('store_ids');
  const allPermKeys = permissionGroups.flatMap(g => g.permissions.map(([k]) => k));
  d.permissions = Object.fromEntries(allPermKeys.map(k => [k, f.has('p_' + k)]));
  allPermKeys.forEach(k => delete d['p_' + k]);
  try {
    await api('users.save', { method: 'POST', body: d });
    closeModal();
    toast('Đã lưu tài khoản nhân viên');
    users();
  } catch (x) { toast(x.message, 'error'); }
};

window.deleteUser = async id => {
  if (!confirm('Khóa tài khoản nhân viên này? Tài khoản sẽ không thể đăng nhập.')) return;
  try {
    await api('users.delete', { method: 'POST', body: { id } });
    toast('Đã khóa tài khoản thành công');
    users();
  } catch (x) { toast(x.message, 'error'); }
};

/* =========================================================================
   STORES MANAGEMENT (Chi nhánh cửa hàng)
   ========================================================================= */

window.stores = async function() {
  window._stores = await api('stores.list');
  $('#content').innerHTML = head(
    'Quản lý Chi nhánh Cửa hàng',
    `<button class="btn primary sm" onclick="storeForm()">${icon('plus', 16)} <span>Thêm chi nhánh</span></button>`,
    'Danh sách cửa hàng, kho hàng trực thuộc chuỗi bán lẻ AKM Mobile'
  ) + table(
    ['Mã chi nhánh', 'Tên cửa hàng', 'Địa chỉ', 'Hotline', 'Trạng thái', 'Thao tác'],
    window._stores.map(s => [
      `<b class="font-mono text-teal-800">${esc(s.code)}</b>`,
      `<b>${esc(s.name)}</b>`,
      esc(s.address || '—'),
      esc(s.phone || '—'),
      +s.is_active ? '<span class="badge success">Hoạt động</span>' : '<span class="badge danger">Tạm ngừng</span>',
      `
        <div class="flex items-center gap-2">
          <button class="btn secondary sm" onclick="storeForm(${s.id})">Sửa</button>
          ${+s.is_active ? `<button class="btn danger sm" onclick="deleteStore(${s.id})">Ngừng</button>` : ''}
        </div>
      `
    ])
  );
};

window.storeForm = id => {
  const s = (window._stores || []).find(x => +x.id === +id) || {};
  modal(`
    <div class="modal-header">
      <h2>${id ? 'Chỉnh sửa chi nhánh' : 'Thêm chi nhánh cửa hàng mới'}</h2>
      <p>Thông tin mã kho, hotline và địa điểm cửa hàng</p>
    </div>
    <form onsubmit="saveStore2(event)">
      <input type="hidden" name="id" value="${id || ''}">
      
      <div class="form-section">
        <div class="form-section-title">${icon('stores', 14)} <span>Thông tin chi nhánh & Kho hàng</span></div>
        <div class="form-grid">
          <div>
            <label>Mã chi nhánh (Bắt buộc, viết liền)
              <input name="code" value="${esc(s.code || '')}" placeholder="vd: AKM05" required autofocus>
            </label>
          </div>
          <div>
            <label>Tên chi nhánh cửa hàng (Bắt buộc)
              <input name="name" value="${esc(s.name || '')}" placeholder="vd: AKM Mobile - Chi nhánh Tân Bình" required>
            </label>
          </div>
          <div class="full">
            <label>Địa chỉ cửa hàng
              <input name="address" value="${esc(s.address || '')}" placeholder="vd: 45 Hoàng Hoa Thám, P.13, Q.Tân Bình, TP.HCM">
            </label>
          </div>
          <div>
            <label>Số điện thoại hotline
              <input name="phone" value="${esc(s.phone || '')}" placeholder="028 7300 1005">
            </label>
          </div>
          <div>
            <label>Trạng thái hoạt động
              <select name="is_active">
                <option value="1">Đang hoạt động</option>
                <option value="0" ${+s.is_active === 0 ? 'selected' : ''}>Tạm ngừng</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button class="btn secondary" type="button" onclick="closeModal()">Hủy</button>
        <button class="btn primary" type="submit">Lưu chi nhánh</button>
      </div>
    </form>
  `);
};

window.saveStore2 = async e => {
  e.preventDefault();
  try {
    await api('stores.save', { method: 'POST', body: Object.fromEntries(new FormData(e.target)) });
    closeModal();
    toast('Đã lưu thông tin chi nhánh');
    location.reload();
  } catch (x) { toast(x.message, 'error'); }
};

window.deleteStore = async id => {
  if (!confirm('Tạm ngừng hoạt động chi nhánh này?')) return;
  try {
    await api('stores.delete', { method: 'POST', body: { id } });
    toast('Đã chuyển chi nhánh sang tạm ngừng');
    stores();
  } catch (x) { toast(x.message, 'error'); }
};

// ==========================================
// SAO LƯU & PHỤC HỒI HỆ THỐNG & CSDL (BACKUP & RESTORE)
// ==========================================
async function backupView() {
  const data = await api('system.backup.list');
  const backups = data.backups || [];

  $('#content').innerHTML = `
    ${head('Sao lưu & Phục hồi Hệ thống', `
      <button class="btn secondary sm" onclick="uploadBackupModal()">
        ${icon('upload', 15)} <span>Tải lên sao lưu (.zip / .sql)</span>
      </button>
      <button class="btn secondary sm" onclick="createBackup('SQL')">
        ${icon('database', 15)} <span>Snapshot CSDL (.sql)</span>
      </button>
      <button class="btn primary sm" onclick="createBackup('FULL')">
        ${icon('plus', 15)} <span>Tạo Full Backup (.zip)</span>
      </button>
    `, 'Sao lưu toàn diện cấu trúc cơ sở dữ liệu, các bảng giao dịch và kho lưu trữ tệp đính kèm')}

    <div class="grid-kpi modern">
      <div class="kpi-card accent-teal">
        <div class="kpi-icon-wrap">${icon('database', 20)}</div>
        <div class="kpi-data">
          <small>Tổng số bản sao lưu</small>
          <strong>${data.count || 0} bản</strong>
          <em>Lưu trữ tại thư mục backups/</em>
        </div>
      </div>
      <div class="kpi-card accent-blue">
        <div class="kpi-icon-wrap">${icon('clock', 20)}</div>
        <div class="kpi-data">
          <small>Bản sao lưu gần nhất</small>
          <strong>${data.latest ? data.latest.created_at_formatted.split(' ')[0] : 'Chưa có'}</strong>
          <em>${data.latest ? data.latest.created_at_formatted.split(' ')[1] : 'Chưa có bản ghi'}</em>
        </div>
      </div>
      <div class="kpi-card accent-violet">
        <div class="kpi-icon-wrap">${icon('backup', 20)}</div>
        <div class="kpi-data">
          <small>Tổng dung lượng lưu trữ</small>
          <strong>${data.total_size_formatted || '0 KB'}</strong>
          <em>Bao gồm Zip và SQL Dump</em>
        </div>
      </div>
      <div class="kpi-card accent-orange">
        <div class="kpi-icon-wrap">${icon('refresh', 20)}</div>
        <div class="kpi-data">
          <small>Tự động sao lưu Cron</small>
          <strong>03:00 Sáng</strong>
          <em>Tự động dọn dẹp giữ 7 bản mới</em>
        </div>
      </div>
    </div>

    <div class="card p-4 mb-4" style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:14px;">
      <div style="display:flex; align-items:flex-start; gap:12px;">
        <div style="color:#16a34a; margin-top:2px;">${icon('check', 18)}</div>
        <div style="font-size:12px; color:#166534; line-height:1.5;">
          <b>Cơ chế Sao lưu Kép Toàn diện:</b> Bản sao lưu <b>FULL (.zip)</b> bao gồm toàn bộ database SQL và thư mục ảnh tải lên <code>uploads/</code>. Bản sao lưu <b>CSDL (.sql)</b> chứa thuần schema và bảng dữ liệu. Bạn có thể tải về lưu trữ an toàn hoặc phục hồi lại hệ thống bất cứ lúc nào.
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header" style="padding:16px 20px; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h2 style="font-size:14px; font-weight:500; color:#0f172a; margin:0;">Danh sách Bản sao lưu Hệ thống</h2>
          <small style="color:#64748b; font-size:11.5px;">Các tệp .zip và .sql lưu trên server</small>
        </div>
        <button class="btn secondary sm" onclick="backupView()">
          ${icon('refresh', 14)} <span>Làm mới</span>
        </button>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Tên tệp sao lưu</th>
              <th>Loại bản sao</th>
              <th>Dung lượng</th>
              <th>Thời gian tạo</th>
              <th style="text-align:right;">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            ${backups.length ? backups.map(b => `
              <tr>
                <td>
                  <div style="display:flex; align-items:center; gap:8px;">
                    <span style="color:#0f766e;">${b.type === 'FULL' ? icon('backup', 16) : icon('database', 15)}</span>
                    <b style="font-family:monospace; font-size:12px; color:#0f172a;">${esc(b.filename)}</b>
                  </div>
                </td>
                <td>
                  <span class="badge ${b.type === 'FULL' ? 'success' : 'info'} font-bold">
                    ${b.type === 'FULL' ? 'Full System (.zip)' : 'Database Dump (.sql)'}
                  </span>
                </td>
                <td>
                  <span class="badge" style="background:#f1f5f9; color:#475569; font-weight:500;">${b.size_formatted}</span>
                </td>
                <td>${b.created_at_formatted}</td>
                <td style="text-align:right;">
                  <div style="display:inline-flex; gap:6px;">
                    <a class="btn secondary sm" href="api.php?action=system.backup.download&file=${encodeURIComponent(b.filename)}" title="Tải về máy tính">
                      ${icon('download', 14)} <span>Tải về</span>
                    </a>
                    <button class="btn warning sm" onclick="restoreBackupConfirm('${esc(b.filename)}')" title="Phục hồi hệ thống">
                      ${icon('refresh', 14)} <span>Phục hồi</span>
                    </button>
                    <button class="btn danger sm" onclick="deleteBackupConfirm('${esc(b.filename)}')" title="Xóa bản sao lưu">
                      ${icon('trash', 14)}
                    </button>
                  </div>
                </td>
              </tr>
            `).join('') : `
              <tr>
                <td colspan="5" style="text-align:center; padding:36px; color:#94a3b8;">
                  ${icon('database', 32)}
                  <p style="margin-top:8px;">Chưa có bản sao lưu nào. Hãy nhấn "Tạo Full Backup (.zip)" để tạo bản đầu tiên.</p>
                </td>
              </tr>
            `}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

window.createBackup = async (type = 'FULL') => {
  loading(true);
  try {
    const res = await api('system.backup.create', { method: 'POST', body: { type } });
    toast(res.message || 'Đã tạo bản sao lưu thành công');
    await backupView();
  } catch (err) {
    toast(err.message, 'error');
  } finally {
    loading(false);
  }
};

window.restoreBackupConfirm = (filename) => {
  const isZip = filename.endsWith('.zip');
  modal(`
    <div class="sheet-drag-handle"></div>
    <div class="modal-header">
      <h2 style="color:#b91c1c; display:flex; align-items:center; gap:8px;">
        ${icon('x', 20)} Xác nhận Phục hồi Dữ liệu
      </h2>
      <p>Cảnh báo ghi đè toàn bộ ${isZip ? 'cơ sở dữ liệu và tệp đính kèm' : 'cơ sở dữ liệu'} hiện tại</p>
    </div>

    <div class="card p-4 mb-4" style="background:#fef2f2; border:1px solid #fecaca; border-radius:12px;">
      <p style="font-size:12.5px; color:#991b1b; line-height:1.5; margin:0;">
        <b>CẢNH BÁO QUAN TRỌNG:</b> Hệ thống sẽ phục hồi từ tệp <b>${esc(filename)}</b>.<br>
        Tất cả dữ liệu và thay đổi phát sinh sau thời điểm tạo bản sao lưu này sẽ bị ghi đè hoàn toàn. Hành động này không thể hoàn tác!
      </p>
    </div>

    <div class="form-actions">
      <button class="btn secondary" type="button" onclick="closeModal()">Hủy bỏ</button>
      <button class="btn danger" type="button" onclick="doRestoreBackup('${esc(filename)}')">
        ${icon('refresh', 16)} <span>Tiến hành Phục hồi</span>
      </button>
    </div>
  `);
};

window.doRestoreBackup = async (filename) => {
  closeModal();
  loading(true);
  try {
    const res = await api('system.backup.restore', { method: 'POST', body: { file: filename } });
    toast(res.message || 'Phục hồi thành công!');
    setTimeout(() => location.reload(), 1200);
  } catch (err) {
    toast(err.message, 'error');
    loading(false);
  }
};

window.deleteBackupConfirm = async (filename) => {
  if (!confirm(`Bạn có chắc chắn muốn xóa bản sao lưu ${filename}?`)) return;
  loading(true);
  try {
    const res = await api('system.backup.delete', { method: 'POST', body: { file: filename } });
    toast(res.message || 'Đã xóa bản sao lưu');
    await backupView();
  } catch (err) {
    toast(err.message, 'error');
  } finally {
    loading(false);
  }
};

window.uploadBackupModal = () => {
  modal(`
    <div class="sheet-drag-handle"></div>
    <div class="modal-header">
      <h2>Tải lên tệp sao lưu & Phục hồi</h2>
      <p>Chọn tệp sao lưu (.zip Full hoặc .sql) từ máy tính của bạn để phục hồi hệ thống</p>
    </div>

    <form onsubmit="doUploadBackup(event)">
      <div class="form-section">
        <div class="form-section-title">${icon('upload', 15)} Chọn tệp sao lưu (.zip / .sql)</div>
        <div class="form-grid">
          <div class="full">
            <label>Tệp dữ liệu sao lưu
              <input type="file" name="backup_file" accept=".zip,.sql" required style="padding:10px;">
              <small>Hỗ trợ tệp nén Full .zip (chứa CSDL + ảnh uploads) hoặc tệp .sql (MySQL Dump)</small>
            </label>
          </div>
        </div>
      </div>

      <div class="card p-3 mb-4" style="background:#fffbeb; border:1px solid #fde68a; border-radius:10px;">
        <p style="font-size:11.5px; color:#92400e; margin:0; line-height:1.45;">
          ⚠️ <b>Lưu ý:</b> Quá trình phục hồi từ tệp tải lên sẽ thay thế cấu trúc và toàn bộ dữ liệu hiện tại bằng nội dung tệp mới.
        </p>
      </div>

      <div class="form-actions">
        <button class="btn secondary" type="button" onclick="closeModal()">Hủy</button>
        <button class="btn primary" type="submit">
          ${icon('upload', 16)} <span>Tải lên & Phục hồi ngay</span>
        </button>
      </div>
    </form>
  `);
};

window.doUploadBackup = async (e) => {
  e.preventDefault();
  const fileInput = e.target.querySelector('input[type="file"]');
  if (!fileInput.files.length) {
    toast('Vui lòng chọn tệp .zip hoặc .sql', 'error');
    return;
  }
  closeModal();
  loading(true);
  try {
    const fd = new FormData(e.target);
    const res = await api('system.backup.upload', { method: 'POST', body: fd });
    toast(res.message || 'Phục hồi từ tệp tải lên thành công!');
    setTimeout(() => location.reload(), 1200);
  } catch (err) {
    toast(err.message, 'error');
    loading(false);
  }
};

// ==========================================================================
// TRUNG TÂM QUẢN LÝ THÔNG BÁO & CẢNH BÁO TOÀN DIỆN (NOTIFICATION CENTER)
// ==========================================================================

let notifCenterCurrentFilter = 'all';
let notifCenterCurrentQuery = '';

window.notificationsPage = async function() {
  const isAdmin = S.user?.role === 'ADMIN';

  $('#content').innerHTML = `
    ${head('Trung tâm Thông báo & Cảnh báo', `
      <button class="btn secondary sm" onclick="runSystemScanNow()">
        ${icon('refresh', 14)} <span>Quét cảnh báo hệ thống</span>
      </button>
      <button class="btn secondary sm" onclick="testServerWebPush()">
        ${icon('sparkles', 14)} <span>Test Push Nền (Kể cả tắt App)</span>
      </button>
      <button class="btn secondary sm" onclick="requestNotificationPermission()">
        ${icon('bell', 14)} <span>Bật Web Push PWA</span>
      </button>
      ${isAdmin ? `
        <button class="btn primary sm" onclick="composeNotificationModal()">
          ${icon('send', 14)} <span>Soạn thông báo</span>
        </button>
      ` : ''}
    `, 'Theo dõi toàn diện các sự kiện nghiệp vụ, cảnh báo tồn kho, lịch hẹn sửa chữa và thông báo điều hành')}

    <!-- KPI Summary Grid -->
    <div class="grid-kpi modern">
      <div class="kpi-card accent-teal">
        <div class="kpi-icon-wrap">${icon('bell', 20)}</div>
        <div class="kpi-data">
          <small>Tổng số thông báo</small>
          <strong id="kpiNotifTotal">0</strong>
          <em>Lưu trữ hệ thống</em>
        </div>
      </div>
      <div class="kpi-card accent-rose">
        <div class="kpi-icon-wrap" style="background:#fee2e2; color:#dc2626;">${icon('alert-triangle', 20)}</div>
        <div class="kpi-data">
          <small>Chưa đọc</small>
          <strong id="kpiNotifUnread" style="color:#dc2626;">0</strong>
          <em>Cần xử lý</em>
        </div>
      </div>
      <div class="kpi-card accent-teal">
        <div class="kpi-icon-wrap" style="background:#ecfdf5; color:#047857;">${icon('pos', 20)}</div>
        <div class="kpi-data">
          <small>Đơn hàng & Bán</small>
          <strong id="kpiNotifSales" style="color:#047857;">0</strong>
          <em>Giao dịch chuỗi</em>
        </div>
      </div>
      <div class="kpi-card accent-orange">
        <div class="kpi-icon-wrap">${icon('inventory', 20)}</div>
        <div class="kpi-data">
          <small>Cảnh báo Tồn kho</small>
          <strong id="kpiNotifStock">0</strong>
          <em>Hàng sắp hết</em>
        </div>
      </div>
      <div class="kpi-card accent-blue">
        <div class="kpi-icon-wrap">${icon('repairs', 20)}</div>
        <div class="kpi-data">
          <small>Phiếu Sửa chữa</small>
          <strong id="kpiNotifRepairs">0</strong>
          <em>Đến hạn / Quá hạn</em>
        </div>
      </div>
    </div>

    <!-- Main Container Card -->
    <div class="card notif-center-container">
      <div class="card-header" style="padding:16px 20px; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <!-- Search -->
        <div class="search-box" style="max-width:320px; margin-bottom:0;">
          ${icon('search', 16)}
          <input type="text" id="notifCenterSearch" placeholder="Tìm kiếm nội dung thông báo..." oninput="onNotifCenterSearch(this.value)">
        </div>

        <div style="display:flex; align-items:center; gap:8px;">
          <button class="btn secondary sm" onclick="markAllNotificationsRead(event)">
            ${icon('check', 14)} <span>Đọc tất cả</span>
          </button>
          <button class="btn ghost sm" onclick="clearReadNotifications(event)" style="color:#ef4444;">
            ${icon('trash', 14)} <span>Dọn dẹp đã đọc</span>
          </button>
        </div>
      </div>

      <!-- Filter Chips -->
      <div style="padding:12px 20px 0 20px;">
        <div class="notif-filter-chips">
          <button type="button" class="notif-chip active" data-filter="all" onclick="changeNotifCenterFilter('all', this)">
            ${icon('bell', 13)} <span>Tất cả</span>
          </button>
          <button type="button" class="notif-chip" data-filter="sales" onclick="changeNotifCenterFilter('sales', this)">
            ${icon('pos', 13)} <span>🛒 Đơn hàng & Bán lẻ</span>
          </button>
          <button type="button" class="notif-chip" data-filter="unread" onclick="changeNotifCenterFilter('unread', this)">
            ${icon('alert-triangle', 13)} <span>Chưa đọc</span>
          </button>
          <button type="button" class="notif-chip" data-filter="stock" onclick="changeNotifCenterFilter('stock', this)">
            ${icon('inventory', 13)} <span>Tồn kho thấp</span>
          </button>
          <button type="button" class="notif-chip" data-filter="repairs" onclick="changeNotifCenterFilter('repairs', this)">
            ${icon('wrench', 13)} <span>Sửa chữa</span>
          </button>
          <button type="button" class="notif-chip" data-filter="transfers" onclick="changeNotifCenterFilter('transfers', this)">
            ${icon('transfers', 13)} <span>Điều chuyển kho</span>
          </button>
          <button type="button" class="notif-chip" data-filter="system" onclick="changeNotifCenterFilter('system', this)">
            ${icon('sparkles', 13)} <span>Hệ thống / Admin</span>
          </button>
        </div>
      </div>

      <!-- Notification Table/List -->
      <div id="notifCenterListWrap" class="table-wrap">
        <div class="p-8 text-center text-slate-400">
          <span class="spinner"></span>
          <p class="mt-2 text-xs">Đang tải danh sách thông báo...</p>
        </div>
      </div>
    </div>
  `;

  await window.loadNotificationCenter();
};

window.onNotifCenterSearch = function(q) {
  notifCenterCurrentQuery = q.trim();
  window.loadNotificationCenter();
};

window.changeNotifCenterFilter = function(filter, btn) {
  notifCenterCurrentFilter = filter;
  document.querySelectorAll('.notif-filter-chips .notif-chip').forEach(c => c.classList.remove('active'));
  if (btn) btn.classList.add('active');
  window.loadNotificationCenter();
};

window.loadNotificationCenter = async function() {
  const wrap = document.getElementById('notifCenterListWrap');
  if (!wrap) return;

  try {
    const res = await api('notifications.list', {
      params: {
        limit: 100,
        filter: notifCenterCurrentFilter,
        q: notifCenterCurrentQuery
      }
    });
    const items = res.items || [];

    // Update KPI numbers
    const elTotal = document.getElementById('kpiNotifTotal');
    const elUnread = document.getElementById('kpiNotifUnread');
    if (elTotal) elTotal.textContent = res.total || 0;
    if (elUnread) elUnread.textContent = res.unread || 0;

    // Quick counters
    const salesCount = items.filter(x => x.type === 'SALE_NEW' || x.type === 'SALE_ALERT' || x.type === 'RETURN_CREATED' || x.type === 'ORDER_CANCELLED').length;
    const stockCount = items.filter(x => x.type === 'LOW_STOCK' || x.type === 'STOCK_OUT').length;
    const repairCount = items.filter(x => (x.type || '').startsWith('REPAIR')).length;
    const elSales = document.getElementById('kpiNotifSales');
    const elStock = document.getElementById('kpiNotifStock');
    const elRepairs = document.getElementById('kpiNotifRepairs');
    if (elSales) elSales.textContent = salesCount;
    if (elStock) elStock.textContent = stockCount;
    if (elRepairs) elRepairs.textContent = repairCount;

    if (!items.length) {
      wrap.innerHTML = `
        <div style="text-align:center; padding:48px 20px; color:#94a3b8;">
          <div style="color:#cbd5e1; margin-bottom:10px;">${icon('bell', 36)}</div>
          <p style="font-size:13.5px; font-weight:500; color:#475569; margin:0;">Không tìm thấy thông báo nào</p>
          <small style="color:#94a3b8; font-size:11.5px;">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</small>
        </div>
      `;
      return;
    }

    wrap.innerHTML = `
      <table>
        <thead>
          <tr>
            <th style="width:40px;"></th>
            <th>Tiêu đề & Nội dung</th>
            <th>Chi nhánh</th>
            <th>Mức độ</th>
            <th>Thời gian</th>
            <th style="text-align:right;">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(n => {
            const conf = window.getNotifTypeConfig(n.type, n.severity);
            const isUnread = !+n.is_read;
            return `
              <tr style="${isUnread ? 'background:#f0fdfa;' : ''}">
                <td style="text-align:center;">
                  <div class="notif-item-icon ${conf.sev}" style="width:28px;height:28px;margin:0 auto;">
                    ${icon(conf.iconName, 14)}
                  </div>
                </td>
                <td>
                  <div>
                    <div style="display:flex; align-items:center; gap:6px;">
                      <b style="font-size:12.5px; color:#0f172a;">${esc(n.title)}</b>
                      ${isUnread ? '<span class="badge danger" style="padding:1px 6px; font-size:9.5px;">Mới</span>' : ''}
                    </div>
                    <p style="font-size:11.5px; color:#64748b; margin:2px 0 0 0; line-height:1.45;">${esc(n.message)}</p>
                  </div>
                </td>
                <td>
                  <span class="badge" style="background:#f1f5f9; color:#475569; font-weight:500;">
                    ${esc(n.store_name || 'Toàn hệ thống')}
                  </span>
                </td>
                <td>
                  <span class="badge ${conf.sev === 'danger' ? 'danger' : conf.sev === 'warning' ? 'warning' : conf.sev === 'success' ? 'success' : 'info'}">
                    ${esc(n.severity)}
                  </span>
                </td>
                <td style="font-size:11.5px; color:#64748b; white-space:nowrap;">
                  ${window.timeAgo(n.created_at)}
                </td>
                <td style="text-align:right; white-space:nowrap;">
                  <div style="display:inline-flex; gap:6px;">
                    ${n.link_type ? `
                      <button class="btn secondary sm" onclick="window.onNotifItemClick(${n.id})" title="Xem chi tiết">
                        <span>Đến trang</span>
                      </button>
                    ` : ''}
                    ${isUnread ? `
                      <button class="btn secondary sm" onclick="window.markNotificationRead(${n.id})" title="Đánh dấu đã đọc">
                        ${icon('check', 13)}
                      </button>
                    ` : ''}
                    <button class="btn ghost sm" onclick="window.deleteNotification(${n.id})" title="Xóa thông báo" style="color:#ef4444;">
                      ${icon('trash', 13)}
                    </button>
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  } catch (err) {
    wrap.innerHTML = `<div class="p-6 text-center text-rose-600">${esc(err.message)}</div>`;
  }
};

window.runSystemScanNow = async function() {
  loading(true);
  try {
    const res = await api('notifications.scan', { method: 'POST' });
    toast(res.message || 'Quét hệ thống hoàn tất!');
    window.checkNotifications(true);
    await window.loadNotificationCenter();
  } catch (err) {
    toast(err.message, 'error');
  } finally {
    loading(false);
  }
};

window.clearReadNotifications = async function(e) {
  if (!confirm('Bạn có chắc muốn xóa tất cả thông báo đã đọc?')) return;
  loading(true);
  try {
    await api('notifications.delete', { method: 'POST', body: { clear_read: 1 } });
    toast('Đã dọn dẹp các thông báo đã đọc');
    window.checkNotifications(true);
    await window.loadNotificationCenter();
  } catch (err) {
    toast(err.message, 'error');
  } finally {
    loading(false);
  }
};

window.testServerWebPush = async function() {
  try {
    loading(true);
    // Ensure subscription is synced first
    if ('Notification' in window && Notification.permission === 'granted' && typeof window.subscribeUserToWebPush === 'function') {
      await window.subscribeUserToWebPush(false);
    }
    const res = await api('push.test', { method: 'POST' });
    toast(res.message || 'Đã gửi lệnh Web Push thành công!', res.sent_devices > 0 ? 'success' : 'warning');
    if (res.sent_devices === 0) {
      setTimeout(() => {
        toast('👉 Hãy bấm "Bật Web Push PWA" để đăng ký nhận tin cho thiết bị này trước.', 'info', 6000);
      }, 1500);
    }
  } catch (err) {
    toast(err.message || 'Lỗi khi gửi test Web Push', 'error');
  } finally {
    loading(false);
  }
};

window.testMobilePushBannerDemo = function() {
  const sampleNotifications = [
    {
      id: Date.now(),
      type: 'LOW_STOCK',
      severity: 'DANGER',
      title: 'HẾT HÀNG: iPhone 15 Pro Max 256GB Titan',
      message: 'Sản phẩm tại kho Chi nhánh 1 hiện chỉ còn 0 chiếc. Khách đặt hàng cần điều chuyển gấp từ kho khác.',
      store_name: 'Chi nhánh 1 - Quận 1',
      link_type: 'inventory',
      created_at: new Date().toISOString()
    },
    {
      id: Date.now() + 1,
      type: 'REPAIR_DUE',
      severity: 'WARNING',
      title: 'NHẮC HẸN: Phiếu SC2409160012 đến hạn trả',
      message: 'Khách hàng Nguyễn Văn A hẹn nhận máy iPhone 13 Pro thay màn hình lúc 17:30 hôm nay.',
      store_name: 'Chi nhánh 2',
      link_type: 'repairs',
      created_at: new Date().toISOString()
    },
    {
      id: Date.now() + 2,
      type: 'STOCK_TRANSFER_REQUEST',
      severity: 'INFO',
      title: 'YÊU CẦU CHUYỂN KHO: CK2409160005',
      message: 'Kho CN2 gửi yêu cầu nhận 5 Pin Pisen iPhone 11 từ Kho Tổng CN1. Vui lòng duyệt phiếu.',
      store_name: 'Kho Tổng',
      link_type: 'transfers',
      created_at: new Date().toISOString()
    }
  ];

  const pick = sampleNotifications[Math.floor(Math.random() * sampleNotifications.length)];
  window.showMobilePushBanner(pick);
  toast('🔔 Đã kích hoạt Popup Push Notification trên màn hình!');
};

window.composeNotificationModal = function() {
  const stores = S.stores || [];
  modal(`
    <div class="sheet-drag-handle"></div>
    <div class="modal-header">
      <h2 style="display:flex; align-items:center; gap:8px;">
        ${icon('send', 18)} <span>Soạn Thông báo & Phát sóng Nội bộ</span>
      </h2>
      <p>Gửi thông báo khẩn, nhắc nhở hoặc dặn dò đến toàn thể nhân viên hoặc chi nhánh cụ thể</p>
    </div>

    <form onsubmit="doSendBroadcastNotification(event)">
      <div class="form-section">
        <div class="form-section-title">${icon('sparkles', 15)} Nội dung thông báo</div>
        <div class="form-grid">
          <div class="full">
            <label>Tiêu đề thông báo *
              <input type="text" name="title" required placeholder="Ví dụ: Họp nội bộ ca tối / Khuyến mãi mới...">
            </label>
          </div>
          <div class="full">
            <label>Nội dung chi tiết *
              <textarea name="message" rows="3" required placeholder="Nhập nội dung thông báo đầy đủ gửi tới nhân viên..."></textarea>
            </label>
          </div>
        </div>
      </div>

      <div class="form-section">
        <div class="form-section-title">${icon('stores', 15)} Đối tượng nhận & Mức độ ưu tiên</div>
        <div class="form-grid">
          <div>
            <label>Mức độ cảnh báo
              <select name="severity">
                <option value="INFO">Thông tin chung (Xanh dương)</option>
                <option value="WARNING">Cảnh báo / Nhắc nhở (Vàng cam)</option>
                <option value="DANGER">Khẩn cấp / Quan trọng (Đỏ)</option>
                <option value="SUCCESS">Thành công / Khen thưởng (Xanh lá)</option>
              </select>
            </label>
          </div>
          <div>
            <label>Gửi tới Chi nhánh
              <select name="store_id">
                <option value="">Toàn bộ chuỗi cửa hàng</option>
                ${stores.map(s => `<option value="${s.id}">${esc(s.code)} · ${esc(s.name)}</option>`).join('')}
              </select>
            </label>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button class="btn secondary" type="button" onclick="closeModal()">Hủy</button>
        <button class="btn primary" type="submit">
          ${icon('send', 16)} <span>Gửi thông báo ngay</span>
        </button>
      </div>
    </form>
  `);
};

window.doSendBroadcastNotification = async function(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const data = Object.fromEntries(fd);
  closeModal();
  loading(true);
  try {
    const res = await api('notifications.send', { method: 'POST', body: data });
    toast(res.message || 'Đã gửi thông báo thành công!');
    window.checkNotifications(true);
    if (S.page === 'notifications') {
      await window.loadNotificationCenter();
    }
  } catch (err) {
    toast(err.message, 'error');
  } finally {
    loading(false);
  }
};

