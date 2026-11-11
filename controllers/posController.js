import { Op } from "sequelize";
import { Order, OrderItem, Product } from "../models/posModels.js";
import { sequelize } from "../models/db.js";

const toCents = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? Math.round(amount * 100) : NaN;
};

const fromCents = (cents) => (cents / 100).toFixed(2);

const parseCart = (rawCart) => {
  let items;
  try {
    items = typeof rawCart === "string" ? JSON.parse(rawCart) : rawCart;
  } catch {
    return null;
  }

  if (!Array.isArray(items) || items.length === 0 || items.length > 50) return null;

  const normalized = new Map();
  for (const item of items) {
    const productId = Number(item?.productId);
    const quantity = Number(item?.quantity);
    if (!Number.isInteger(productId) || productId < 1 ||
        !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      return null;
    }
    normalized.set(productId, (normalized.get(productId) || 0) + quantity);
  }

  if ([...normalized.values()].some((quantity) => quantity > 99)) return null;
  return [...normalized].map(([productId, quantity]) => ({ productId, quantity }));
};

export const posPage = async (req, res, next) => {
  try {
    const products = await Product.findAll({
      where: { isActive: true },
      order: [["category", "ASC"], ["name", "ASC"]]
    });
    
    const menuGroupFor = (product) => {
      if (product.category === "Burgers") return "Burgers";
      if (product.category === "Sandwiches & Pasta") {
        return /pasta|lasagna|carbonara|spaghetti|alfredo/i.test(product.name)
          ? "Pasta"
          : "Grilled Meals";
      }
      if (product.category === "Fries & Chips") return "Snacks";
      if (product.category === "Desserts") return "Desserts";
      if (product.category === "Beverages & Coolers" || product.category === "Coffee") return "Drinks";
      return product.category;
    };
    const menuProducts = products.map((product) => ({
      ...product.toJSON(),
      menuGroup: menuGroupFor(product)
    }));
    const preferredOrder = ["Burgers", "Grilled Meals", "Pasta", "Snacks", "Desserts", "Drinks"];
    const categories = [...new Set(menuProducts.map((product) => product.menuGroup))]
      .sort((a, b) => preferredOrder.indexOf(a) - preferredOrder.indexOf(b));
    const burgerProducts = menuProducts.filter((product) => product.category === "Burgers" && product.image);
    const featuredProduct = burgerProducts[1] || burgerProducts[0];

    // Preset dining tables for Dine-in orders
    const tables = Array.from({ length: 12 }, (_, i) => ({
      value: `Table ${String(i + 1).padStart(2, "0")}`,
      label: String(i + 1)
    }));

    res.render("dashboard", {
      title: "Japz Grill · Counter POS",
      cashierName: req.session.userName || "Cashier",
      username: req.session.username || "cashier",
      activeNav: "pos",
      products: menuProducts,
      categories,
      featuredProduct,
      tables
    });
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req, res, next) => {
  const items = parseCart(req.body.items);
  const paymentMethod = req.body.paymentMethod || "cash";
  const orderType = req.body.orderType === "takeaway" ? "takeaway" : "dine-in";
  const tableNumber = orderType === "dine-in" ? (String(req.body.tableNumber || "Table 01").trim()) : "Takeaway";
  const customerName = String(req.body.customerName || "").trim();

  const isCash = paymentMethod === "cash";
  const amountPaidCents = isCash ? toCents(req.body.amountPaid) : null;

  if (!items || !["cash", "card", "gcash"].includes(paymentMethod) ||
      (isCash && (!Number.isInteger(amountPaidCents) || amountPaidCents < 0))) {
    req.flash("error_msg", "Please check your cart items and payment details.");
    return res.redirect("/pos");
  }

  try {
    const order = await sequelize.transaction(async (transaction) => {
      const products = await Product.findAll({
        where: { id: { [Op.in]: items.map((item) => item.productId) }, isActive: true },
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      if (products.length !== items.length) {
        const error = new Error("One or more selected products are no longer available.");
        error.code = "INVALID_CART";
        throw error;
      }

      const productById = new Map(products.map((product) => [product.id, product]));
      const lineItems = items.map(({ productId, quantity }) => {
        const product = productById.get(productId);
        const unitPriceCents = toCents(product.price);
        return {
          productId,
          productName: product.name,
          image: product.image || "",
          quantity,
          unitPriceCents,
          lineTotalCents: unitPriceCents * quantity
        };
      });

      const totalCents = lineItems.reduce((sum, item) => sum + item.lineTotalCents, 0);
      const paidCents = isCash ? amountPaidCents : totalCents;

      if (paidCents < totalCents) {
        const error = new Error(`Cash received (₱${fromCents(paidCents)}) is less than the order total (₱${fromCents(totalCents)}).`);
        error.code = "INSUFFICIENT_PAYMENT";
        throw error;
      }

      // Generate human-friendly sequential order number: JG-0001
      const totalOrdersCount = await Order.count({ transaction });
      let candidateNumber = `JG-${String(totalOrdersCount + 1).padStart(4, "0")}`;
      const duplicate = await Order.findOne({ where: { orderNumber: candidateNumber }, transaction });
      if (duplicate) {
        candidateNumber = `JG-${String(totalOrdersCount + 1).padStart(4, "0")}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
      }

      const savedOrder = await Order.create({
        orderNumber: candidateNumber,
        cashierId: req.session.userId,
        cashierName: req.session.userName || "Cashier",
        orderType,
        tableNumber: orderType === "dine-in" ? tableNumber : "Takeaway",
        customerName,
        status: "pending",
        paymentMethod,
        subtotal: fromCents(totalCents),
        total: fromCents(totalCents),
        amountPaid: fromCents(paidCents),
        changeDue: fromCents(paidCents - totalCents)
      }, { transaction });

      await OrderItem.bulkCreate(lineItems.map((item) => ({
        OrderId: savedOrder.id,
        ProductId: item.productId,
        productName: item.productName,
        image: item.image,
        quantity: item.quantity,
        unitPrice: fromCents(item.unitPriceCents),
        lineTotal: fromCents(item.lineTotalCents)
      })), { transaction });

      return savedOrder;
    });

    req.flash("success_msg", `Order ${order.orderNumber} successfully placed! Sent to Kitchen.`);
    res.redirect(`/orders/${order.id}`);
  } catch (error) {
    if (error.code === "INVALID_CART" || error.code === "INSUFFICIENT_PAYMENT") {
      req.flash("error_msg", error.message);
      return res.redirect("/pos");
    }
    next(error);
  }
};

export const ordersPage = async (req, res, next) => {
  try {
    const statusFilter = req.query.status;
    const searchQuery = String(req.query.q || "").trim();

    const where = {};
    if (statusFilter && ["pending", "preparing", "ready", "completed", "cancelled"].includes(statusFilter)) {
      where.status = statusFilter;
    }

    if (searchQuery) {
      where[Op.or] = [
        { orderNumber: { [Op.like]: `%${searchQuery}%` } },
        { tableNumber: { [Op.like]: `%${searchQuery}%` } },
        { cashierName: { [Op.like]: `%${searchQuery}%` } },
        { customerName: { [Op.like]: `%${searchQuery}%` } }
      ];
    }

    const orders = await Order.findAll({
      where,
      include: [{ model: OrderItem }],
      order: [["createdAt", "DESC"]],
      limit: 100
    });

    const counts = {
      all: await Order.count(),
      pending: await Order.count({ where: { status: "pending" } }),
      preparing: await Order.count({ where: { status: "preparing" } }),
      ready: await Order.count({ where: { status: "ready" } }),
      completed: await Order.count({ where: { status: "completed" } }),
      cancelled: await Order.count({ where: { status: "cancelled" } })
    };

    res.render("orders", {
      title: "Transaction & Order History · JAPZ GRILL",
      cashierName: req.session.userName,
      activeNav: statusFilter === "completed" ? "history" : "orders",
      orders: orders.map((order) => {
        const json = order.toJSON();
        json.formattedDate = new Date(json.createdAt).toLocaleString("en-PH", {
          dateStyle: "medium",
          timeStyle: "short"
        });
        return json;
      }),
      counts,
      activeStatus: statusFilter || "all",
      searchQuery
    });
  } catch (error) {
    next(error);
  }
};

export const kitchenPage = async (req, res, next) => {
  try {
    const filter = req.query.filter || "active";
    const where = {};

    if (filter === "pending") {
      where.status = "pending";
    } else if (filter === "preparing") {
      where.status = "preparing";
    } else if (filter === "ready") {
      where.status = "ready";
    } else if (filter === "completed") {
      where.status = "completed";
    } else {
      // Default: active kitchen tickets
      where.status = { [Op.in]: ["pending", "preparing", "ready"] };
    }

    const orders = await Order.findAll({
      where,
      include: [{ model: OrderItem }],
      order: [["createdAt", "ASC"]], // Oldest first for kitchen prep priority
      limit: 50
    });

    const activeCounts = {
      pending: await Order.count({ where: { status: "pending" } }),
      preparing: await Order.count({ where: { status: "preparing" } }),
      ready: await Order.count({ where: { status: "ready" } }),
      totalActive: await Order.count({ where: { status: { [Op.in]: ["pending", "preparing", "ready"] } } })
    };

    res.render("kitchen", {
      title: "Kitchen Order Display (KDS) · JAPZ GRILL",
      cashierName: req.session.userName,
      activeNav: "kitchen",
      orders: orders.map((order) => {
        const json = order.toJSON();
        const diffMinutes = Math.floor((Date.now() - new Date(json.createdAt).getTime()) / 60000);
        json.elapsedText = diffMinutes <= 0 ? "Just now" : `${diffMinutes}m ago`;
        json.isUrgent = diffMinutes >= 15 && json.status !== "ready";
        json.formattedTime = new Date(json.createdAt).toLocaleTimeString("en-PH", {
          hour: "2-digit",
          minute: "2-digit"
        });
        return json;
      }),
      activeCounts,
      currentFilter: filter
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  const transitions = {
    pending: ["preparing", "cancelled"],
    preparing: ["ready", "cancelled"],
    ready: ["completed", "cancelled"]
  };

  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).send("Order not found");

    const nextStatus = req.body.status;
    if (!transitions[order.status]?.includes(nextStatus)) {
      req.flash("error_msg", `Status change from ${order.status} to ${nextStatus} is not permitted.`);
      return res.redirect(req.get("Referrer") || "/orders");
    }

    await order.update({ status: nextStatus });
    req.flash("success_msg", `Order ${order.orderNumber} marked as ${nextStatus.toUpperCase()}.`);

    const referrer = req.get("Referrer") || "/orders";
    res.redirect(referrer);
  } catch (error) {
    next(error);
  }
};

export const receiptPage = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id, { include: [{ model: OrderItem }] });
    if (!order) return res.status(404).send("Order not found");

    const json = order.toJSON();
    json.formattedDate = new Date(json.createdAt).toLocaleString("en-PH", {
      dateStyle: "medium",
      timeStyle: "short"
    });

    res.render("receipt", {
      title: `Receipt ${order.orderNumber} · JAPZ GRILL`,
      cashierName: req.session.userName,
      order: json
    });
  } catch (error) {
    next(error);
  }
};
