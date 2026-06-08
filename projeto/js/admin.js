/**
 * JVCustom - Administrator Panel Script
 * Este ficheiro gere toda a área de administração:
 * - Validação estrita de sessão do tipo 'admin' (com expulsão imediata de intrusos)
 * - Cálculo dinâmico de KPIs de desempenho da loja (Faturação, Contagem de Vendas, Clientes, Artigos com Baixo Stock)
 * - Exibição de banners de alerta para stock crítico
 * - Tabela dinâmica de listagem e controlo de stock rápido inline
 * - Adição de novos produtos (com suporte a especificações) via Modal
 * - Edição integral de produtos via Modal
 * - Eliminação de artigos da Base de Dados
 * - Listagem de encomendas de vendas recebidas globalmente
 */

document.addEventListener('DOMContentLoaded', () => {
  if (!window.db) return;

  // 1. Validar Acesso de Administrador
  const session = window.db.getSession();
  if (!session || session.role !== 'admin') {
    window.showToast('Acesso Negado', 'Esta página é restrita apenas a administradores do sistema.', 'danger');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1200);
    return;
  }

  // Inicializar Componentes e Painel
  updateDashboardData();

  // 2. Registar Eventos de Submissão de Formulários
  const addForm = document.getElementById('addProductForm');
  if (addForm) {
    addForm.addEventListener('submit', handleAddProduct);
  }

  const editForm = document.getElementById('editProductForm');
  if (editForm) {
    editForm.addEventListener('submit', handleEditProduct);
  }
});

/* ==========================================================================
   NAVEGAÇÃO POR ABAS (TABS)
   ========================================================================= */
function switchAdminTab(tab) {
  const tabProducts = document.getElementById('tabProducts');
  const tabSales = document.getElementById('tabSales');
  const productsArea = document.getElementById('adminProductsArea');
  const salesArea = document.getElementById('adminSalesArea');

  if (!tabProducts || !tabSales || !productsArea || !salesArea) return;

  if (tab === 'products') {
    tabProducts.classList.add('active');
    tabSales.classList.remove('active');
    productsArea.style.display = 'block';
    salesArea.style.display = 'none';
  } else {
    tabSales.classList.add('active');
    tabProducts.classList.remove('active');
    salesArea.style.display = 'block';
    productsArea.style.display = 'none';
  }
}
window.switchAdminTab = switchAdminTab;

/* ==========================================================================
   RENDERIZAÇÃO DE MÉTRICAS E DADOS (DASHBOARD ENGINE)
   ========================================================================= */
function updateDashboardData() {
  if (!window.db) return;

  const products = window.db.getProducts();
  const orders = window.db.getOrders();
  const users = window.db.getUsers();

  // 1. Calcular Métricas
  const totalRevenue = orders.reduce((sum, ord) => sum + ord.total, 0);
  const totalOrders = orders.length;
  const totalUsers = users.length;
  
  // Contar items com stock crítico (<= 3 unidades)
  const lowStockProducts = products.filter(p => p.stock <= 3);
  const lowStockCount = lowStockProducts.length;

  // Injetar Métricas no DOM
  document.getElementById('metricRevenue').innerText = `${totalRevenue.toFixed(2)} €`;
  document.getElementById('metricOrders').innerText = totalOrders;
  document.getElementById('metricUsers').innerText = totalUsers;
  document.getElementById('metricStock').innerText = lowStockCount;

  // Configurar Alerta de Stock Crítico Banner
  const alertBanner = document.getElementById('criticalStockAlert');
  const alertText = document.getElementById('criticalAlertText');
  const lowStockCard = document.getElementById('lowStockCard');

  if (lowStockCount > 0) {
    if (alertBanner && alertText) {
      alertBanner.style.display = 'flex';
      alertText.innerHTML = `<strong>Atenção:</strong> Existem <strong>${lowStockCount}</strong> produtos com stock em estado crítico (≤ 3 unidades)!`;
    }
    if (lowStockCard) {
      lowStockCard.style.borderColor = 'var(--danger)';
      lowStockCard.style.backgroundColor = 'var(--danger-bg)';
    }
  } else {
    if (alertBanner) alertBanner.style.display = 'none';
    if (lowStockCard) {
      lowStockCard.style.borderColor = 'var(--border-color)';
      lowStockCard.style.backgroundColor = 'var(--bg-secondary)';
    }
  }

  // 2. Renderizar Tabelas
  renderProductsTable(products);
  renderSalesTable(orders);
}

// Renderizar Tabela de Produtos
function renderProductsTable(products) {
  const tableBody = document.getElementById('adminProductsTableBody');
  if (!tableBody) return;

  if (products.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">
          Nenhum produto cadastrado no catálogo.
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = products.map(p => {
    const isCritical = p.stock <= 3;
    const stockBadge = isCritical 
      ? `<span class="stock-badge stock-badge-low">Crítico (${p.stock})</span>`
      : `<span class="stock-badge stock-badge-ok">Estável (${p.stock})</span>`;

    return `
      <tr id="prod-row-${p.id}">
        <td>
          <img src="${p.image}" alt="${p.name}" class="product-thumb">
        </td>
        <td>
          <div style="font-weight: 700; font-size: 15px;">${p.name}</div>
          <div style="font-size: 12px; color: var(--text-muted); font-family: monospace;">ID: ${p.id}</div>
        </td>
        <td>${p.category}</td>
        <td style="font-weight: 700;">${p.price.toFixed(2)} €</td>
        <td>${stockBadge}</td>
        <td>
          <!-- Reabastecimento Rápido Inline -->
          <div class="quick-stock-form">
            <input type="number" class="quick-stock-input" id="quickStock-${p.id}" value="${p.stock}" min="0">
            <button class="action-icon-btn edit" onclick="quickRestock('${p.id}')" title="Gravar stock" aria-label="Atualizar stock">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            </button>
          </div>
        </td>
        <td>
          <!-- Ações Editar / Apagar -->
          <div class="action-icons">
            <button class="action-icon-btn edit" onclick="openEditModal('${p.id}')" title="Editar Ficha" aria-label="Editar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
            </button>
            <button class="action-icon-btn delete" onclick="deleteProduct('${p.id}')" title="Eliminar Artigo" aria-label="Eliminar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Renderizar Tabela de Encomendas Recebidas
function renderSalesTable(orders) {
  const tableBody = document.getElementById('adminSalesTableBody');
  if (!tableBody) return;

  if (orders.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">
          Nenhuma transação simbólica registada até ao momento.
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = orders.map(ord => {
    const dateStr = new Date(ord.date).toLocaleString();
    const itemsStr = ord.items.map(item => `${item.name} (x${item.quantity})`).join('<br>');

    return `
      <tr>
        <td style="font-family: monospace; font-weight: 700; color: var(--accent-primary);">${ord.id}</td>
        <td>${ord.userEmail}</td>
        <td style="color: var(--text-secondary); font-size: 13px;">${dateStr}</td>
        <td style="line-height: 1.4; font-size: 13px;">${itemsStr}</td>
        <td>${ord.shippingCost.toFixed(2)} €</td>
        <td style="font-weight: 800; font-size: 15px;">${ord.total.toFixed(2)} €</td>
        <td>
          <span style="font-weight: 700; color: var(--success); display: inline-flex; align-items: center; gap: 4px;">
            <span style="width: 6px; height: 6px; border-radius: 50%; background-color: var(--success);"></span>
            Faturado
          </span>
        </td>
      </tr>
    `;
  }).join('');
}

/* ==========================================================================
   AÇÕES DE STOCK E PRODUTOS
   ========================================================================= */

// 1. Reabastecimento inline rápido
function quickRestock(productId) {
  const stockInput = document.getElementById(`quickStock-${productId}`);
  if (!stockInput) return;

  const newQty = parseInt(stockInput.value);
  if (isNaN(newQty) || newQty < 0) {
    window.showToast('Valor Inválido', 'Insira uma quantidade numérica superior ou igual a zero.', 'warning');
    return;
  }

  const p = window.db.getProductById(productId);
  if (p) {
    p.stock = newQty;
    window.db.updateProduct(p);
    window.showToast('Stock Atualizado', `Stock de ${p.name} definido para ${newQty} unidades.`, 'success');
    updateDashboardData();
  }
}
window.quickRestock = quickRestock;

// 2. Eliminar Produto
function deleteProduct(productId) {
  const p = window.db.getProductById(productId);
  if (!p) return;

  if (confirm(`Tem a certeza que deseja remover permanentemente o artigo "${p.name}" do catálogo?`)) {
    window.db.deleteProduct(productId);
    window.showToast('Artigo Eliminado', 'O produto foi retirado da base de dados.', 'info');
    updateDashboardData();
  }
}
window.deleteProduct = deleteProduct;

// 3. Adicionar Produto
function handleAddProduct(e) {
  e.preventDefault();

  const name = document.getElementById('addName').value.trim();
  const category = document.getElementById('addCategory').value;
  const price = parseFloat(document.getElementById('addPrice').value);
  const stock = parseInt(document.getElementById('addStock').value);
  const rating = parseFloat(document.getElementById('addRating').value);
  const image = document.getElementById('addImage').value.trim();
  const description = document.getElementById('addDescription').value.trim();

  // Obter especificações
  const specLabel = document.getElementById('addSpecLabel').value.trim();
  const specValue = document.getElementById('addSpecValue').value.trim();
  const specs = {};
  if (specLabel && specValue) {
    specs[specLabel] = specValue;
  }

  const newProduct = {
    name,
    category,
    price,
    stock,
    rating,
    image,
    description,
    specs
  };

  const added = window.db.addProduct(newProduct);
  if (added) {
    window.showToast('Produto Adicionado', `"${name}" registado com sucesso no catálogo.`, 'success');
    closeAddModal();
    updateDashboardData();
  }
}

// 4. Editar Produto
function handleEditProduct(e) {
  e.preventDefault();

  const id = document.getElementById('editId').value;
  const name = document.getElementById('editName').value.trim();
  const category = document.getElementById('editCategory').value;
  const price = parseFloat(document.getElementById('editPrice').value);
  const stock = parseInt(document.getElementById('editStock').value);
  const rating = parseFloat(document.getElementById('editRating').value);
  const image = document.getElementById('editImage').value.trim();
  const description = document.getElementById('editDescription').value.trim();

  const currentProduct = window.db.getProductById(id);
  if (!currentProduct) return;

  const updatedProduct = {
    ...currentProduct,
    name,
    category,
    price,
    stock,
    rating,
    image,
    description
  };

  const updated = window.db.updateProduct(updatedProduct);
  if (updated) {
    window.showToast('Ficha Atualizada', `As alterações em "${name}" foram gravadas.`, 'success');
    closeEditModal();
    updateDashboardData();
  }
}

/* ==========================================================================
   CONTROLE DE MODAIS (POPUP ACTIONS)
   ========================================================================= */

// Modal Adicionar
function openAddModal() {
  const modal = document.getElementById('addProductModal');
  if (modal) modal.classList.add('active');
}
window.openAddModal = openAddModal;

function closeAddModal() {
  const modal = document.getElementById('addProductModal');
  if (modal) {
    modal.classList.remove('active');
    document.getElementById('addProductForm').reset();
  }
}
window.closeAddModal = closeAddModal;

// Modal Editar
function openEditModal(productId) {
  const p = window.db.getProductById(productId);
  if (!p) return;

  document.getElementById('editId').value = p.id;
  document.getElementById('editName').value = p.name;
  document.getElementById('editCategory').value = p.category;
  document.getElementById('editPrice').value = p.price;
  document.getElementById('editStock').value = p.stock;
  document.getElementById('editRating').value = p.rating;
  document.getElementById('editImage').value = p.image;
  document.getElementById('editDescription').value = p.description;

  const modal = document.getElementById('editProductModal');
  if (modal) modal.classList.add('active');
}
window.openEditModal = openEditModal;

function closeEditModal() {
  const modal = document.getElementById('editProductModal');
  if (modal) {
    modal.classList.remove('active');
    document.getElementById('editProductForm').reset();
  }
}
window.closeEditModal = closeEditModal;

// Rolagem suave até à tabela de stock a partir do banner de aviso
function scrollToStock() {
  const area = document.getElementById('adminProductsArea');
  if (area) {
    area.scrollIntoView({ behavior: 'smooth' });
  }
}
window.scrollToStock = scrollToStock;
