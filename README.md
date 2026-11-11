# JAPZGRILL POS & Kitchen Order System (KDS)
**Burger & Bistro &middot; 100% Pure Beef &middot; We Serve It Grilled**

An end-to-end Restaurant Point of Sale (POS), Kitchen Order Display (KDS), and Backoffice Management system designed specifically for **JAPZ GRILL**.

---

## 🌟 Key Features & Workflow

### 1. Cashier & Admin Authentication
- **Cashier Terminal Access**: Cashiers sign in using their username or email. They have access to POS Counter, Orders, and Kitchen Display, while restricted from Backoffice Admin & Reports.
- **Admin Access**: Full access to POS, Orders, Kitchen Display, Menu Management, Staff Accounts, and Sales Analytics.
- **Ready-to-use Accounts**:
  - **Cashier**: Username: `cashier01` | Password: `cashier123`
  - **Administrator**: Email: `admin@japzgrill.local` (or username `admin`)

### 2. POS Counter & Food Photography Menu
- **High-Quality Food Photos**: Replaced plain emojis/icons with appetizing, crisp food pictures for all 31 authentic JAPZ GRILL menu items:
  - **Burgers**: Beefy Grilled Burger, Classic Grilled Burger, Grilled Cheezy Burger, Bacon Cheeze Burger, Bacon Cheeze Overload Burger, 2 Some Cheezy Burger, 3 Some Cheezy Burger.
  - **Sandwiches & Pasta**: Bacon & Ham Grilled Sandwich, Classic Grilled Hungarian Sausage, Beefy Lasagna, Beefy Carbonara, Beefy Spaghetti, Tuna Alfredo Pasta, Chicken Truffle Pasta.
  - **Fries & Chips**: Cheezy BBQ Biggie Fries, Flavored Biggie Fries (BBQ/Cheese/Sour Cream), Beefy Nachos.
  - **Beverages & Coolers**: Japz House Blend Iced Tea, Strawberry Red Tea, Cucumber Mint Lemonade, Honey Lychee Pink Lemonade, Honey Blue Lemonade.
  - **Coffee**: Iced Americano, Iced Caramel Latte, Iced Spanish Latte, Iced White Mocha Latte, Iced Avocado Latte, Iced Brown Sugar Latte, Iced Latte.
  - **Desserts**: Special Halo-Halo, Special Mais Con Yelo.
- **Category Filter Tabs & Realtime Search**: Instant filtering by category or keyword.
- **Live Badge Counters**: Shows current quantity of each item directly on product cards.

### 3. Order Type & Table Management
- **Order Type Toggle**: Select between **🍽️ Dine-in** and **🛍️ Takeaway**.
- **Interactive Table Selector**: Quick table chips (`Table 01` to `Table 12`) for Dine-in orders. Table assignment automatically transfers to receipt and kitchen display tickets.
- **Customer Notes**: Optional note field for customer name or special requests.

### 4. Smart Checkout & Cash Tender
- **Multi-Payment Support**: Cash, GCash, and Card.
- **Quick Denomination Buttons**: `Exact`, `₱100`, `₱200`, `₱500`, `₱1,000`.
- **Live Change Due Calculator**: Real-time validation preventing checkout if cash tendered is insufficient.

### 5. Kitchen Order Display (KDS - `/kitchen`)
- **Live Kitchen Tickets**: Kitchen staff see incoming orders in real-time with elapsed timers and bold item quantities.
- **Order Lifecycle Progression**:
  1. Cashier confirms payment $\rightarrow$ Order enters kitchen as **Pending** (New Order).
  2. Kitchen clicks **🍳 Start Preparing** $\rightarrow$ Status changes to **Preparing**.
  3. Kitchen finishes cooking and clicks **🔔 Mark Food Ready** $\rightarrow$ Status changes to **Ready**.
  4. Cashier serves/releases food to customer and clicks **✓ Food Served** $\rightarrow$ Status changes to **Completed**.
- **Auto-Refresh**: Live 10-second sync so kitchen staff never need to manually refresh the screen.

### 6. Thermal Receipt Generation (`/orders/:id`)
- Printable 80mm POS receipt with:
  - Official JAPZ GRILL logo and tagline.
  - Receipt / Order # (`JG-0001`).
  - Cashier name, date/time, order type, and table number.
  - Itemized quantity, unit price, and line total.
  - Subtotal, total amount, payment method, cash received, and change due.
  - Print button (`window.print()`) formatted for receipt printers.

### 7. Transaction History (`/orders`)
- Filter by status: `All`, `Pending`, `Preparing`, `Ready`, `Completed`, `Cancelled`.
- Search orders by order number, table, cashier, or customer note.
- Quick reprint and status transition shortcuts.

### 8. Admin Dashboard & Sales Analytics (`/reports` & `/admin`)
- **Strict Accounting Standard**: Sales totals are calculated strictly from actual completed transactions.
- **Sales Metrics**: Total paid orders, gross revenue, cash sales breakdown, card/GCash sales breakdown, and cancelled orders.
- **Period Breakdown**: Today, This Week, and This Month.
- **Best-Sellers Ranking**: Top 10 food dishes ranked by quantity sold and revenue generated.
- **Staff Performance**: Sales volume broken down per cashier.
- **Menu Management**: Add new dishes with picture URLs, prices, categories, and toggle active/hidden status.
- **Staff Management**: Create cashier accounts with username, email, and password.

---

## 🚀 How to Run

1. Ensure MySQL is running (e.g. via XAMPP, Laragon, or standalone MySQL).
2. Run database migration and initial menu seed:
   ```bash
   node migrate.js
   ```
3. Start the application:
   ```bash
   npm start
   ```
4. Access the application in your browser:
   [http://localhost:3000](http://localhost:3000)
