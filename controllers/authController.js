import bcrypt from "bcrypt";
import { Op } from "sequelize";
import { User, migrateUsersToCashierOnly, sequelize } from "../models/userModel.js";
import { seedProducts } from "../models/posModels.js";

try {
  await sequelize.sync();
  await migrateUsersToCashierOnly();
  await seedProducts();
} catch (err) {
  console.error("Database initialization or cashier-role migration failed:", err);
}

export const loginPage = (req, res) => {
  if (req.session.userId) {
    return res.redirect("/pos");
  }
  res.render("login", { title: "Cashier Sign In · JAPZ GRILL" });
};

export const forgotPasswordPage = (req, res) => res.render("forgotpassword", { title: "Forgot Password" });
export const dashboardPage = (req, res) => res.redirect("/pos");

export const loginUser = async (req, res) => {
  const loginInput = String(req.body.login || req.body.email || "").trim();
  const password = String(req.body.password || "");

  if (!loginInput || !password) {
    req.flash("error_msg", "Please enter your username or email and password.");
    return res.redirect("/login");
  }

  try {
    // Find by email or username
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: loginInput.toLowerCase() },
          { username: loginInput }
        ]
      }
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      req.flash("error_msg", "Invalid username/email or password.");
      return res.redirect("/login");
    }

    if (user.role !== "cashier") {
      req.flash("error_msg", "This account does not have cashier access.");
      return res.redirect("/login");
    }

    req.session.userId = user.id;
    req.session.userName = user.name;
    req.session.username = user.username || user.email.split("@")[0];

    req.flash("success_msg", `Welcome back, ${user.name}!`);
    return res.redirect("/pos");
  } catch (error) {
    console.error("Login error:", error);
    req.flash("error_msg", "An error occurred during login. Please try again.");
    return res.redirect("/login");
  }
};

export const logoutUser = (req, res) => {
  req.session.destroy((error) => {
    if (error) return res.status(500).send("Could not log out. Please try again.");
    res.redirect("/login");
  });
};
