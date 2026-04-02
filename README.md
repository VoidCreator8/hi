# ShopHub - Online Shop

A complete online shop with a secure admin dashboard built with HTML, CSS, JavaScript, and Node.js (Express).

## Features

### Storefront
- **Home page** with featured products and category browsing
- **Shop page** with category filters and product search
- **Product cards** with images, names, prices, and add-to-cart functionality
- **Shopping cart** with quantity controls, persisted via localStorage
- **Checkout page** with shipping and payment form (demo)

### Admin Dashboard
- Secure login with JWT authentication
- Dashboard with product/category statistics
- Full CRUD for **products** (name, price, description, image, category, featured flag)
- Full CRUD for **categories** (name, description)
- Image upload support via file upload or URL
- Protected admin API routes

### Backend
- **Node.js + Express** REST API
- **SQLite** database (via better-sqlite3)
- JWT-based authentication
- Image upload handling with Multer
- Seeded with sample data on first run

## Project Structure

```
├── backend/
│   ├── server.js           # Express server entry point
│   ├── database.js         # SQLite database setup & seeding
│   ├── package.json        # Backend dependencies
│   ├── middleware/
│   │   └── auth.js         # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js         # Login & token verification
│   │   ├── categories.js   # Category CRUD endpoints
│   │   └── products.js     # Product CRUD endpoints
│   └── uploads/            # Uploaded product images
├── frontend/
│   ├── index.html          # Home page
│   ├── shop.html           # Shop page with filters
│   ├── cart.html            # Shopping cart
│   ├── checkout.html       # Checkout form
│   ├── admin-login.html    # Admin login
│   ├── admin.html          # Admin dashboard
│   ├── css/
│   │   └── style.css       # All styles
│   └── js/
│       ├── api.js          # API helper module
│       └── cart.js          # Cart management (localStorage)
└── README.md
```

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v16 or later

### Installation

```bash
# Clone the repository
git clone https://github.com/VoidCreator8/hi.git
cd hi

# Install backend dependencies
cd backend
npm install

# Start the server
npm start
```

The app will be available at **http://localhost:3000**

### Development Mode

```bash
cd backend
npm run dev
```

This uses nodemon for auto-reloading on file changes.

## Admin Access

- **URL**: http://localhost:3000/admin-login.html
- **Username**: `admin`
- **Password**: `admin123`

> The admin credentials are hardcoded in the backend. Change them in `backend/database.js` for production use.

## API Endpoints

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (supports `?category=`, `?search=`, `?featured=true`) |
| GET | `/api/products/:id` | Get single product |
| GET | `/api/categories` | List categories |
| GET | `/api/categories/:id` | Get single category |

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Admin login (returns JWT) |
| GET | `/api/auth/verify` | Verify JWT token |

### Admin (requires Bearer token)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/products` | Create product (supports file upload) |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |
| POST | `/api/categories` | Create category |
| PUT | `/api/categories/:id` | Update category |
| DELETE | `/api/categories/:id` | Delete category |

## Tech Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: SQLite (better-sqlite3)
- **Auth**: JWT (jsonwebtoken) + bcryptjs
- **File Upload**: Multer
