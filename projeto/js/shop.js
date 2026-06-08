/**
 * JVCustom - Catalog Page Script
 * Este ficheiro controla a lógica do catálogo de produtos:
 * - Pesquisa em tempo real
 * - Filtros por categoria (através de botões e parâmetros de URL)
 * - Ordenação de preços e classificação
 * - Filtro especial "Apenas Recomendados" baseado no perfil e orçamento do utilizador
 */

document.addEventListener('DOMContentLoaded', () => {
  if (!window.db) return;

  // Seletores DOM
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  const onlyRecommendedCheck = document.getElementById('onlyRecommendedCheck');
  const profileAlertContainer = document.getElementById('profileAlertContainer');
  const profileAlertText = document.getElementById('profileAlertText');
  const categoryPills = document.querySelectorAll('.category-pill');

  // Estado dos Filtros
  let filters = {
    search: '',
    category: 'Todos',
    sort: 'relevance',
    onlyRecommended: false
  };

  // 1. Verificar se existe uma categoria selecionada na URL (ex: shop.html?category=Jantes)
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get('category');
  if (categoryParam) {
    filters.category = categoryParam;
    // Atualizar classe ativa nas pílulas do HTML
    categoryPills.forEach(pill => {
      if (pill.getAttribute('data-category') === categoryParam) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });
  }

  // 2. Personalização com base no Utilizador
  const session = window.db.getSession();
  if (session) {
    profileAlertContainer.style.display = 'block';
    profileAlertText.innerHTML = `Olá <strong>${session.name}</strong>! O catálogo está com suporte personalizado ao seu perfil <strong>${session.preference}</strong> (${session.budget} Orçamento).`;
  } else {
    profileAlertContainer.style.display = 'none';
  }

  // 3. Renderizar catálogo inicial
  applyFiltersAndRender();

  // 4. Registar Eventos de Pesquisa
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      filters.search = e.target.value.trim();
      applyFiltersAndRender();
    });
  }

  // 5. Registar Eventos de Ordenação
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      filters.sort = e.target.value;
      applyFiltersAndRender();
    });
  }

  // 6. Registar Evento do Checkbox de Recomendação
  if (onlyRecommendedCheck) {
    onlyRecommendedCheck.addEventListener('change', (e) => {
      filters.onlyRecommended = e.target.checked;
      applyFiltersAndRender();
    });
  }

  // 7. Registar Evento das Pílulas de Categoria
  categoryPills.forEach(pill => {
    pill.addEventListener('click', () => {
      categoryPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      
      filters.category = pill.getAttribute('data-category');
      applyFiltersAndRender();
    });
  });

  // 8. Core: Lógica de Filtro e Ordenação
  function applyFiltersAndRender() {
    let products = window.db.getProducts();
    
    // Filtro por Categoria
    if (filters.category !== 'Todos') {
      products = products.filter(p => p.category.toLowerCase() === filters.category.toLowerCase());
    }
    
    // Filtro por Pesquisa de Texto
    if (filters.search) {
      const q = filters.search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q)
      );
    }
    
    // Filtro Avançado: Recomendações Personalizadas
    if (filters.onlyRecommended && session) {
      if (session.budget === 'Low') {
        products = products.filter(p => p.price <= 100);
      } else if (session.budget === 'Medium') {
        products = products.filter(p => p.price > 40 && p.price <= 300);
      } else if (session.budget === 'High') {
        products = products.filter(p => p.price >= 200);
      }
    }
    
    // Ordenação
    if (filters.sort === 'price-asc') {
      products.sort((a, b) => a.price - b.price);
    } else if (filters.sort === 'price-desc') {
      products.sort((a, b) => b.price - a.price);
    } else if (filters.sort === 'rating') {
      products.sort((a, b) => b.rating - a.rating);
    } // relevance mantém a ordem inicial da DB
    
    renderCatalog(products);
  }

  // 9. Renderização do Grid
  function renderCatalog(items) {
    const catalogGrid = document.getElementById('catalogGrid');
    if (!catalogGrid) return;
    
    if (items.length === 0) {
      catalogGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 80px 20px; background-color: var(--bg-secondary); border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
          <svg style="color: var(--text-muted); margin-bottom: 16px;" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M8 11h6"/></svg>
          <h3 style="font-family: var(--font-display); font-size: 20px; font-weight: 700; margin-bottom: 8px;">Nenhum Produto Encontrado</h3>
          <p style="color: var(--text-secondary); max-width: 400px; margin: 0 auto; font-size: 14px;">Tente alterar os seus termos de pesquisa, remover filtros de categoria ou desmarcar a opção de recomendação personalizada.</p>
        </div>
      `;
      return;
    }
    
    catalogGrid.innerHTML = items.map(p => {
      // Determinar badge
      let badgeHtml = '';
      
      // Se estiver logado e este produto corresponder ao orçamento recomendado do utilizador
      let isRecommended = false;
      if (session) {
        if (session.budget === 'Low' && p.price <= 100) isRecommended = true;
        else if (session.budget === 'Medium' && p.price > 40 && p.price <= 300) isRecommended = true;
        else if (session.budget === 'High' && p.price >= 200) isRecommended = true;
      }
      
      if (p.stock <= 3 && p.stock > 0) {
        badgeHtml = `<span class="product-card-badge badge-low-stock">Últimas Unidades (${p.stock})</span>`;
      } else if (p.stock === 0) {
        badgeHtml = `<span class="product-card-badge badge-low-stock" style="background-color: var(--text-muted)">Esgotado</span>`;
      } else if (isRecommended && session) {
        badgeHtml = `<span class="product-card-badge badge-recommend">Recomendado</span>`;
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
                <button class="btn btn-primary btn-sm btn-icon-only" onclick="quickAdd('${p.id}')" aria-label="Adicionar ${p.name} ao carrinho">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/><line x1="12" x2="12" y1="9" y2="15"/><line x1="9" x2="15" y1="12" y2="12"/></svg>
                </button>
              ` : `
                <span style="font-size: 13px; font-weight: 700; color: var(--text-muted)">Sem Stock</span>
              `}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
});

// Ação de adicionar rapidamente ao carrinho
function quickAdd(productId) {
  if (window.db) {
    const result = window.db.addToCart(productId, 1);
    if (result.success) {
      window.showToast('Carrinho Atualizado', result.message, 'success');
    } else {
      window.showToast('Erro de Stock', result.message, 'warning');
    }
  }
}
window.quickAdd = quickAdd;
