// script.js - Updated version with Dialogflow Messenger integration
const fakeDatabase = {
  products: [
    {
      id: 1,
      name: "Organic Apples",
      price: 2.99,
      description: "Fresh organic apples from local farms",
      image: "https://via.placeholder.com/150",
      unit: "bag",
      pluralUnit: "bags",
      stock: 10
    },
    {
      id: 2,
      name: "Whole Grain Bread",
      price: 3.49,
      description: "Artisan whole grain bread",
      image: "https://via.placeholder.com/150",
      unit: "loaf",
      pluralUnit: "loaves",
      stock: 5
    },
    {
      id: 3,
      name: "Free Range Eggs",
      price: 4.99,
      description: "Dozen free range eggs",
      image: "https://via.placeholder.com/150",
      unit: "dozen",
      pluralUnit: "dozens",
      stock: 8
    },
    {
      id: 4,
      name: "Organic Spinach",
      price: 3.99,
      description: "Fresh organic spinach leaves",
      image: "https://via.placeholder.com/150",
      unit: "bunch",
      pluralUnit: "bunches",
      stock: 7
    },
    {
      id: 5,
      name: "Almond Milk",
      price: 2.49,
      description: "Unsweetened almond milk",
      image: "https://via.placeholder.com/150",
      unit: "carton",
      pluralUnit: "cartons",
      stock: 12
    },
    {
      id: 6,
      name: "Avocados",
      price: 1.99,
      description: "Ripe Hass avocados",
      image: "https://via.placeholder.com/150",
      unit: "piece",
      pluralUnit: "pieces",
      stock: 15
    }
  ],
  
  getAllProducts: function() {
    return this.products;
  },
  
  getStock: function(productId) {
    const product = this.products.find(p => p.id == productId);
    return product ? product.stock : 0;
  },
  
  decreaseStock: function(productId, amount) {
    const product = this.products.find(p => p.id == productId);
    if (product && product.stock >= amount) {
      product.stock -= amount;
      return true;
    }
    return false;
  }
};

function init() {
  if (typeof fakeDatabase === 'undefined') {
    console.error("Database not loaded!");
    document.getElementById('productGrid').innerHTML = 
      '<p style="color:red">Error: Could not load products</p>';
    return;
  }

  renderProducts();
  setupChatbotEvents();
}

function renderProducts() {
  const productGrid = document.getElementById('productGrid');
  if (!productGrid) return;

  productGrid.innerHTML = '';

  fakeDatabase.getAllProducts().forEach(function(product) {
    const stock = fakeDatabase.getStock(product.id);
    const unit = stock === 1 ? product.unit : product.pluralUnit;

    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p>$${product.price.toFixed(2)}</p>
      <p class="description">${product.description}</p>
      <p class="stock-info">In stock: ${stock} ${unit}</p>
      <button class="buy-btn" data-product="${product.id}">Buy 1</button>
    `;
    productGrid.appendChild(card);
  });

  document.querySelectorAll('.buy-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const productId = parseInt(this.getAttribute('data-product'));
      if (fakeDatabase.decreaseStock(productId, 1)) {
        const product = fakeDatabase.products.find(p => p.id == productId);
        sendPurchaseToChatbot(product);
        renderProducts();
      } else {
        alert('Not enough stock available!');
      }
    });
  });
}

function setupChatbotEvents() {
  const dfMessenger = document.querySelector('df-messenger');
  
  if (!dfMessenger) {
    console.warn('Dialogflow Messenger not found');
    return;
  }

  // When user sends a message
  dfMessenger.addEventListener('df-message-sent', function(event) {
    console.log('User asked:', event.detail.message);
  });

  // When bot responds
  dfMessenger.addEventListener('df-response-received', function(event) {
    console.log('Bot replied:', event.detail.response);
    
    // Check if response contains product info
    if (event.detail.response.queryResult.fulfillmentText.includes("product")) {
      highlightRelevantProduct(event.detail.response.queryResult.parameters.product);
    }
  });
}

function sendPurchaseToChatbot(product) {
  const dfMessenger = document.querySelector('df-messenger');
  if (dfMessenger) {
    const message = `I just bought ${product.name} for $${product.price.toFixed(2)}`;
    dfMessenger.sendTextQuery(message);
    
    // Show purchase confirmation in chat
    const chatContainer = dfMessenger.shadowRoot.querySelector('df-messenger-chat');
    if (chatContainer) {
      const confirmation = document.createElement('div');
      confirmation.className = 'user-message';
      confirmation.textContent = `Purchase confirmed: ${product.name}`;
      chatContainer.appendChild(confirmation);
    }
  }
}

function highlightRelevantProduct(productName) {
  const products = document.querySelectorAll('.product-card');
  products.forEach(card => {
    if (card.querySelector('h3').textContent.toLowerCase().includes(productName.toLowerCase())) {
      card.style.boxShadow = '0 0 0 2px #4CAF50';
      setTimeout(() => {
        card.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
      }, 2000);
    }
  });
}

// Start after full page load
window.addEventListener('load', init);