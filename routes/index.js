import express from "express";
import { homePage } from "../controllers/homeController.js";
import {
  createOrder,
  kitchenPage,
  ordersPage,
  posPage,
  receiptPage,
  updateOrderStatus
} from "../controllers/posController.js";
import {
  dashboardPage,
  forgotPasswordPage,
  loginPage,
  loginUser,
  logoutUser
} from "../controllers/authController.js";

const router = express.Router();

const requirePosAccess = (req, res, next) => {
  if (!req.session.userId) {
    req.flash("error_msg", "Please sign in to access the POS system.");
    return res.redirect("/login");
  }
  next();
};

// Public & Auth Routes
router.get("/", homePage);
router.get("/login", loginPage);
router.post("/login", loginUser);
router.get("/forgot-password", forgotPasswordPage);
router.get("/dashboard", requirePosAccess, dashboardPage);
router.get("/logout", logoutUser);

// Cashier POS operations
router.get("/pos", requirePosAccess, posPage);
router.post("/orders", requirePosAccess, createOrder);
router.get("/orders", requirePosAccess, ordersPage);
router.get("/orders/:id", requirePosAccess, receiptPage);
router.post("/orders/:id/status", requirePosAccess, updateOrderStatus);

// Kitchen Display System (KDS)
router.get("/kitchen", requirePosAccess, kitchenPage);

export default router;
