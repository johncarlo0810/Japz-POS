import { DataTypes } from "sequelize";
import { sequelize } from "./db.js";

export const User = sequelize.define("User", {
  name: { type: DataTypes.STRING, allowNull: false },
  username: { type: DataTypes.STRING(100), allowNull: true, unique: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM("cashier"), allowNull: false, defaultValue: "cashier" }
});

export const migrateUsersToCashierOnly = async () => {
  // Widen legacy ENUMs first so all existing accounts can be converted safely.
  await sequelize.query(
    "ALTER TABLE `users` MODIFY `role` ENUM('admin', 'staff', 'visitors', 'cashier') NOT NULL DEFAULT 'cashier'"
  );
  await sequelize.query("UPDATE `users` SET `role` = 'cashier' WHERE `role` <> 'cashier'");
  await sequelize.query(
    "ALTER TABLE `users` MODIFY `role` ENUM('cashier') NOT NULL DEFAULT 'cashier'"
  );
};

export { sequelize };
