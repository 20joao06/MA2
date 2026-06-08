/**
 * JVCustom - User Profile Script
 * Este ficheiro gere a área de cliente:
 * - Validação de sessão ativa (com redirecionamento automático)
 * - Edição de dados do utilizador (Nome, Avatar, Preferências de Recomendação)
 * - Seleção interativa de fotos de avatar
 * - Exibição detalhada do histórico de encomendas simbólicas
 */

document.addEventListener('DOMContentLoaded', () => {
  if (!window.db) return;

  // 1. Validar Sessão
  const session = window.db.getSession();
  if (!session) {
    window.showToast('Acesso Negado', 'Inicie sessão para aceder à sua área de cliente.', 'warning');
    setTimeout(() => {
      window.location.href = 'auth.html';
    }, 1500);
    return;
  }

  // Avatares Predefinidos para Escolha
  const PRESET_AVATARS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop'
  ];

  let selectedAvatar = session.avatar;

  // Renderizar o Perfil
  renderProfile();

  // 2. Renderização Central do Perfil e Histórico
  function renderProfile() {
    const container = document.getElementById('profileViewContainer');
    if (!container) return;

    // Filtrar encomendas do utilizador atual
    const allOrders = window.db.getOrders();
    const userOrders = allOrders.filter(ord => ord.userEmail.toLowerCase() === session.email.toLowerCase());

    // Gerar HTML das Encomendas
    let ordersListHtml = '';
    if (userOrders.length === 0) {
      ordersListHtml = `
        <div class="empty-orders">
          <svg style="color: var(--text-muted); margin-bottom: 16px;" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
          <p style="font-size: 15px; margin-bottom: 20px;">Ainda não efetuou nenhuma compra simbólica.</p>
          <a href="shop.html" class="btn btn-primary btn-sm">Ir para a Loja</a>
        </div>
      `;
    } else {
      ordersListHtml = `
        <div class="order-list">
          ${userOrders.map(ord => {
            const dateStr = new Date(ord.date).toLocaleString('pt-PT', { 
              year: 'numeric', month: 'long', day: 'numeric', 
              hour: '2-digit', minute: '2-digit' 
            });
            
            const itemsRowsHtml = ord.items.map(item => `
              <div class="order-item-row">
                <img src="${item.image}" alt="${item.name}" class="order-item-img">
                <div class="order-item-info">
                  <div style="font-weight: 600;">${item.name}</div>
                  <div class="order-item-qty">Qtd: ${item.quantity} x ${item.price.toFixed(2)} €</div>
                </div>
                <div class="order-item-price">${(item.price * item.quantity).toFixed(2)} €</div>
              </div>
            `).join('');

            return `
              <div class="order-card">
                <!-- Topo do Card -->
                <div class="order-header">
                  <div>
                    <span style="color: var(--text-muted)">ID da Encomenda</span><br>
                    <span class="order-id">${ord.id}</span>
                  </div>
                  <div style="text-align: right;">
                    <span style="color: var(--text-muted)">Efetuada em</span><br>
                    <span class="order-date">${dateStr}</span>
                  </div>
                </div>
                
                <!-- Corpo com Lista de Itens -->
                <div class="order-body">
                  <div class="order-items-grid">
                    ${itemsRowsHtml}
                  </div>
                </div>
                
                <!-- Fundo do Card com Total -->
                <div class="order-footer">
                  <span class="order-status">Processado & Pronto</span>
                  <div>
                    <span style="font-size: 12px; color: var(--text-muted); margin-right: 8px;">Portes: ${ord.shippingCost.toFixed(2)} €</span>
                    <span class="order-total-price">Total: ${ord.total.toFixed(2)} €</span>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    // Gerar grelha de seleção de avatar
    const avatarsHtml = PRESET_AVATARS.map(av => `
      <img src="${av}" class="avatar-option ${av === selectedAvatar ? 'selected' : ''}" onclick="selectAvatarOption('${av}')" alt="Opção de Avatar">
    `).join('');

    // Injetar HTML Completo do Perfil
    container.innerHTML = `
      <div class="profile-grid">
        <!-- Coluna Esquerda: Informações do Perfil -->
        <div class="profile-sidebar">
          <img src="${session.avatar}" alt="Avatar" class="profile-pic-large" id="profileDisplayPic">
          <h2 class="profile-name">${session.name}</h2>
          <p class="profile-email">${session.email}</p>
          
          <div class="profile-badges">
            <span class="profile-badge badge-budget">Orçamento: ${session.budget}</span>
            <span class="profile-badge badge-pref">Estilo: ${session.preference}</span>
          </div>

          <!-- Formulário de Edição -->
          <form id="profileEditForm" style="text-align: left;">
            <div class="form-group">
              <label class="form-label" for="editName">Nome de Utilizador</label>
              <input type="text" id="editName" class="form-control" value="${session.name}" required>
            </div>
            
            <div class="form-group">
              <label class="form-label">Escolher Foto de Perfil</label>
              <div class="avatar-selection-grid">
                ${avatarsHtml}
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label" for="editBudget">Orçamento Mensal</label>
              <select id="editBudget" class="form-control">
                <option value="Low" ${session.budget === 'Low' ? 'selected' : ''}>Económico (Até 100 €)</option>
                <option value="Medium" ${session.budget === 'Medium' ? 'selected' : ''}>Moderado (Até 500 €)</option>
                <option value="High" ${session.budget === 'High' ? 'selected' : ''}>Premium / Sem Limites (500 €+)</option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label" for="editPreference">Nível de Exigência</label>
              <select id="editPreference" class="form-control">
                <option value="Económico" ${session.preference === 'Económico' ? 'selected' : ''}>Preço/Benefício</option>
                <option value="Prático" ${session.preference === 'Prático' ? 'selected' : ''}>Equilibrado / Funcional</option>
                <option value="Exigente" ${session.preference === 'Exigente' ? 'selected' : ''}>Máximo Desempenho / Luxo</option>
              </select>
            </div>
            
            <button type="submit" class="btn btn-primary btn-sm" style="width: 100%; margin-top: 10px;">
              Guardar Configurações
            </button>
          </form>
          
          <button class="btn btn-secondary btn-sm" id="profileLogoutBtn" style="width: 100%; margin-top: 12px;">
            Terminar Sessão
          </button>
        </div>

        <!-- Coluna Direita: Histórico de Transações -->
        <div class="history-card">
          <h2 class="history-title">Histórico de Encomendas</h2>
          ${ordersListHtml}
        </div>
      </div>
    `;

    // Vincular submissão do formulário
    const editForm = document.getElementById('profileEditForm');
    if (editForm) {
      editForm.addEventListener('submit', handleProfileUpdate);
    }

    // Vincular botão de logout
    const logoutBtn = document.getElementById('profileLogoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        window.db.setSession(null);
        window.showToast('Sessão Terminada', 'Logout efetuado com sucesso.', 'info');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1200);
      });
    }
  }

  // 3. Escolher Opção de Avatar
  function selectAvatarOption(avatarUrl) {
    selectedAvatar = avatarUrl;
    
    // Atualizar classe selecionada visualmente
    const options = document.querySelectorAll('.avatar-option');
    options.forEach(opt => {
      if (opt.getAttribute('src') === avatarUrl) {
        opt.classList.add('selected');
      } else {
        opt.classList.remove('selected');
      }
    });

    // Atualizar preview instantâneo na barra lateral
    const previewImg = document.getElementById('profileDisplayPic');
    if (previewImg) previewImg.src = avatarUrl;
  }

  // Tornar função selecionadora disponível globalmente
  window.selectAvatarOption = selectAvatarOption;

  // 4. Efetuar atualização de perfil
  function handleProfileUpdate(e) {
    e.preventDefault();

    const nameVal = document.getElementById('editName').value.trim();
    const budgetVal = document.getElementById('editBudget').value;
    const prefVal = document.getElementById('editPreference').value;

    if (!nameVal) {
      window.showToast('Erro de Nome', 'O nome de utilizador não pode estar vazio.', 'warning');
      return;
    }

    const updatedData = {
      name: nameVal,
      avatar: selectedAvatar,
      budget: budgetVal,
      preference: prefVal
    };

    const success = window.db.updateUser(session.email, updatedData);

    if (success) {
      window.showToast('Perfil Guardado', 'As suas preferências e dados foram atualizados com sucesso.', 'success');
      
      // Forçar atualização do header global injetando-o novamente
      const headerContainer = document.getElementById('global-header');
      if (headerContainer && typeof injectHeader === 'function') {
        injectHeader();
        // Configurar novamente os listeners do header recém-injetado
        setupGlobalEvents();
      }

      // Re-renderizar o perfil atualizado
      setTimeout(() => {
        location.reload(); // Recarregar a página para sincronizar dados globais e locais
      }, 1000);
    } else {
      window.showToast('Erro ao Guardar', 'Ocorreu um erro ao atualizar os seus dados.', 'danger');
    }
  }
});
