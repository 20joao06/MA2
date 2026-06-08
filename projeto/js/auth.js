/**
 * JVCustom - Authentication Script
 * Este ficheiro gere as interações dos formulários de login e registo,
 * validações de campos, verificação de dados na DB local e redirecionamento.
 */

// 1. Função para Alternar Separadores (Tabs) entre Iniciar Sessão e Criar Conta
function switchTab(tab) {
  const tabLogin = document.getElementById('tabLogin');
  const tabRegister = document.getElementById('tabRegister');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  
  if (!tabLogin || !tabRegister || !loginForm || !registerForm) return;

  if (tab === 'login') {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
  } else {
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
  }
}

// Tornar a função disponível globalmente (necessário por estar associado ao onclick direto)
window.switchTab = switchTab;

document.addEventListener('DOMContentLoaded', () => {
  // Redirecionar se já estiver com sessão iniciada
  if (window.db && window.db.getSession()) {
    const session = window.db.getSession();
    window.location.href = session.role === 'admin' ? 'admin.html' : 'index.html';
    return;
  }

  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  // 2. Submissão do Formulário de LOGIN
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      
      if (!email || !password) {
        window.showToast('Erro de Validação', 'Por favor, preencha todos os campos.', 'warning');
        return;
      }

      if (window.db) {
        const user = window.db.getUserByEmail(email);
        
        if (user && user.password === password) {
          // Credenciais corretas -> Guardar na sessão
          window.db.setSession(user);
          
          window.showToast('Bem-vindo!', `Sessão iniciada com sucesso como ${user.name}.`, 'success');
          
          // Redirecionar consoante o cargo (admin vai para dashboard, user vai para home)
          setTimeout(() => {
            if (user.role === 'admin') {
              window.location.href = 'admin.html';
            } else {
              window.location.href = 'index.html';
            }
          }, 1200);
        } else {
          // Credenciais incorretas
          window.showToast('Falha no Login', 'Endereço de email ou palavra-passe incorretos.', 'danger');
        }
      }
    });
  }

  // 3. Submissão do Formulário de REGISTO
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('regName').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const password = document.getElementById('regPassword').value;
      const confirmPassword = document.getElementById('regConfirmPassword').value;
      const budget = document.getElementById('regBudget').value;
      const preference = document.getElementById('regPreference').value;
      
      // Validações básicas
      if (!name || !email || !password || !confirmPassword) {
        window.showToast('Campos em falta', 'Por favor, preencha todos os campos obrigatórios.', 'warning');
        return;
      }
      
      if (password !== confirmPassword) {
        window.showToast('Erro de Palavra-passe', 'As palavras-passe introduzidas não coincidem.', 'warning');
        return;
      }
      
      if (password.length < 4) {
        window.showToast('Palavra-passe Curta', 'A palavra-passe deve conter pelo menos 4 caracteres.', 'warning');
        return;
      }

      if (window.db) {
        // Criar estrutura do utilizador
        const newUser = {
          name,
          email,
          password,
          budget,
          preference,
          avatar: getRandomAvatar()
        };
        
        const success = window.db.registerUser(newUser);
        
        if (success) {
          window.showToast('Conta Criada!', 'A sua conta foi registada. A iniciar sessão...', 'success');
          
          // Iniciar sessão automaticamente
          const registeredUser = window.db.getUserByEmail(email);
          window.db.setSession(registeredUser);
          
          // Redirecionar para a home
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 1500);
        } else {
          window.showToast('Erro no Registo', 'Este endereço de email já se encontra registado no sistema.', 'danger');
        }
      }
    });
  }
});

// Função auxiliar para gerar um avatar aleatório
function getRandomAvatar() {
  const avatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop'
  ];
  const randomIndex = Math.floor(Math.random() * avatars.length);
  return avatars[randomIndex];
}
