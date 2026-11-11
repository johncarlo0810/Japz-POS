import bcrypt from "bcrypt";
import inquirer from "inquirer";
import { User, migrateUsersToCashierOnly, sequelize } from "./models/userModel.js";
import { seedProducts } from "./models/posModels.js";

try {
  await sequelize.authenticate();
  await sequelize.sync();
  await migrateUsersToCashierOnly();
  await seedProducts();

  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: "Cashier name:",
      validate: (value) => value.trim() ? true : "Name is required."
    },
    {
      type: "input",
      name: "email",
      message: "Cashier email:",
      validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) || "Enter a valid email address."
    },
    {
      type: "password",
      name: "password",
      message: "Password (at least 8 characters):",
      validate: (value) => value.length >= 8 || "Use at least 8 characters."
    }
  ]);
  const email = answers.email.trim().toLowerCase();
  if (await User.findOne({ where: { email } })) {
    throw new Error(`An account already exists for ${email}.`);
  }

  await User.create({
    name: answers.name.trim(),
    email,
    password: await bcrypt.hash(answers.password, 10),
    role: "cashier"
  });
  console.log(`Cashier account created for ${email}. Start the server with npm start.`);
} catch (error) {
  console.error("Could not create cashier:", error.message);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
