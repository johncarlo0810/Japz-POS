import bcrypt from "bcrypt";
import { Sequelize } from "sequelize";
import { sequelize } from "./models/db.js";
import { Product, Order, OrderItem, initialMenu } from "./models/posModels.js";
import { User, migrateUsersToCashierOnly } from "./models/userModel.js";

const rootSequelize = new Sequelize("mysql", "root", "", {
  host: "localhost",
  dialect: "mysql",
  logging: false
});

try {
  await rootSequelize.authenticate();
  await rootSequelize.query(
    "CREATE DATABASE IF NOT EXISTS `POS_Rocha` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
  );
  await sequelize.authenticate();
  await sequelize.sync();
  await migrateUsersToCashierOnly();

  console.log("Updating database schema columns...");

  // Products: image column
  try {
    await sequelize.query("ALTER TABLE `products` ADD COLUMN `image` VARCHAR(500) NULL AFTER `price`");
  } catch (e) {
    // column may already exist
  }

  // Orders: orderType, tableNumber, customerName, cashierName
  try {
    await sequelize.query("ALTER TABLE `orders` ADD COLUMN `orderType` ENUM('dine-in', 'takeaway') NOT NULL DEFAULT 'dine-in' AFTER `cashierId`");
  } catch (e) {}

  try {
    await sequelize.query("ALTER TABLE `orders` ADD COLUMN `tableNumber` VARCHAR(50) NULL DEFAULT NULL AFTER `orderType`");
  } catch (e) {}

  try {
    await sequelize.query("ALTER TABLE `orders` ADD COLUMN `customerName` VARCHAR(100) NULL DEFAULT '' AFTER `tableNumber`");
  } catch (e) {}

  try {
    await sequelize.query("ALTER TABLE `orders` ADD COLUMN `cashierName` VARCHAR(100) NOT NULL DEFAULT 'Cashier' AFTER `cashierId`");
  } catch (e) {}

  // Orders: ENUMs
  try {
    await sequelize.query(
      "ALTER TABLE `orders` MODIFY `status` ENUM('pending', 'preparing', 'ready', 'completed', 'cancelled') NOT NULL DEFAULT 'pending'"
    );
  } catch (e) {
    console.warn("Status enum update notice:", e.message);
  }

  try {
    await sequelize.query(
      "ALTER TABLE `orders` MODIFY `paymentMethod` ENUM('cash', 'card', 'gcash') NOT NULL DEFAULT 'cash'"
    );
  } catch (e) {
    console.warn("Payment enum update notice:", e.message);
  }

  // OrderItems: image
  try {
    await sequelize.query("ALTER TABLE `orderitems` ADD COLUMN `image` VARCHAR(500) NULL AFTER `lineTotal`");
  } catch (e) {}

  // Users: username
  try {
    await sequelize.query("ALTER TABLE `users` ADD COLUMN `username` VARCHAR(100) NULL UNIQUE AFTER `name`");
  } catch (e) {}

  // Populate/Update menu items
  console.log("Seeding JAPZ GRILL menu items with picture references...");
  for (const item of initialMenu) {
    const [product, created] = await Product.findOrCreate({
      where: { name: item.name },
      defaults: item
    });
    if (!created) {
      await product.update({
        category: item.category,
        description: item.description,
        price: item.price,
        image: item.image,
        emoji: item.emoji,
        isActive: true
      });
    }
  }

  // Ensure default cashier01 account exists
  const cashierEmail = "cashier01@japzgrill.local";
  let cashier = await User.findOne({ where: { username: "cashier01" } });
  if (!cashier) {
    cashier = await User.findOne({ where: { email: cashierEmail } });
  }

  if (!cashier) {
    const passwordHash = await bcrypt.hash("cashier123", 10);
    await User.create({
      name: "Cashier 01",
      username: "cashier01",
      email: cashierEmail,
      password: passwordHash,
      role: "cashier"
    });
    console.log("Created cashier account: username 'cashier01' / password 'cashier123'");
  } else {
    await cashier.update({ username: "cashier01", role: "cashier" });
  }

  console.log("Migration and seeding completed successfully! All tables ready.");
} catch (error) {
  console.error("Migration failed:", error);
  process.exitCode = 1;
} finally {
  await rootSequelize.close();
  await sequelize.close();
}
