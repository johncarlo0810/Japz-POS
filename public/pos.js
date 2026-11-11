(() => {
  const cards = [...document.querySelectorAll(".product-card")];
  if (!cards.length) return;

  const cart = new Map();
  const cartItems = document.getElementById("cart-items");
  const payload = document.getElementById("cart-payload");
  const subtotal = document.getElementById("subtotal");
  const total = document.getElementById("total");
  const chargeTotal = document.getElementById("charge-total");
  const amountPaid = document.getElementById("amount-paid");
  const changeDue = document.getElementById("change-due");
  const changeLabel = document.getElementById("change-label");
  const checkoutButton = document.getElementById("checkout-button");
  const paymentStepButton = document.getElementById("payment-step-button");
  const paymentDetails = document.getElementById("payment-details");
  const backToOrderButton = document.getElementById("back-to-order");
  const paymentMethodInput = document.getElementById("payment-method");
  const cashFields = document.getElementById("cash-fields");
  const clearCartBtn = document.getElementById("clear-cart");
  const menuSearch = document.getElementById("menu-search");
  const clearSearchBtn = document.getElementById("clear-search");
  const categoryList = document.getElementById("category-list");
  const searchToggle = document.getElementById("menu-search-toggle");
  const searchPanel = document.getElementById("menu-search-panel");
  
  // Order Type & Table
  const orderTypeSwitch = document.getElementById("order-type-switch");
  const orderTypeInput = document.getElementById("order-type-input");
  const tableSelectionPanel = document.getElementById("table-selection-panel");
  const tableChips = document.getElementById("table-chips");
  const tableNumberInput = document.getElementById("table-number-input");
  const selectedTableLabel = document.getElementById("selected-table-label");
  const customerNameInput = document.getElementById("customer-name-input");
  const customerNamePayload = document.getElementById("customer-name-payload");

  // Payment Buttons
  const paymentButtons = document.getElementById("payment-buttons");
  const quickCashRow = document.getElementById("quick-cash-row");

  const formatMoney = (cents) => `\u20B1${(cents / 100).toFixed(2)}`;

  // Update card quantity badges on menu
  const updateCardBadges = () => {
    cards.forEach((card) => {
      const id = Number(card.dataset.id);
      const badge = document.getElementById(`badge-${id}`);
      if (!badge) return;
      const item = cart.get(id);
      if (item && item.quantity > 0) {
        badge.textContent = `${item.quantity} in order`;
        badge.hidden = false;
        card.classList.add("in-cart");
      } else {
        badge.hidden = true;
        card.classList.remove("in-cart");
      }
    });
  };
  const render = () => {
    const items = [...cart.values()];
    const totalCents = items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
    cartItems.replaceChildren();

    if (!items.length) {
      const empty = document.createElement("div");
      empty.className = "cart-empty";
      empty.innerHTML = `
        <div class="cart-empty-circle">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
          </svg>
        </div>
        <strong>Your order is empty</strong>
        <small>Select delicious food from the menu to build order.</small>
      `;
      cartItems.append(empty);
    } else {
      for (const item of items) {
        const row = document.createElement("div");
        row.className = "cart-item";

        const image = document.createElement("img");
        image.className = "cart-item-image";
        image.src = item.image || "/images/food-placeholder.svg";
        image.alt = "";
        image.addEventListener("error", () => {
          image.src = "/images/food-placeholder.svg";
        }, { once: true });

        const detail = document.createElement("div");
        detail.className = "cart-item-detail";
        const name = document.createElement("strong");
        name.textContent = item.name;
        const price = document.createElement("small");
        price.textContent = `x${item.quantity}`;
        detail.append(name, price);

        const totalWrap = document.createElement("div");
        totalWrap.className = "cart-item-end";

        const lineTotal = document.createElement("strong");
        lineTotal.className = "cart-line-total";
        lineTotal.textContent = formatMoney(item.priceCents * item.quantity);

        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "btn-remove-item";
        removeBtn.textContent = "×";
        removeBtn.setAttribute("aria-label", `Remove ${item.name}`);
        removeBtn.addEventListener("click", () => {
          cart.delete(item.id);
          render();
        });

        totalWrap.append(lineTotal, removeBtn);
        row.append(image, detail, totalWrap);
        cartItems.append(row);
      }
    }

    updateCardBadges();

    // Payload & Summaries
    payload.value = JSON.stringify(items.map(({ id, quantity }) => ({ productId: id, quantity })));
    subtotal.textContent = formatMoney(totalCents);
    total.textContent = formatMoney(totalCents);
    chargeTotal.textContent = formatMoney(totalCents);
    paymentStepButton.disabled = !items.length;

    const isCash = paymentMethodInput.value === "cash";
    if (isCash) {
      const rawPaid = Number(amountPaid.value || 0);
      const paidCents = Math.round(rawPaid * 100);
      const diffCents = paidCents - totalCents;

      if (rawPaid > 0 && diffCents < 0) {
        changeLabel.textContent = "Insufficient by:";
        changeDue.textContent = formatMoney(Math.abs(diffCents));
        changeDue.className = "change-amount text-danger";
      } else {
        changeLabel.textContent = "Change Due:";
        changeDue.textContent = formatMoney(Math.max(0, diffCents));
        changeDue.className = "change-amount text-success";
      }

      checkoutButton.disabled = !items.length || paidCents < totalCents;
    } else {
      changeLabel.textContent = "Change Due:";
      changeDue.textContent = "\u20B10.00";
      changeDue.className = "change-amount";
      checkoutButton.disabled = !items.length;
    }
  };

  // Add product to cart when card or button is clicked
  cards.forEach((card) => {
    card.addEventListener("click", (e) => {
      const id = Number(card.dataset.id);
      const item = cart.get(id) || {
        id,
        name: card.dataset.name,
        image: card.dataset.image,
        priceCents: Math.round(Number(card.dataset.price) * 100),
        quantity: 0
      };
      if (item.quantity < 99) item.quantity += 1;
      cart.set(id, item);
      render();
    });
  });

  // Clear Cart
  clearCartBtn.addEventListener("click", () => {
    if (cart.size > 0 && confirm("Are you sure you want to clear the current order?")) {
      cart.clear();
      amountPaid.value = "";
      paymentDetails.hidden = true;
      checkoutButton.hidden = true;
      paymentStepButton.hidden = false;
      render();
    }
  });

  searchToggle.addEventListener("click", () => {
    searchPanel.hidden = !searchPanel.hidden;
    searchToggle.setAttribute("aria-expanded", String(!searchPanel.hidden));
    if (!searchPanel.hidden) menuSearch.focus();
  });

  // Menu Search
  menuSearch.addEventListener("input", (event) => {
    const query = event.target.value.trim().toLowerCase();
    clearSearchBtn.hidden = !query;
    filterProducts();
  });

  clearSearchBtn.addEventListener("click", () => {
    menuSearch.value = "";
    clearSearchBtn.hidden = true;
    filterProducts();
    menuSearch.focus();
  });

  // Category Filtering
  categoryList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    document.querySelectorAll(".category-chip").forEach((chip) => chip.classList.remove("selected"));
    button.classList.add("selected");
    filterProducts();
  });

  const filterProducts = () => {
    const query = menuSearch.value.trim().toLowerCase();
    const activeChip = document.querySelector(".category-chip.selected");
    const category = activeChip ? activeChip.dataset.category : "all";

    cards.forEach((card) => {
      const matchesCategory = category === "all" || card.dataset.category === category;
      const matchesSearch = !query || card.dataset.search.toLowerCase().includes(query);
      card.hidden = !(matchesCategory && matchesSearch);
    });
  };
  filterProducts();

  paymentStepButton.addEventListener("click", () => {
    if (!cart.size) return;
    paymentStepButton.hidden = true;
    paymentDetails.hidden = false;
    checkoutButton.hidden = false;
  });

  backToOrderButton.addEventListener("click", () => {
    paymentDetails.hidden = true;
    checkoutButton.hidden = true;
    paymentStepButton.hidden = false;
  });

  // Order Type Switcher (Dine-in / Takeaway)
  orderTypeSwitch.addEventListener("click", (event) => {
    const btn = event.target.closest(".type-btn");
    if (!btn) return;

    document.querySelectorAll(".type-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const orderType = btn.dataset.type;
    orderTypeInput.value = orderType;

    if (orderType === "takeaway") {
      tableSelectionPanel.style.display = "none";
      tableNumberInput.value = "Takeaway";
    } else {
      tableSelectionPanel.style.display = "block";
      const selectedChip = document.querySelector(".table-chip.selected");
      tableNumberInput.value = selectedChip ? selectedChip.dataset.table : "Table 01";
    }
  });

  // Table Chips Selection
  tableChips.addEventListener("click", (event) => {
    const chip = event.target.closest(".table-chip");
    if (!chip) return;
    document.querySelectorAll(".table-chip").forEach((c) => c.classList.remove("selected"));
    chip.classList.add("selected");
    const tableName = chip.dataset.table;
    tableNumberInput.value = tableName;
    selectedTableLabel.textContent = tableName;
  });

  // Customer Notes
  customerNameInput.addEventListener("input", (e) => {
    customerNamePayload.value = e.target.value.trim();
  });

  // Payment Method Selection
  paymentButtons.addEventListener("click", (event) => {
    const btn = event.target.closest(".pay-btn");
    if (!btn) return;

    document.querySelectorAll(".pay-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const method = btn.dataset.method;
    paymentMethodInput.value = method;

    const isCash = method === "cash";
    cashFields.hidden = !isCash;
    amountPaid.required = isCash;

    render();
  });

  // Quick Cash Denomination Buttons
  quickCashRow.addEventListener("click", (event) => {
    const btn = event.target.closest(".quick-cash-btn");
    if (!btn) return;

    const val = btn.dataset.value;
    const items = [...cart.values()];
    const totalCents = items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);

    if (val === "exact") {
      amountPaid.value = (totalCents / 100).toFixed(2);
    } else {
      amountPaid.value = Number(val).toFixed(2);
    }
    render();
  });

  amountPaid.addEventListener("input", render);

  // Form Submit Validation
  document.getElementById("checkout-form").addEventListener("submit", (event) => {
    if (checkoutButton.disabled) {
      event.preventDefault();
      return;
    }
  });

  amountPaid.required = true;
  render();
})();
