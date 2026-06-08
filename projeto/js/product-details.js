/**
 * JVCustom - Product Details Page Script
 * Este ficheiro gere o carregamento dinâmico dos detalhes de um produto específico,
 * os controlos de quantidade, verificação física de stock e renderização de produtos relacionados.
 */

document.addEventListener('DOMContentLoaded', () => {
  if (!window.db) return;

  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  const container = document.getElementById('productContainer');

  if (!container) return;

  if (!productId) {
    renderError(container, 'Identificador de produto ausente.');
    return;
  }

  const product = window.db.getProductById(productId);

  if (!product) {
    renderError(container, 'O produto solicitado não existe ou foi removido.');
    return;
  }

  // Renderizar o produto encontrado
  renderProductDetails(container, product);
  
  // Renderizar produtos relacionados
  renderRelatedProducts(product);
  
  // Lógica dos botões de quantidade e adição
  setupPurchaseControls(product);
});

// 1. Mostrar estado de erro caso o produto não seja válido
function renderError(container, message) {
  container.innerHTML = `
    <div style="text-align: center; padding: 100px 20px; background-color: var(--bg-secondary); border-radius: var(--radius-lg); border: 1px solid var(--border-color); max-width: 600px; margin: 40px auto;">
      <svg style="color: var(--danger); margin-bottom: 20px;" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
      <h2 style="font-family: var(--font-display); font-size: 24px; font-weight: 700; margin-bottom: 12px;">Produto Não Encontrado</h2>
      <p style="color: var(--text-secondary); margin-bottom: 30px; font-size: 15px;">${message}</p>
      <a href="shop.html" class="btn btn-primary">Voltar para o Catálogo</a>
    </div>
  `;
}

// 2. Renderizar a estrutura de detalhes do produto
function renderProductDetails(container, p) {
  // Gerar estrelas baseadas no rating
  const fullStars = Math.floor(p.rating);
  const halfStar = p.rating % 1 >= 0.5 ? 1 : 0;
  let starsHtml = '';
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      starsHtml += '★';
    } else if (i === fullStars && halfStar) {
      starsHtml += '½'; // Simbólico
    } else {
      starsHtml += '☆';
    }
  }

  // Gerar indicador de stock
  let stockClass = 'stock-in';
  let stockText = 'Em Stock';
  if (p.stock === 0) {
    stockClass = 'stock-out';
    stockText = 'Esgotado / Indisponível';
  } else if (p.stock <= 3) {
    stockClass = 'stock-low';
    stockText = `Apenas ${p.stock} unidades restantes!`;
  } else {
    stockText = `Em Stock (${p.stock} unidades)`;
  }

  // Gerar tabela de especificações
  let specsHtml = '';
  if (p.specs) {
    specsHtml = Object.entries(p.specs).map(([label, value]) => `
      <tr>
        <td class="specs-label">${label}</td>
        <td class="specs-value">${value}</td>
      </tr>
    `).join('');
  }

  container.innerHTML = `
    <!-- Navegação de migalha de pão (Breadcrumb) -->
    <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 24px;">
      <a href="index.html">Início</a> &nbsp;/&nbsp; 
      <a href="shop.html">Catálogo</a> &nbsp;/&nbsp; 
      <a href="shop.html?category=${p.category}">${p.category}</a> &nbsp;/&nbsp; 
      <span style="color: var(--text-primary); font-weight: 600;">${p.name}</span>
    </div>

    <!-- Layout Grid Detalhes -->
    <div class="details-grid">
      <!-- Coluna Esquerda: Imagem -->
      <div class="product-gallery">
        <img src="${p.image}" alt="${p.name}">
      </div>

      <!-- Coluna Direita: Informação de Compra -->
      <div class="product-meta">
        <span class="product-meta-category">${p.category}</span>
        <h1 class="product-meta-title">${p.name}</h1>
        
        <div class="product-meta-rating">
          <span class="stars">${starsHtml}</span>
          <span>(${p.rating} / 5.0)</span>
        </div>
        
        <div class="product-meta-price">${p.price.toFixed(2)} €</div>
        
        <p class="product-meta-desc">${p.description}</p>
        
        <!-- Cartão de Ações e Compra -->
        <div class="purchase-section">
          <span class="stock-indicator ${stockClass}">${stockText}</span>
          
          <div class="purchase-actions">
            <!-- Seletor Quantidade -->
            ${p.stock > 0 ? `
              <div class="quantity-selector">
                <button type="button" class="qty-btn" id="qtyMinus" aria-label="Reduzir quantidade">-</button>
                <input type="text" id="qtyValue" class="qty-input" value="1" readonly>
                <button type="button" class="qty-btn" id="qtyPlus" aria-label="Aumentar quantidade">+</button>
              </div>
              
              <button class="btn btn-primary" id="addToCartBtn" style="flex-grow: 1; height: 48px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/><line x1="12" x2="12" y1="9" y2="15"/><line x1="9" x2="15" y1="12" y2="12"/></svg>
                Adicionar ao Carrinho
              </button>
            ` : `
              <button class="btn btn-secondary" style="width: 100%; height: 48px; cursor: not-allowed;" disabled>
                Indisponível de Momento
              </button>
            `}
          </div>
        </div>
      </div>
    </div>

    <!-- Especificações Técnicas -->
    ${specsHtml ? `
      <div class="specs-section">
        <h2 class="specs-title">Especificações Técnicas</h2>
        <table class="specs-table">
          <tbody>
            ${specsHtml}
          </tbody>
        </table>
      </div>
    ` : ''}

    <!-- Produtos Relacionados -->
    <div class="related-section">
      <h2 class="specs-title" style="margin-bottom: 30px;">Produtos Relacionados</h2>
      <div class="product-grid" id="relatedProductsGrid">
        <!-- Injetado Dinamicamente -->
      </div>
    </div>
  `;
}

// 3. Controladores de Quantidade e Adição
function setupPurchaseControls(p) {
  if (p.stock <= 0) return;

  const btnMinus = document.getElementById('qtyMinus');
  const btnPlus = document.getElementById('qtyPlus');
  const qtyInput = document.getElementById('qtyValue');
  const btnAdd = document.getElementById('addToCartBtn');

  if (!btnMinus || !btnPlus || !qtyInput || !btnAdd) return;

  let currentQty = 1;

  btnMinus.addEventListener('click', () => {
    if (currentQty > 1) {
      currentQty--;
      qtyInput.value = currentQty;
    }
  });

  btnPlus.addEventListener('click', () => {
    if (currentQty < p.stock) {
      currentQty++;
      qtyInput.value = currentQty;
    } else {
      window.showToast('Limite Atingido', `Apenas existem ${p.stock} unidades deste artigo em stock.`, 'warning');
    }
  });

  btnAdd.addEventListener('click', () => {
    if (window.db) {
      const result = window.db.addToCart(p.id, currentQty);
      if (result.success) {
        window.showToast('Carrinho Atualizado', result.message, 'success');
        // Resetar quantidade
        currentQty = 1;
        qtyInput.value = 1;
      } else {
        window.showToast('Erro de Stock', result.message, 'warning');
      }
    }
  });
}

// 4. Carregar Produtos Relacionados (Mesma Categoria, excluindo o atual)
function renderRelatedProducts(currentProduct) {
  const relatedGrid = document.getElementById('relatedProductsGrid');
  if (!relatedGrid || !window.db) return;

  const allProducts = window.db.getProducts();
  
  // Filtrar da mesma categoria e remover o atual
  let related = allProducts.filter(p => p.category === currentProduct.category && p.id !== currentProduct.id);

  // Se não houver suficientes da mesma categoria, preencher com outros
  if (related.length < 3) {
    const extra = allProducts.filter(p => p.id !== currentProduct.id && p.category !== currentProduct.category);
    related = [...related, ...extra].slice(0, 3);
  } else {
    related = related.slice(0, 3);
  }

  relatedGrid.innerHTML = related.map(p => {
    let badgeHtml = '';
    if (p.stock <= 3 && p.stock > 0) {
      badgeHtml = `<span class="product-card-badge badge-low-stock">Últimas Unidades</span>`;
    } else if (p.stock === 0) {
      badgeHtml = `<span class="product-card-badge badge-low-stock" style="background-color: var(--text-muted)">Esgotado</span>`;
    }

    return `
      <div class="product-card">
        ${badgeHtml}
        <div class="product-card-image-wrapper">
          <a href="product-details.html?id=${p.id}">
            <img src="${p.image}" alt="${p.name}" class="product-card-image">
          </a>
        </div>
        <div class="product-card-info">
          <span class="product-card-category">${p.category}</span>
          <a href="product-details.html?id=${p.id}">
            <h3 class="product-card-title">${p.name}</h3>
          </a>
          <p class="product-card-description">${p.description}</p>
          <div class="product-card-footer">
            <span class="product-card-price">${p.price.toFixed(2)} €</span>
            ${p.stock > 0 ? `
              <a href="product-details.html?id=${p.id}" class="btn btn-primary btn-sm btn-icon-only" aria-label="Ver ${p.name}">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              </a>
            ` : `
              <span style="font-size: 13px; font-weight: 700; color: var(--text-muted)">Sem Stock</span>
            `}
          </div>
        </div>
      </div>
    `;
  }).join('');
}
