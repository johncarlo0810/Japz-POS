import { DataTypes } from "sequelize";
import { sequelize } from "./db.js";

export const Product = sequelize.define("Product", {
  name: { type: DataTypes.STRING(120), allowNull: false },
  category: { type: DataTypes.STRING(60), allowNull: false },
  description: { type: DataTypes.STRING(255), allowNull: false, defaultValue: "" },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  image: { type: DataTypes.STRING(500), allowNull: true, defaultValue: "" },
  emoji: { type: DataTypes.STRING(12), allowNull: false, defaultValue: "🍔" },
  isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
});

export const Order = sequelize.define("Order", {
  orderNumber: { type: DataTypes.STRING(40), allowNull: false, unique: true },
  cashierId: { type: DataTypes.INTEGER, allowNull: false },
  cashierName: { type: DataTypes.STRING(100), allowNull: false, defaultValue: "Cashier" },
  orderType: {
    type: DataTypes.ENUM("dine-in", "takeaway"),
    allowNull: false,
    defaultValue: "dine-in"
  },
  tableNumber: { type: DataTypes.STRING(50), allowNull: true, defaultValue: null },
  customerName: { type: DataTypes.STRING(100), allowNull: true, defaultValue: "" },
  status: {
    type: DataTypes.ENUM("pending", "preparing", "ready", "completed", "cancelled"),
    allowNull: false,
    defaultValue: "pending"
  },
  paymentMethod: {
    type: DataTypes.ENUM("cash", "card", "gcash"),
    allowNull: false,
    defaultValue: "cash"
  },
  subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  amountPaid: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  changeDue: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 }
});

export const OrderItem = sequelize.define("OrderItem", {
  productName: { type: DataTypes.STRING(120), allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  unitPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  lineTotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  image: { type: DataTypes.STRING(500), allowNull: true, defaultValue: "" }
});

Product.hasMany(OrderItem, { foreignKey: { allowNull: true } });
OrderItem.belongsTo(Product);
Order.hasMany(OrderItem, { foreignKey: { allowNull: false }, onDelete: "CASCADE" });
OrderItem.belongsTo(Order);

export const initialMenu = [
  // Burgers
  {
    name: "Beefy Grilled Burger",
    category: "Burgers",
    description: "Flame-grilled pure beef patty with crisp lettuce and signature Japz sauce.",
    price: 79,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
    emoji: "🍔"
  },
  {
    name: "Classic Grilled Burger",
    category: "Burgers",
    description: "100% pure grilled beef patty, fresh lettuce, sliced ripe tomatoes, and dressing.",
    price: 99,
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80",
    emoji: "🍔"
  },
  {
    name: "Grilled Cheezy Burger",
    category: "Burgers",
    description: "Flame-grilled beef patty smothered in rich melted cheddar cheese sauce.",
    price: 109,
    image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80",
    emoji: "🍔"
  },
  {
    name: "Bacon Cheeze Burger",
    category: "Burgers",
    description: "Grilled beef patty topped with crispy smoked bacon strips and melted cheese.",
    price: 149,
    image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&auto=format&fit=crop&q=80",
    emoji: "🍔"
  },
  {
    name: "Bacon Cheeze Overload Burger",
    category: "Burgers",
    description: "Double bacon strips, overflowing cheese sauce, and juicy grilled beef patty.",
    price: 179,
    image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=600&auto=format&fit=crop&q=80",
    emoji: "🍔"
  },
  {
    name: "2 Some Cheezy Burger",
    category: "Burgers",
    description: "Double grilled pure beef patties layered with double cheese.",
    price: 189,
    image: "https://images.unsplash.com/photo-1582196016295-f8c8bd4b3e99?w=600&auto=format&fit=crop&q=80",
    emoji: "🍔"
  },
  {
    name: "3 Some Cheezy Burger",
    category: "Burgers",
    description: "Triple grilled pure beef patties towering with triple melted cheese.",
    price: 249,
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&auto=format&fit=crop&q=80",
    emoji: "🍔"
  },

  // Sandwiches & Pasta
  {
    name: "Bacon & Ham Grilled Sandwich",
    category: "Sandwiches & Pasta",
    description: "Toasted buttered bread stuffed with grilled ham, bacon, and melted cheese.",
    price: 99,
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80",
    emoji: "🥪"
  },
  {
    name: "Classic Grilled Hungarian Sausage",
    category: "Sandwiches & Pasta",
    description: "Spicy and cheezy grilled Hungarian sausage served with savory relish.",
    price: 119,
    image: "https://images.unsplash.com/photo-1629851722883-2070ffbfdfb3?w=600&auto=format&fit=crop&q=80",
    emoji: "🌭"
  },
  {
    name: "Beefy Lasagna",
    category: "Sandwiches & Pasta",
    description: "Layered pasta with slow-cooked savory beef bolognese and creamy béchamel.",
    price: 179,
    image: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=600&auto=format&fit=crop&q=80",
    emoji: "🍝"
  },
  {
    name: "Beefy Carbonara",
    category: "Sandwiches & Pasta",
    description: "Creamy white sauce pasta loaded with seasoned ground beef and parmesan.",
    price: 89,
    image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&auto=format&fit=crop&q=80",
    emoji: "🍝"
  },
  {
    name: "Beefy Spaghetti",
    category: "Sandwiches & Pasta",
    description: "Sweet-style Filipino tomato sauce with minced beef, hotdog slices, and cheddar.",
    price: 89,
    image: "https://images.unsplash.com/photo-1621996346565-e3d5d6281724?w=600&auto=format&fit=crop&q=80",
    emoji: "🍝"
  },
  {
    name: "Tuna Alfredo Pasta",
    category: "Sandwiches & Pasta",
    description: "Tender flaked tuna tossed in rich and creamy garlic alfredo sauce.",
    price: 89,
    image: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=600&auto=format&fit=crop&q=80",
    emoji: "🍝"
  },
  {
    name: "Chicken Truffle Pasta",
    category: "Sandwiches & Pasta",
    description: "Gourmet white cream pasta infused with truffle aroma and grilled chicken bits.",
    price: 119,
    image: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=600&auto=format&fit=crop&q=80",
    emoji: "🍝"
  },

  // Fries and Chips
  {
    name: "Cheezy BBQ Biggie Fries",
    category: "Fries & Chips",
    description: "Jumbo crispy fries drizzled with smoky barbecue sauce and warm cheese.",
    price: 89,
    image: "https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&auto=format&fit=crop&q=80",
    emoji: "🍟"
  },
  {
    name: "Flavored Biggie Fries",
    category: "Fries & Chips",
    description: "Crispy golden thick-cut fries tossed in BBQ, Cheese, or Sour Cream flavor.",
    price: 89,
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80",
    emoji: "🍟"
  },
  {
    name: "Beefy Nachos",
    category: "Fries & Chips",
    description: "Crunchy tortilla chips loaded with seasoned ground beef, jalapeños, and cheese.",
    price: 179,
    image: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=600&auto=format&fit=crop&q=80",
    emoji: "🧀"
  },

  // Beverages & Coolers
  {
    name: "Japz House Blend Iced Tea",
    category: "Beverages & Coolers",
    description: "Signature chilled house-brewed iced tea with citrus notes.",
    price: 39,
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&auto=format&fit=crop&q=80",
    emoji: "🧋"
  },
  {
    name: "Strawberry Red Tea",
    category: "Beverages & Coolers",
    description: "Chilled brewed red tea infused with sweet strawberry flavor.",
    price: 39,
    image: "https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=600&auto=format&fit=crop&q=80",
    emoji: "🍓"
  },
  {
    name: "Cucumber Mint Lemonade",
    category: "Beverages & Coolers",
    description: "Cooling fresh cucumber and mint blended into tart lemonade.",
    price: 39,
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80",
    emoji: "🍋"
  },
  {
    name: "Honey Lychee Pink Lemonade",
    category: "Beverages & Coolers",
    description: "Sweet tropical lychee and natural honey with pink lemonade.",
    price: 39,
    image: "https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?w=600&auto=format&fit=crop&q=80",
    emoji: "🌸"
  },
  {
    name: "Honey Blue Lemonade",
    category: "Beverages & Coolers",
    description: "Refreshing blue citrus cooler sweetened with pure honey.",
    price: 39,
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80",
    emoji: "💙"
  },

  // Coffee
  {
    name: "Iced Americano",
    category: "Coffee",
    description: "Double espresso shots poured over iced filtered water.",
    price: 59,
    image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80",
    emoji: "☕"
  },
  {
    name: "Iced Caramel Latte",
    category: "Coffee",
    description: "Rich espresso and cold fresh milk swirled with sweet buttery caramel.",
    price: 89,
    image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&auto=format&fit=crop&q=80",
    emoji: "☕"
  },
  {
    name: "Iced Spanish Latte",
    category: "Coffee",
    description: "Creamy condensed milk espresso latte, chilled to perfection.",
    price: 89,
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&auto=format&fit=crop&q=80",
    emoji: "☕"
  },
  {
    name: "Iced White Mocha Latte",
    category: "Coffee",
    description: "Velvety white chocolate mocha combined with bold espresso and fresh milk.",
    price: 89,
    image: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&auto=format&fit=crop&q=80",
    emoji: "☕"
  },
  {
    name: "Iced Avocado Latte",
    category: "Coffee",
    description: "Creamy avocado purée layered with espresso and fresh milk.",
    price: 89,
    image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&auto=format&fit=crop&q=80",
    emoji: "🥑"
  },
  {
    name: "Iced Brown Sugar Latte",
    category: "Coffee",
    description: "Caramelized brown sugar syrup blended with dark roast espresso.",
    price: 75,
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80",
    emoji: "☕"
  },
  {
    name: "Iced Latte",
    category: "Coffee",
    description: "Smooth espresso with chilled full-cream milk over ice.",
    price: 75,
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop&q=80",
    emoji: "☕"
  },

  // Desserts
  {
    name: "Special Halo-Halo",
    category: "Desserts",
    description: "Shaved ice with ube halaya, leche flan, sweetened beans, pinipig, and milk.",
    price: 89,
    image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&auto=format&fit=crop&q=80",
    emoji: "🍧"
  },
  {
    name: "Special Mais Con Yelo",
    category: "Desserts",
    description: "Sweet whole corn kernels, crushed ice, creamy evaporated milk, and corn flakes.",
    price: 79,
    image: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=600&auto=format&fit=crop&q=80",
    emoji: "🌽"
  }
];

export const seedProducts = async () => {
  const count = await Product.count();
  if (count < 10) {
    // If empty or only had previous 9 test items, populate full Japz Grill menu
    for (const item of initialMenu) {
      const existing = await Product.findOne({ where: { name: item.name } });
      if (!existing) {
        await Product.create(item);
      } else if (!existing.image) {
        await existing.update({ image: item.image, description: item.description, price: item.price });
      }
    }
  }
};
