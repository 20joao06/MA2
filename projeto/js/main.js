/**
 * JVCustom - Global Layout & Interface Script
 * Este ficheiro gere aspetos partilhados por todas as páginas:
 * - Injeção dinâmica do Cabeçalho (Header) e Rodapé (Footer)
 * - Alternador de Tema Claro/Escuro (Persistido no localStorage)
 * - Atualização do contador do carrinho de compras
 * - Sistema global de notificações Toast
 * - Gestão de sessão e menus dropdown do utilizador
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Inicializar Tema Claro/Escuro
  initTheme();

  // 2. Injetar Cabeçalho e Rodapé globais
  injectHeader();
  injectFooter();

  // 3. Registar Eventos Globais
  setupGlobalEvents();

  // 4. Atualizar o contador do carrinho no carregamento
  updateCartCounter();
});

/* ==========================================================================
   TEMA CLARO / ESCURO (THEME MANAGEMENT)
   ========================================================================== */
function initTheme() {
  const savedTheme = localStorage.getItem('jvcustom_theme') || 'dark';
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
  } else {
    document.body.classList.remove('light-theme');
  }
}

function toggleTheme() {
  if (document.body.classList.contains('light-theme')) {
    document.body.classList.remove('light-theme');
    localStorage.setItem('jvcustom_theme', 'dark');
    showToast('Modo Escuro', 'Visualização alterada para o modo escuro.', 'success');
  } else {
    document.body.classList.add('light-theme');
    localStorage.setItem('jvcustom_theme', 'light');
    showToast('Modo Claro', 'Visualização alterada para o modo claro.', 'success');
  }
  window.dispatchEvent(new Event('themeChanged'));
}

/* ==========================================================================
   INJEÇÃO DINÂMICA DE LAYOUT
   ========================================================================== */
function injectHeader() {
  const headerContainer = document.getElementById('global-header');
  if (!headerContainer) return;

  headerContainer.className = 'header';

  // Obter sessão atual e items do carrinho
  const session = window.db ? window.db.getSession() : null;
  const currentPath = window.location.pathname;

  // Determinar qual link está ativo
  const isIndex = currentPath.endsWith('index.html') || currentPath.endsWith('/') || currentPath === '';
  const isShop = currentPath.endsWith('shop.html');
  const isCart = currentPath.endsWith('cart.html');
  const isProfile = currentPath.endsWith('profile.html');
  const isAdmin = currentPath.endsWith('admin.html');

  // Gerar HTML de autenticação / Menu do Utilizador
  let authHtml = '';
  if (session) {
    authHtml = `
      <div class="user-dropdown" id="userDropdown">
        <button class="user-menu-btn" aria-label="Menu do utilizador">
          <img src="${session.avatar}" alt="Avatar" class="user-avatar">
          <span class="user-menu-name">${session.name}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </button>
        <div class="dropdown-menu">
          <div class="dropdown-header">
            <div class="dropdown-header-name">${session.name}</div>
            <div class="dropdown-header-email">${session.email}</div>
          </div>
          <a href="profile.html" class="dropdown-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            O meu Perfil
          </a>
          ${session.role === 'admin' ? `
            <a href="admin.html" class="dropdown-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
              Painel Admin
            </a>
          ` : ''}
          <a href="#" class="dropdown-item danger" id="logoutBtn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
            Sair
          </a>
        </div>
      </div>
    `;
  } else {
    authHtml = `
      <a href="auth.html" class="btn btn-primary btn-sm">Iniciar Sessão</a>
    `;
  }

  headerContainer.innerHTML = `
    <div class="container">
      <div class="nav-container">
        <!-- Logo -->
        <a href="index.html" class="logo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4-4-1.79-4-4z"/><path d="M12 8v1M12 15v1M8 12H7M17 12h-1"/></svg>
          JV<span>Custom</span>
        </a>

        <!-- Menu de Navegação -->
        <ul class="nav-menu" id="navMenu">
          <li><a href="index.html" class="nav-link ${isIndex ? 'active' : ''}">Início</a></li>
          <li><a href="shop.html" class="nav-link ${isShop ? 'active' : ''}">Catálogo</a></li>
          ${session && session.role === 'admin' ? `<li><a href="admin.html" class="nav-link ${isAdmin ? 'active' : ''}">Administração</a></li>` : ''}
          ${session ? `<li><a href="profile.html" class="nav-link ${isProfile ? 'active' : ''}">Meu Perfil</a></li>` : ''}
        </ul>

        <!-- Ações do Cabeçalho -->
        <div class="nav-actions">
          <!-- Alternador de Tema -->
          <button class="icon-btn theme-toggle" id="themeToggleBtn" aria-label="Alternar tema claro/escuro">
            <svg class="icon-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            <svg class="icon-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
          </button>

          <!-- Carrinho -->
          <a href="cart.html" class="icon-btn" aria-label="Ver carrinho de compras">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
            <span class="cart-badge" id="cartBadgeCount" style="display: none;">0</span>
          </a>

          <!-- Menu de Conta / Login -->
          ${authHtml}

          <!-- Hamburguer Mobile -->
          <button class="icon-btn" id="mobileMenuBtn" aria-label="Abrir menu" style="display:none;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </button>
        </div>
      </div>
    </div>
  `;
}

function injectFooter() {
  const footerContainer = document.getElementById('global-footer');
  if (!footerContainer) return;

  footerContainer.className = 'footer';

  footerContainer.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <!-- Coluna Info -->
        <div class="footer-column">
          <a href="index.html" class="logo footer-info-logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4-4-1.79-4-4z"/></svg>
            JV<span>Custom</span>
          </a>
          <p class="footer-info-desc">
            A sua loja de eleição para peças de estética automóvel e acessórios performance. Transformamos o visual do seu carro com peças selecionadas para projetos únicos.
          </p>
        </div>

        <!-- Coluna Atalhos -->
        <div class="footer-column">
          <h3 class="footer-heading">Navegação</h3>
          <ul class="footer-links">
            <li><a href="index.html">Início</a></li>
            <li><a href="shop.html">Catálogo Completo</a></li>
            <li><a href="cart.html">Carrinho de Compras</a></li>
          </ul>
        </div>

        <!-- Coluna Categorias -->
        <div class="footer-column">
          <h3 class="footer-heading">Coleções</h3>
          <ul class="footer-links">
            <li><a href="shop.html?category=Jantes">Jantes Desportivas</a></li>
            <li><a href="shop.html?category=Escapes">Escapes Performance</a></li>
            <li><a href="shop.html?category=Ailerons">Ailerons e Exterior</a></li>
          </ul>
        </div>

        <!-- Coluna Newsletter -->
        <div class="footer-column">
          <h3 class="footer-heading">Newsletter</h3>
          <p class="footer-newsletter-text">Inscreva-se para novidades exclusivas e lançamentos de stock.</p>
          <form class="newsletter-form" id="newsletterForm">
            <input type="email" placeholder="O seu email" class="form-control" required>
            <button type="submit" class="btn btn-primary btn-sm" aria-label="Subscrever">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
            </button>
          </form>
        </div>
      </div>

      <!-- Fundo do Rodapé -->
      <div class="footer-bottom">
        <p>&copy; ${new Date().getFullYear()} JVCustom. Todos os direitos reservados. Trabalho Académico de Desenvolvimento Web.</p>
        <p>Desenvolvido com HTML5, CSS3 & JS Vanilla.</p>
      </div>
    </div>
  `;
}

/* ==========================================================================
   CONFIGURAÇÃO DE EVENTOS E MUTAÇÕES
   ========================================================================== */
function setupGlobalEvents() {
  // Evento scroll para efeito dinâmico na barra de navegação
  window.addEventListener('scroll', () => {
    const header = document.getElementById('global-header');
    if (header) {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  });

  // Evento alternador de tema
  const themeBtn = document.getElementById('themeToggleBtn');
  if (themeBtn) {
    themeBtn.addEventListener('click', toggleTheme);
  }

  // Dropdown do utilizador — toggle por clique (funciona em mobile e desktop)
  const userDropdown = document.getElementById('userDropdown');
  if (userDropdown) {
    const btn = userDropdown.querySelector('.user-menu-btn');
    const menu = userDropdown.querySelector('.dropdown-menu');
    if (btn && menu) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('open');
      });
      // Fechar ao clicar fora
      document.addEventListener('click', (e) => {
        if (!userDropdown.contains(e.target)) {
          menu.classList.remove('open');
        }
      });
    }
  }

  // Menu mobile — hamburguer toggle
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const navMenu = document.getElementById('navMenu');
  if (mobileBtn && navMenu) {
    // Mostrar botão hamburguer apenas em mobile (detectar via JS)
    const checkMobile = () => {
      if (window.innerWidth <= 768) {
        mobileBtn.style.display = 'flex';
      } else {
        mobileBtn.style.display = 'none';
        navMenu.style.display = '';
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    mobileBtn.addEventListener('click', () => {
      const isOpen = navMenu.classList.contains('nav-menu-open');
      if (isOpen) {
        navMenu.classList.remove('nav-menu-open');
        navMenu.style.display = '';
      } else {
        navMenu.classList.add('nav-menu-open');
        navMenu.style.display = 'flex';
      }
    });
  }

  // Evento Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.db) {
        window.db.setSession(null);
        showToast('Sessão Terminada', 'Logout efetuado com sucesso.', 'info');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1200);
      }
    });
  }

  // Subscrever newsletter
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = newsletterForm.querySelector('input').value;
      showToast('Obrigado!', `O email ${emailInput} foi subscrito com sucesso.`, 'success');
      newsletterForm.reset();
    });
  }

  // Ouvir alterações de carrinho vindas de outros scripts do mesmo documento
  window.addEventListener('cartUpdated', updateCartCounter);
}

function updateCartCounter() {
  const badge = document.getElementById('cartBadgeCount');
  if (!badge || !window.db) return;

  const cart = window.db.getCart();
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  if (totalItems > 0) {
    badge.innerText = totalItems;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

/* ==========================================================================
   TOAST NOTIFICATION SYSTEM (NOTIFICAÇÕES FLUTUANTES)
   ========================================================================== */
function showToast(title, message, type = 'success') {
  // Criar contentor de toasts se não existir
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  // Criar elemento de toast
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  // Ícone de acordo com o tipo
  let icon = '';
  switch (type) {
    case 'success':
      icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>';
      break;
    case 'warning':
      icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>';
      break;
    case 'danger':
      icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></svg>';
      break;
    case 'info':
    default:
      icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>';
      break;
  }

  toast.innerHTML = `
    <div class="toast-icon">${icon}</div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <div class="toast-close">&times;</div>
  `;

  // Adicionar ao contentor
  container.appendChild(toast);

  // Ação de fechar manual
  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', () => {
    dismissToast(toast);
  });

  // Auto-fechar após 4 segundos
  setTimeout(() => {
    dismissToast(toast);
  }, 4000);
}

function dismissToast(toast) {
  if (toast.parentNode) {
    toast.classList.add('toast-hide');
    // Esperar terminar a animação antes de remover do DOM
    toast.addEventListener('animationend', () => {
      toast.remove();
    });
  }
}

// Tornar a notificação disponível globalmente para outras páginas
window.showToast = showToast;
