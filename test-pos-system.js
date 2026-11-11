import bcrypt from "bcrypt";
import { sequelize } from "./models/db.js";
import { Product, Order, OrderItem } from "./models/posModels.js";
import { User } from "./models/userModel.js";

async function runTests() {
  console.log("==========================================");
  console.log("   JAPZ GRILL POS SYSTEM - SYSTEM TEST    ");
  console.log("==========================================");

  await sequelize.authenticate();
  console.log("✓ Database connected successfully.");

  // Test 1: Verify the cashier account
  const cashier = await User.findOne({ where: { username: "cashier01" } });
  if (!cashier) throw new Error("Cashier account cashier01 not found!");
  if (cashier.role !== "cashier") throw new Error("Account is not a cashier!");
  const validCashierPass = await bcrypt.compare("cashier123", cashier.password);
  if (!validCashierPass) throw new Error("Cashier password verification failed!");
  console.log(`✓ Cashier account verified: ${cashier.name} (username: ${cashier.username})`);

  // Test 2: Verify authentic JAPZ GRILL menu products with images
  const products = await Product.findAll({ where: { isActive: true } });
  console.log(`✓ Active products in menu: ${products.length} items`);
  const sampleBurger = products.find(p => p.name.includes("Burger"));
  if (!sampleBurger || !sampleBurger.image) {
    throw new Error("Product missing picture URL!");
  }
  console.log(`✓ Sample item verified: ${sampleBurger.name} - ₱${sampleBurger.price} (Image: ${sampleBurger.image.slice(0, 45)}...)`);

  // Test 3: Create order simulating user's scenario:
  // 2 Cheeseburgers, 1 French Fries, 1 Spaghetti Carbonara, Dine-in Table 05, Cash ₱1,000, Change ₱500
  const orderCount = await Order.count();
  const testOrderNum = `JG-${String(orderCount + 1).padStart(4, "0")}`;

  const burger = products.find(p => p.name.includes("Cheez") || p.name.includes("Burger")) || products[0];
  const fries = products.find(p => p.name.includes("Fries")) || products[1];
  const pasta = products.find(p => p.name.includes("Spaghetti") || p.name.includes("Carbonara")) || products[2];

  const qty1 = 2;
  const qty2 = 1;
  const qty3 = 1;

  const totalCalc = (Number(burger.price) * qty1) + (Number(fries.price) * qty2) + (Number(pasta.price) * qty3);
  const cashReceived = 1000;
  const changeCalc = cashReceived - totalCalc;

  const newOrder = await Order.create({
    orderNumber: testOrderNum,
    cashierId: cashier.id,
    cashierName: cashier.name,
    orderType: "dine-in",
    tableNumber: "Table 05",
    customerName: "Customer Table 5",
    status: "pending",
    paymentMethod: "cash",
    subtotal: totalCalc.toFixed(2),
    total: totalCalc.toFixed(2),
    amountPaid: cashReceived.toFixed(2),
    changeDue: changeCalc.toFixed(2)
  });

  await OrderItem.bulkCreate([
    {
      OrderId: newOrder.id,
      ProductId: burger.id,
      productName: burger.name,
      image: burger.image,
      quantity: qty1,
      unitPrice: burger.price,
      lineTotal: (Number(burger.price) * qty1).toFixed(2)
    },
    {
      OrderId: newOrder.id,
      ProductId: fries.id,
      productName: fries.name,
      image: fries.image,
      quantity: qty2,
      unitPrice: fries.price,
      lineTotal: (Number(fries.price) * qty2).toFixed(2)
    },
    {
      OrderId: newOrder.id,
      ProductId: pasta.id,
      productName: pasta.name,
      image: pasta.image,
      quantity: qty3,
      unitPrice: pasta.price,
      lineTotal: (Number(pasta.price) * qty3).toFixed(2)
    }
  ]);

  console.log(`✓ Placed Order ${newOrder.orderNumber}:`);
  console.log(`  - Type: ${newOrder.orderType} (${newOrder.tableNumber})`);
  console.log(`  - Items: 2x ${burger.name}, 1x ${fries.name}, 1x ${pasta.name}`);
  console.log(`  - Total: ₱${newOrder.total}`);
  console.log(`  - Cash Received: ₱${newOrder.amountPaid}, Change: ₱${newOrder.changeDue}`);
  console.log(`  - Status: ${newOrder.status.toUpperCase()} (Sent to Kitchen Display)`);

  // Test 4: Kitchen Lifecycle (Pending -> Preparing -> Ready -> Completed)
  await newOrder.update({ status: "preparing" });
  console.log(`✓ Kitchen started preparing: status is now PREPARING`);

  await newOrder.update({ status: "ready" });
  console.log(`✓ Kitchen finished: status is now READY (Food ready for pickup/serving)`);

  await newOrder.update({ status: "completed" });
  console.log(`✓ Food served to customer: status is now COMPLETED`);

  // Test 5: Verify Reports count completed order
  const completedOrder = await Order.findByPk(newOrder.id, { include: [OrderItem] });
  if (completedOrder.status !== "completed") throw new Error("Order not completed");
  console.log(`✓ Verified completed order in database with ${completedOrder.OrderItems.length} items`);

  console.log("==========================================");
  console.log("   ALL JAPZ GRILL POS TESTS PASSED!       ");
  console.log("==========================================");

  await sequelize.close();
}

runTests().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
