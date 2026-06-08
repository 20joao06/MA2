/**
 * JVCustom - Central Data Management (LocalStorage Wrapper)
 * Este ficheiro gere a base de dados local utilizando o localStorage para persistência de dados.
 */

const DB_KEYS = {
  PRODUCTS: 'jvcustom_products_v2',
  USERS: 'jvcustom_users_v2',
  SESSION: 'jvcustom_session_v2',
  ORDERS: 'jvcustom_orders_v2',
  CART: 'jvcustom_cart_v2'
};

// Dados Iniciais (Seeding)

const INITIAL_PRODUCTS = [
  {
    "id": "prod-1",
    "name": "Akrapovič Evolution Line Titanium",
    "category": "Escapes",
    "price": 1899.0,
    "image": "assets/img/escape-titanium.png",
    "stock": 3,
    "rating": 4.9,
    "brand": "Akrapovič",
    "description": "Escape premium em titânio com ponteiras em carbono, indicado para projetos desportivos de elevada qualidade sonora e visual.",
    "specs": {
      "Marca": "Akrapovič",
      "Material": "Titânio com ponteiras carbono",
      "Som": "Desportivo grave",
      "Aplicação": "Modelos compactos/coupés com adaptação"
    }
  },
  {
    "id": "prod-2",
    "name": "Remus Sport Cat-Back Black Chrome",
    "category": "Escapes",
    "price": 899.0,
    "image": "assets/img/escape-titanium.png",
    "stock": 6,
    "rating": 4.7,
    "brand": "Remus",
    "description": "Sistema cat-back em inox com ponteiras pretas cromadas e sonoridade agressiva mas utilizável diariamente.",
    "specs": {
      "Marca": "Remus",
      "Material": "Inox 304",
      "Ponteiras": "Black chrome 102 mm",
      "Homologação": "Uso simbólico/consultar compatibilidade"
    }
  },
  {
    "id": "prod-3",
    "name": "Borla S-Type Performance Exhaust",
    "category": "Escapes",
    "price": 1199.0,
    "image": "assets/img/difusor-carbono.png",
    "stock": 4,
    "rating": 4.8,
    "brand": "Borla",
    "description": "Linha de escape com acabamento polido e presença visual forte, pensada para uma traseira mais agressiva.",
    "specs": {
      "Marca": "Borla",
      "Material": "Aço inoxidável",
      "Acabamento": "Polido",
      "Inclui": "Tubagem, abraçadeiras e ponteiras"
    }
  },
  {
    "id": "prod-4",
    "name": "HKS Hi-Power Spec-L II",
    "category": "Escapes",
    "price": 749.0,
    "image": "assets/img/escape-titanium.png",
    "stock": 5,
    "rating": 4.6,
    "brand": "HKS",
    "description": "Escape leve estilo JDM com ponteira queimada, ideal para projetos japoneses e builds de aspeto racing.",
    "specs": {
      "Marca": "HKS",
      "Estilo": "JDM racing",
      "Ponteira": "Titanium burnt tip",
      "Peso": "Construção leve"
    }
  },
  {
    "id": "prod-5",
    "name": "OZ Racing Ultraleggera 18\"",
    "category": "Jantes",
    "price": 1349.0,
    "image": "assets/img/jantes-forged.png",
    "stock": 5,
    "rating": 4.8,
    "brand": "OZ Racing",
    "description": "Conjunto de jantes leves multi-raios, muito usado em projetos desportivos com visual limpo e agressivo.",
    "specs": {
      "Marca": "OZ Racing",
      "Tamanho": "18 polegadas",
      "Acabamento": "Matt graphite",
      "Conjunto": "4 unidades"
    }
  },
  {
    "id": "prod-6",
    "name": "BBS CH-R II 19\" Satin Black",
    "category": "Jantes",
    "price": 2199.0,
    "image": "assets/img/jantes-forged.png",
    "stock": 2,
    "rating": 4.9,
    "brand": "BBS",
    "description": "Jantes premium de desenho icónico, ideais para builds de alto nível com postura elegante.",
    "specs": {
      "Marca": "BBS",
      "Tamanho": "19 polegadas",
      "Acabamento": "Satin black",
      "Estilo": "Premium motorsport"
    }
  },
  {
    "id": "prod-7",
    "name": "Rotiform LAS-R 18\" Gloss Silver",
    "category": "Jantes",
    "price": 1099.0,
    "image": "assets/img/jantes-forged.png",
    "stock": 7,
    "rating": 4.6,
    "brand": "Rotiform",
    "description": "Jantes com desenho moderno e stance visual, indicadas para projetos show car e tuning urbano.",
    "specs": {
      "Marca": "Rotiform",
      "Tamanho": "18 polegadas",
      "Acabamento": "Gloss silver",
      "Perfil": "Stance / show car"
    }
  },
  {
    "id": "prod-8",
    "name": "Rays Volk Racing TE37 17\" Bronze",
    "category": "Jantes",
    "price": 2499.0,
    "image": "assets/img/jantes-forged.png",
    "stock": 3,
    "rating": 5.0,
    "brand": "Rays",
    "description": "Jantes lendárias de seis raios em bronze, associadas a projetos japoneses de referência.",
    "specs": {
      "Marca": "Rays Volk Racing",
      "Tamanho": "17 polegadas",
      "Acabamento": "Bronze",
      "Construção": "Forged"
    }
  },
  {
    "id": "prod-9",
    "name": "APR Performance GTC-200 Carbon Wing",
    "category": "Ailerons",
    "price": 899.0,
    "image": "assets/img/aileron-carbono.png",
    "stock": 4,
    "rating": 4.9,
    "brand": "APR Performance",
    "description": "Aileron em fibra de carbono com suporte GT, criado para presença visual agressiva e estilo de pista.",
    "specs": {
      "Marca": "APR Performance",
      "Material": "Carbon fiber visual",
      "Largura": "Universal com adaptação",
      "Acabamento": "Verniz brilhante UV"
    }
  },
  {
    "id": "prod-10",
    "name": "Maxton Design Spoiler Cap V2",
    "category": "Ailerons",
    "price": 189.0,
    "image": "assets/img/aileron-carbono.png",
    "stock": 9,
    "rating": 4.5,
    "brand": "Maxton Design",
    "description": "Extensão de spoiler discreta para reforçar a traseira sem perder elegância no uso diário.",
    "specs": {
      "Marca": "Maxton Design",
      "Material": "ABS gloss black",
      "Montagem": "Fita e parafusos",
      "Estilo": "OEM+"
    }
  },
  {
    "id": "prod-11",
    "name": "Seibon Carbon Ducktail Spoiler",
    "category": "Ailerons",
    "price": 529.0,
    "image": "assets/img/aileron-carbono.png",
    "stock": 3,
    "rating": 4.7,
    "brand": "Seibon",
    "description": "Spoiler ducktail com acabamento carbono, perfeito para uma traseira mais larga e desportiva.",
    "specs": {
      "Marca": "Seibon",
      "Material": "Carbon look",
      "Instalação": "Traseira/mala",
      "Estilo": "Ducktail"
    }
  },
  {
    "id": "prod-12",
    "name": "K&N Typhoon Intake Kit",
    "category": "Filtros de Ar",
    "price": 279.0,
    "image": "assets/img/filtro-ar.png",
    "stock": 8,
    "rating": 4.7,
    "brand": "K&N",
    "description": "Kit de admissão de alto fluxo com filtro lavável e tubo de admissão, combinando estética de motor e performance simbólica.",
    "specs": {
      "Marca": "K&N",
      "Tipo": "Kit de admissão",
      "Filtro": "Lavável/reutilizável",
      "Aplicação": "Universal com adaptação"
    }
  },
  {
    "id": "prod-13",
    "name": "Pipercross Performance Panel Filter",
    "category": "Filtros de Ar",
    "price": 69.0,
    "image": "assets/img/filtro-ar.png",
    "stock": 18,
    "rating": 4.4,
    "brand": "Pipercross",
    "description": "Filtro de substituição lavável para projetos de personalização acessível e manutenção simples.",
    "specs": {
      "Marca": "Pipercross",
      "Tipo": "Filtro painel",
      "Material": "Espuma filtrante",
      "Manutenção": "Lavável"
    }
  },
  {
    "id": "prod-14",
    "name": "Eventuri Carbon Intake Cover",
    "category": "Filtros de Ar",
    "price": 689.0,
    "image": "assets/img/filtro-ar.png",
    "stock": 2,
    "rating": 4.9,
    "brand": "Eventuri",
    "description": "Cobertura de admissão com visual carbono para transformar a apresentação do compartimento do motor.",
    "specs": {
      "Marca": "Eventuri",
      "Material": "Carbon fiber visual",
      "Acabamento": "Gloss carbon",
      "Perfil": "Premium engine bay"
    }
  },
  {
    "id": "prod-15",
    "name": "3M Gloss Black Roof Wrap Kit",
    "category": "Adesivos",
    "price": 139.0,
    "image": "assets/img/kit-adesivos.png",
    "stock": 11,
    "rating": 4.6,
    "brand": "3M",
    "description": "Kit de vinil gloss black para teto, ideal para criar contraste e visual desportivo.",
    "specs": {
      "Marca": "3M",
      "Acabamento": "Gloss black",
      "Aplicação": "Teto/capot/detalhes",
      "Resistência": "UV e intempérie"
    }
  },
  {
    "id": "prod-16",
    "name": "Avery Dennison Racing Stripe Kit",
    "category": "Adesivos",
    "price": 99.0,
    "image": "assets/img/kit-adesivos.png",
    "stock": 14,
    "rating": 4.5,
    "brand": "Avery Dennison",
    "description": "Faixas racing em vinil premium para laterais ou capot, com aplicação limpa e efeito visual imediato.",
    "specs": {
      "Marca": "Avery Dennison",
      "Material": "Vinil premium",
      "Cores": "Vermelho/cinza/preto",
      "Aplicação": "Laterais/capot"
    }
  },
  {
    "id": "prod-17",
    "name": "Oracal Door Sponsor Decal Pack",
    "category": "Adesivos",
    "price": 39.0,
    "image": "assets/img/kit-adesivos.png",
    "stock": 25,
    "rating": 4.3,
    "brand": "Oracal",
    "description": "Pack de autocolantes de estilo competição para personalização de portas, vidros e detalhes exteriores.",
    "specs": {
      "Marca": "Oracal",
      "Conteúdo": "Pack multi-decals",
      "Estilo": "Racing/sponsor",
      "Remoção": "Sem resíduos excessivos"
    }
  },
  {
    "id": "prod-18",
    "name": "Maxton Design Rear Diffuser Gloss Black",
    "category": "Difusores",
    "price": 259.0,
    "image": "assets/img/difusor-carbono.png",
    "stock": 6,
    "rating": 4.7,
    "brand": "Maxton Design",
    "description": "Difusor traseiro em preto gloss para melhorar a presença visual da traseira e combinar com escapes desportivos.",
    "specs": {
      "Marca": "Maxton Design",
      "Material": "ABS gloss black",
      "Zona": "Traseira",
      "Montagem": "Parafusos/fita automóvel"
    }
  },
  {
    "id": "prod-19",
    "name": "Rieger Front Splitter RS Line",
    "category": "Spoilers",
    "price": 219.0,
    "image": "assets/img/difusor-carbono.png",
    "stock": 7,
    "rating": 4.5,
    "brand": "Rieger",
    "description": "Splitter dianteiro para dar postura mais baixa e agressiva ao para-choques frontal.",
    "specs": {
      "Marca": "Rieger",
      "Material": "ABS",
      "Zona": "Frontal",
      "Estilo": "RS line"
    }
  },
  {
    "id": "prod-20",
    "name": "CarbonLook Side Skirts Kit",
    "category": "Body Kits",
    "price": 349.0,
    "image": "assets/img/aileron-carbono.png",
    "stock": 5,
    "rating": 4.6,
    "brand": "CarbonLook",
    "description": "Conjunto de embaladeiras laterais em acabamento carbono visual para reforçar a linha lateral do veículo.",
    "specs": {
      "Marca": "CarbonLook",
      "Material": "ABS carbon look",
      "Zona": "Laterais",
      "Inclui": "Par esquerdo/direito"
    }
  },
  {
    "id": "prod-21",
    "name": "Pandem Style Widebody Arch Set",
    "category": "Body Kits",
    "price": 1199.0,
    "image": "assets/img/hero-garage.png",
    "stock": 2,
    "rating": 4.8,
    "brand": "Pandem Style",
    "description": "Kit de alargamento de cavas para projetos show car com visual extremo e stance agressivo.",
    "specs": {
      "Marca": "Pandem Style",
      "Composição": "Cavas dianteiras/traseiras",
      "Aplicação": "Projeto com adaptação",
      "Estilo": "Widebody"
    }
  },
  {
    "id": "prod-22",
    "name": "VLAND Full LED Tail Lights Smoke",
    "category": "Luzes LED",
    "price": 329.0,
    "image": "assets/img/hero-garage.png",
    "stock": 6,
    "rating": 4.6,
    "brand": "VLAND",
    "description": "Farolins LED fumados com assinatura moderna, ideais para renovar a traseira do carro.",
    "specs": {
      "Marca": "VLAND",
      "Tipo": "Tail lights LED",
      "Acabamento": "Smoke",
      "Estilo": "OEM+/modernizado"
    }
  },
  {
    "id": "prod-23",
    "name": "Morimoto XB LED Fog Lights",
    "category": "Luzes LED",
    "price": 239.0,
    "image": "assets/img/hero-garage.png",
    "stock": 4,
    "rating": 4.7,
    "brand": "Morimoto",
    "description": "Faróis de nevoeiro LED premium para atualização estética e visual frontal mais moderno.",
    "specs": {
      "Marca": "Morimoto",
      "Tipo": "LED fog lights",
      "Cor": "Branco frio",
      "Montagem": "Plug & play simbólico"
    }
  },
  {
    "id": "prod-24",
    "name": "Eibach Pro-Kit Lowering Springs",
    "category": "Suspensão",
    "price": 299.0,
    "image": "assets/img/jantes-forged.png",
    "stock": 7,
    "rating": 4.8,
    "brand": "Eibach",
    "description": "Molas de rebaixamento para melhorar a postura visual do carro e complementar jantes de maior dimensão.",
    "specs": {
      "Marca": "Eibach",
      "Rebaixamento": "Aprox. 25-35 mm",
      "Estilo": "Stance OEM+",
      "Inclui": "Conjunto de 4 molas"
    }
  }
];


// Utilizadores iniciais: administrador padrão e cliente exemplo
const INITIAL_USERS = [
  {
    email: 'admin@jvcustom.pt',
    password: 'admin',
    name: 'Administrador JVCustom',
    role: 'admin',
    avatar: 'assets/img/hero-garage.png',
    budget: 'High',
    preference: 'Exigente'
  },
  {
    email: 'cliente@jvcustom.pt',
    password: 'cliente123',
    name: 'Cliente JVCustom',
    role: 'user',
    avatar: 'assets/img/jantes-forged.png',
    budget: 'Medium',
    preference: 'Prático'
  }
];

// Inicialização da Base de Dados
function initDB() {
  if (!localStorage.getItem(DB_KEYS.PRODUCTS)) {
    localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  }
  if (!localStorage.getItem(DB_KEYS.USERS)) {
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(DB_KEYS.ORDERS)) {
    localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify([]));
  }
}

// Inicializar imediatamente ao carregar o script
initDB();

// Métodos Auxiliares Globais
const db = {
  // --- PRODUTOS ---
  getProducts() {
    return JSON.parse(localStorage.getItem(DB_KEYS.PRODUCTS)) || [];
  },
  
  saveProducts(products) {
    localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(products));
  },
  
  getProductById(id) {
    const products = this.getProducts();
    return products.find(p => p.id === id);
  },
  
  updateProduct(updatedProduct) {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === updatedProduct.id);
    if (index !== -1) {
      products[index] = updatedProduct;
      this.saveProducts(products);
      return true;
    }
    return false;
  },
  
  addProduct(newProduct) {
    const products = this.getProducts();
    newProduct.id = 'prod-' + Date.now();
    products.push(newProduct);
    this.saveProducts(products);
    return newProduct;
  },
  
  deleteProduct(id) {
    let products = this.getProducts();
    products = products.filter(p => p.id !== id);
    this.saveProducts(products);
  },

  // --- UTILIZADORES & SESSÃO ---
  getUsers() {
    return JSON.parse(localStorage.getItem(DB_KEYS.USERS)) || [];
  },
  
  saveUsers(users) {
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
  },
  
  getUserByEmail(email) {
    const users = this.getUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },
  
  registerUser(user) {
    const users = this.getUsers();
    if (users.some(u => u.email.toLowerCase() === user.email.toLowerCase())) {
      return false; // Utilizador já existe
    }
    user.role = 'user'; // Padrão
    if (!user.avatar) {
      user.avatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop';
    }
    users.push(user);
    this.saveUsers(users);
    return true;
  },
  
  updateUser(email, updatedData) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (index !== -1) {
      users[index] = { ...users[index], ...updatedData };
      this.saveUsers(users);
      // Se for o utilizador atual em sessão, atualizar também a sessão
      const session = this.getSession();
      if (session && session.email.toLowerCase() === email.toLowerCase()) {
        this.setSession(users[index]);
      }
      return true;
    }
    return false;
  },
  
  getSession() {
    return JSON.parse(localStorage.getItem(DB_KEYS.SESSION)) || null;
  },
  
  setSession(user) {
    if (user) {
      localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(user));
    } else {
      localStorage.removeItem(DB_KEYS.SESSION);
    }
  },

  // --- CARRINHO DE COMPRAS ---
  getCart() {
    return JSON.parse(localStorage.getItem(DB_KEYS.CART)) || [];
  },
  
  saveCart(cart) {
    localStorage.setItem(DB_KEYS.CART, JSON.stringify(cart));
    // Emitir um evento customizado para notificar outras partes do site sobre mudanças no carrinho
    window.dispatchEvent(new Event('cartUpdated'));
  },
  
  addToCart(productId, qty = 1) {
    const cart = this.getCart();
    const product = this.getProductById(productId);
    
    if (!product) return { success: false, message: 'Produto não encontrado.' };
    if (product.stock <= 0) return { success: false, message: 'Produto sem stock disponível.' };
    
    const existingIndex = cart.findIndex(item => item.productId === productId);
    
    if (existingIndex !== -1) {
      const newQty = cart[existingIndex].quantity + qty;
      if (newQty > product.stock) {
        return { success: false, message: `Apenas existem ${product.stock} unidades em stock.` };
      }
      cart[existingIndex].quantity = newQty;
    } else {
      if (qty > product.stock) {
        return { success: false, message: `Apenas existem ${product.stock} unidades em stock.` };
      }
      cart.push({ productId, quantity: qty, price: product.price });
    }
    
    this.saveCart(cart);
    return { success: true, message: `${product.name} adicionado ao carrinho.` };
  },
  
  updateCartQuantity(productId, qty) {
    let cart = this.getCart();
    const product = this.getProductById(productId);
    
    if (!product) return false;
    
    const index = cart.findIndex(item => item.productId === productId);
    if (index !== -1) {
      if (qty <= 0) {
        cart.splice(index, 1);
      } else {
        if (qty > product.stock) return false; // Stock insuficiente
        cart[index].quantity = qty;
      }
      this.saveCart(cart);
      return true;
    }
    return false;
  },
  
  removeFromCart(productId) {
    let cart = this.getCart();
    cart = cart.filter(item => item.productId !== productId);
    this.saveCart(cart);
  },
  
  clearCart() {
    this.saveCart([]);
  },

  // --- ENCOMENDAS (ORDERS) ---
  getOrders() {
    return JSON.parse(localStorage.getItem(DB_KEYS.ORDERS)) || [];
  },
  
  saveOrders(orders) {
    localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(orders));
  },
  
  checkout(shippingMethod = 'standard') {
    const cart = this.getCart();
    const session = this.getSession();
    
    if (cart.length === 0) return { success: false, message: 'O carrinho está vazio.' };
    if (!session) return { success: false, message: 'Por favor, inicie sessão para comprar.' };
    
    const products = this.getProducts();
    
    // Validar stock de todos os itens antes de efetuar a transação
    for (const item of cart) {
      const product = products.find(p => p.id === item.productId);
      if (!product || product.stock < item.quantity) {
        return { 
          success: false, 
          message: `Stock insuficiente para o item: ${product ? product.name : 'Produto Desconhecido'}` 
        };
      }
    }
    
    // Deduzir stock
    cart.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      product.stock -= item.quantity;
    });
    this.saveProducts(products);
    
    // Calcular custos
    const itemsSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingCost = shippingMethod === 'express' ? 15.00 : 4.90;
    const taxes = itemsSubtotal * 0.23; // 23% IVA simbólico incluído no subtotal ou extra
    const finalTotal = itemsSubtotal + shippingCost;
    
    // Guardar a encomenda
    const orders = this.getOrders();
    const newOrder = {
      id: 'ord-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      userEmail: session.email,
      date: new Date().toISOString(),
      items: cart.map(item => {
        const prod = this.getProductById(item.productId);
        return {
          productId: item.productId,
          name: prod.name,
          price: item.price,
          quantity: item.quantity,
          image: prod.image
        };
      }),
      shippingCost,
      subtotal: itemsSubtotal,
      total: finalTotal,
      status: 'Processado'
    };
    
    orders.unshift(newOrder); // Adicionar no início (mais recente primeiro)
    this.saveOrders(orders);
    
    // Limpar carrinho
    this.clearCart();
    
    return { success: true, order: newOrder };
  }
};

// Exportar globalmente para os scripts das páginas utilizarem diretamente
window.db = db;
