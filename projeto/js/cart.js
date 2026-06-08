/**
 * JVCustom - Shopping Cart Script
 * Este ficheiro gere todas as interações no carrinho de compras:
 * - Listagem dinâmica de items
 * - Alteração de quantidades física com validação de stock
 * - Remoção de items individuais e eliminação completa do carrinho
 * - Cálculo de custos (subtotal, IVA, portes standard/expresso)
 * - Validação e aplicação de Cupões de Desconto (ex: JVC10)
 * - Checkout simbólico integrado na DB, dedução de stock e exibição do recibo de sucesso.
 */

document.addEventListener('DOMContentLoaded', () => {
  if (!window.db) return;

  // Estado da Página do Carrinho
  let shippingMethod = 'standard'; // 'standard' (4.90€) ou 'express' (15.00€)
  let discountPercent = 0;
  let appliedCoupon = '';

  // Inicializar renderização
  renderCartView();

  // 1. Core: Renderizar vista geral do carrinho
  function renderCartView() {
    const container = document.getElementById('cartViewContainer');
    if (!container) return;

    const cart = window.db.getCart();

    if (cart.length === 0) {
      renderEmptyCart(container);
      return;
    }

    // Gerar lista de items HTML
    let itemsHtml = '';
    let subtotal = 0;

    cart.forEach(item => {
      const p = window.db.getProductById(item.productId);
      if (!p) return;

      const itemTotal = p.price * item.quantity;
      subtotal += itemTotal;

      itemsHtml += `
        <div class="cart-item">
          <img src="${p.image}" alt="${p.name}" class="cart-item-image">
          <div class="cart-item-details">
            <span class="cart-item-category">${p.category}</span>
            <h3 class="cart-item-name">${p.name}</h3>
            <div class="cart-item-price-unit">${p.price.toFixed(2)} € / unid.</div>
          </div>
          
          <div class="cart-item-actions">
            <!-- Selector Quantidade -->
            <div class="quantity-selector" style="height: 38px;">
              <button class="qty-btn" onclick="updateQty('${item.productId}', ${item.quantity - 1})" style="width: 32px;">-</button>
              <input type="text" class="qty-input" value="${item.quantity}" style="width: 35px;" readonly>
              <button class="qty-btn" onclick="updateQty('${item.productId}', ${item.quantity + 1})" style="width: 32px;">+</button>
            </div>
            
            <!-- Preço Total do Artigo -->
            <div class="cart-item-total">${itemTotal.toFixed(2)} €</div>
            
            <!-- Remover -->
            <button class="cart-item-remove" onclick="removeItem('${item.productId}')" aria-label="Remover item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
            </button>
          </div>
        </div>
      `;
    });

    // Calcular valores finais
    const discountAmount = subtotal * (discountPercent / 100);
    const afterDiscount = subtotal - discountAmount;
    const shippingCost = shippingMethod === 'express' ? 15.00 : 4.90;
    const grandTotal = afterDiscount + shippingCost;
    const taxes = grandTotal * 0.23; // IVA simbólico de 23% incluído

    container.innerHTML = `
      <div class="cart-title">
        <span>O seu Carrinho (${cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
        <button class="btn btn-secondary btn-sm" onclick="clearAllCart()" style="padding: 6px 12px; font-size: 13px;">
          <svg style="vertical-align: middle; margin-right: 4px;" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          Esvaziar Carrinho
        </button>
      </div>

      <div class="cart-grid">
        <!-- Coluna Esquerda: Listagem de Items -->
        <div class="cart-card">
          <div class="cart-items-list">
            ${itemsHtml}
          </div>
        </div>

        <!-- Coluna Direita: Painel de Pagamento/Resumo -->
        <div class="cart-card" style="padding: 24px;">
          <h2 class="summary-title">Resumo da Encomenda</h2>
          
          <div class="summary-row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)} €</span>
          </div>
          
          <!-- Cupão Desconto -->
          <div class="summary-row" id="couponRow" style="${discountPercent > 0 ? 'display: flex;' : 'display: none;'} color: var(--success);">
            <span>Desconto (${discountPercent}%)</span>
            <span>-${discountAmount.toFixed(2)} €</span>
          </div>
          
          <div class="summary-row">
            <span>Portes de Envio</span>
            <span>${shippingCost.toFixed(2)} €</span>
          </div>
          
          <div class="summary-row">
            <span>IVA Estimado (23% inc.)</span>
            <span>${taxes.toFixed(2)} €</span>
          </div>

          <!-- Portes de Envio Selector -->
          <div class="shipping-options">
            <div style="font-weight: 700; font-size: 13px; color: var(--text-primary); margin-bottom: 12px;">Método de Envio:</div>
            <label class="shipping-option">
              <input type="radio" name="shipping" value="standard" ${shippingMethod === 'standard' ? 'checked' : ''} onchange="setShipping('standard')">
              <span>Standard (4-5 dias úteis) - 4.90 €</span>
            </label>
            <label class="shipping-option">
              <input type="radio" name="shipping" value="express" ${shippingMethod === 'express' ? 'checked' : ''} onchange="setShipping('express')">
              <span>Expresso (24-48h úteis) - 15.00 €</span>
            </label>
          </div>

          <!-- Cupão Formulário -->
          <div class="promo-applied-tag" id="promoTag" style="${discountPercent > 0 ? 'display: flex;' : 'display: none;'}">
            <span>Cupão <strong>${appliedCoupon}</strong> ativo</span>
            <span style="cursor: pointer; font-size: 14px;" onclick="removeCoupon()">&times;</span>
          </div>
          
          <div class="promo-wrapper" id="promoFormWrapper" style="${discountPercent > 0 ? 'display: none;' : 'display: flex;'}">
            <input type="text" id="couponInput" class="form-control" placeholder="Código de desconto (JVC10)">
            <button class="btn btn-secondary" onclick="applyCoupon()">Aplicar</button>
          </div>

          <!-- Total Global -->
          <div class="summary-row total">
            <span>Total</span>
            <span>${grandTotal.toFixed(2)} €</span>
          </div>

          <!-- Finalizar Compra -->
          <button class="btn btn-primary" onclick="proceedToCheckout()" style="width: 100%; height: 50px;">
            Finalizar Compra
          </button>
          
          <div style="text-align: center; margin-top: 16px; font-size: 12px; color: var(--text-muted);">
            Esta é uma transação simbólica. Nenhuma cobrança real será efetuada.
          </div>
        </div>
      </div>
    `;
  }

  // 2. Renderizar estado do carrinho vazio
  function renderEmptyCart(container) {
    container.innerHTML = `
      <div class="cart-card empty-cart-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
        <h2 class="empty-cart-title">O seu carrinho está vazio</h2>
        <p class="empty-cart-desc">Parece que ainda não adicionou peças ao seu projeto automóvel. Dê uma vista de olhos no nosso catálogo.</p>
        <a href="shop.html" class="btn btn-primary">Ir para o Catálogo</a>
      </div>
    `;
  }

  // 3. Atualizar quantidade de items
  function updateQty(productId, newQty) {
    const product = window.db.getProductById(productId);
    if (!product) return;

    if (newQty > product.stock) {
      window.showToast('Limite Excedido', `Apenas existem ${product.stock} unidades em stock deste produto.`, 'warning');
      return;
    }

    const success = window.db.updateCartQuantity(productId, newQty);
    if (success) {
      renderCartView();
    }
  }

  // 4. Remover item do carrinho
  function removeItem(productId) {
    window.db.removeFromCart(productId);
    window.showToast('Item Removido', 'O item foi removido do seu carrinho de compras.', 'info');
    renderCartView();
  }

  // 5. Limpar todo o carrinho
  function clearAllCart() {
    window.db.clearCart();
    window.showToast('Carrinho Esvaziado', 'Todos os artigos do carrinho foram eliminados.', 'info');
    renderCartView();
  }

  // 6. Configurar método de portes de envio
  function setShipping(method) {
    shippingMethod = method;
    renderCartView();
  }

  // 7. Aplicar cupões
  function applyCoupon() {
    const couponInput = document.getElementById('couponInput');
    if (!couponInput) return;

    const value = couponInput.value.trim().toUpperCase();
    if (value === 'JVC10') {
      discountPercent = 10;
      appliedCoupon = value;
      window.showToast('Cupão Aplicado', 'Parabéns, recebeu 10% de desconto no subtotal.', 'success');
      renderCartView();
    } else if (value === '') {
      window.showToast('Cupão Inválido', 'Insira um código válido.', 'warning');
    } else {
      window.showToast('Cupão Inválido', 'O código inserido não existe ou expirou.', 'danger');
    }
  }

  // 8. Remover cupão
  function removeCoupon() {
    discountPercent = 0;
    appliedCoupon = '';
    window.showToast('Cupão Removido', 'O desconto do cupão foi removido.', 'info');
    renderCartView();
  }

  // 9. Proceder ao checkout (verificando sessão e stock)
  function proceedToCheckout() {
    const session = window.db.getSession();
    if (!session) {
      window.showToast('Autenticação Necessária', 'Tem de iniciar sessão para finalizar a compra.', 'warning');
      setTimeout(() => {
        window.location.href = 'auth.html';
      }, 1500);
      return;
    }

    // Efetuar transação na Base de Dados local
    const checkoutResult = window.db.checkout(shippingMethod);

    if (checkoutResult.success) {
      const order = checkoutResult.order;
      
      // Renderizar dados do recibo no Modal
      const receiptContainer = document.getElementById('receiptDetails');
      if (receiptContainer) {
        let itemsSummary = order.items.map(item => `
          <div class="receipt-row">
            <span>${item.name} (x${item.quantity})</span>
            <span>${(item.price * item.quantity).toFixed(2)} €</span>
          </div>
        `).join('');

        let couponDiscountText = '';
        if (discountPercent > 0) {
          const discountAmt = order.subtotal * (discountPercent / 100);
          couponDiscountText = `
            <div class="receipt-row" style="color: var(--success)">
              <span>Desconto Cupão (${appliedCoupon})</span>
              <span>-${discountAmt.toFixed(2)} €</span>
            </div>
          `;
        }

        receiptContainer.innerHTML = `
          <div class="receipt-row">
            <strong>ID Encomenda:</strong>
            <span style="font-family: monospace; font-weight: 700; color: var(--accent-primary);">${order.id}</span>
          </div>
          <div class="receipt-row">
            <strong>Comprador:</strong>
            <span>${order.userEmail}</span>
          </div>
          <div class="receipt-row">
            <strong>Data:</strong>
            <span>${new Date(order.date).toLocaleString()}</span>
          </div>
          
          <div style="margin: 12px 0; border-top: 1px dashed var(--border-color); padding-top: 12px;">
            ${itemsSummary}
          </div>
          
          ${couponDiscountText}
          <div class="receipt-row">
            <span>Portes (${shippingMethod === 'express' ? 'Expresso' : 'Standard'})</span>
            <span>${order.shippingCost.toFixed(2)} €</span>
          </div>
          <div class="receipt-row total">
            <span>Total Pago (simbólico)</span>
            <span>${order.total.toFixed(2)} €</span>
          </div>
        `;
      }

      // Abrir Modal
      const modal = document.getElementById('checkoutSuccessModal');
      if (modal) {
        modal.classList.add('active');
      }

      // Resetar cupão
      discountPercent = 0;
      appliedCoupon = '';
      
      // Renderizar o carrinho limpo
      renderCartView();
    } else {
      window.showToast('Falha na Compra', checkoutResult.message, 'danger');
    }
  }

  // Auxiliares Globais de Modal
  function closeModal() {
    const modal = document.getElementById('checkoutSuccessModal');
    if (modal) modal.classList.remove('active');
  }

  // Tornar funções disponíveis para handlers HTML onclick
  window.updateQty = updateQty;
  window.removeItem = removeItem;
  window.clearAllCart = clearAllCart;
  window.setShipping = setShipping;
  window.applyCoupon = applyCoupon;
  window.removeCoupon = removeCoupon;
  window.proceedToCheckout = proceedToCheckout;
  window.closeModal = closeModal;
});
