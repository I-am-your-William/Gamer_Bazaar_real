# GamerBazaar System - File Roles Documentation

This document explains the role and responsibility of each file in the GamerBazaar gaming e-commerce platform.

## 📁 Root Configuration Files

### `package.json`
- **Role**: Main project configuration and dependency management
- **Contains**: NPM scripts, dependencies, project metadata
- **Key Scripts**: `npm run dev` (start development), `npm run db:push` (database migrations)

### `tsconfig.json`
- **Role**: TypeScript compiler configuration
- **Contains**: Type checking rules, path aliases, compilation options

### `vite.config.ts`
- **Role**: Vite build tool configuration
- **Contains**: Frontend build settings, development server configuration, path aliases

### `tailwind.config.ts`
- **Role**: Tailwind CSS configuration
- **Contains**: Theme customization, color scheme, component styling rules

### `drizzle.config.ts`
- **Role**: Database ORM configuration
- **Contains**: Database connection settings, migration paths

### `.env` / `.env.example`
- **Role**: Environment variables configuration
- **Contains**: Database URLs, API keys, service credentials

## 📁 Shared Directory (`shared/`)

### `shared/schema.ts`
- **Role**: Central database schema definition
- **Contains**: 
  - All database table definitions (users, products, orders, reviews, etc.)
  - Type definitions for TypeScript
  - Validation schemas using Zod
  - Database relationships and constraints
- **Importance**: Single source of truth for data structure across frontend and backend

## 📁 Server Directory (`server/`)

### Core Server Files

#### `server/index.ts`
- **Role**: Main server entry point
- **Contains**: Express app initialization, middleware setup, server startup

#### `server/routes.ts`
- **Role**: API endpoints definition
- **Contains**: All REST API routes (/api/products, /api/orders, /api/reviews, etc.)
- **Handles**: CRUD operations, business logic routing

#### `server/storage.ts`
- **Role**: Database operations abstraction layer
- **Contains**: 
  - IStorage interface defining all database operations
  - DatabaseStorage class implementing PostgreSQL operations
  - Functions for products, orders, users, reviews, inventory management

### Authentication & Security

#### `server/localAuth.ts`
- **Role**: Local username/password authentication system
- **Contains**: 
  - Passport.js configuration
  - Password hashing (scrypt)
  - Session management
  - Login/logout/register endpoints

#### `server/replitAuth.ts`
- **Role**: Replit platform authentication (alternative auth method)
- **Contains**: OAuth integration for Replit users

### Database Configuration

#### `server/db.ts`
- **Role**: Production database connection (Neon serverless)
- **Contains**: PostgreSQL connection pool, Drizzle ORM setup

#### `server/db-local.ts`
- **Role**: Local development database connection
- **Contains**: Local PostgreSQL connection for development

### Services

#### `server/services/emailService.ts`
- **Role**: Email notification system
- **Contains**: 
  - Order confirmation emails
  - Product verification notifications
  - Gmail SMTP configuration
  - HTML email templates

#### `server/services/qrService.ts`
- **Role**: QR code generation and management
- **Contains**: 
  - QR code creation for product verification
  - QR code styling and customization
  - Verification URL generation

### Utilities

#### `server/fileUpload.ts`
- **Role**: File upload handling (product images, verification photos)
- **Contains**: Multer configuration, file storage management

#### `server/vite.ts`
- **Role**: Development server integration
- **Contains**: Vite development server setup, static file serving

## 📁 Client Directory (`client/`)

### Main Application

#### `client/src/App.tsx`
- **Role**: Main React application component
- **Contains**: Router setup, global providers, layout structure

#### `client/src/main.tsx`
- **Role**: React application entry point
- **Contains**: App rendering, root DOM mounting

### Pages (`client/src/pages/`)

#### `client/src/pages/home-page.tsx`
- **Role**: Homepage with product showcase
- **Contains**: Featured products, hero section, navigation

#### `client/src/pages/product-detail.tsx`
- **Role**: Individual product pages
- **Contains**: Product information, reviews section, add to cart functionality

#### `client/src/pages/auth-page.tsx`
- **Role**: Login and registration forms
- **Contains**: User authentication interface

#### `client/src/pages/admin-dashboard.tsx`
- **Role**: Admin panel interface
- **Contains**: 
  - Sales analytics and charts
  - Order management
  - Product inventory control
  - User management

#### `client/src/pages/cart.tsx`
- **Role**: Shopping cart interface
- **Contains**: Cart items display, quantity updates, checkout navigation

#### `client/src/pages/checkout.tsx`
- **Role**: Order placement process
- **Contains**: Shipping forms, payment selection, order confirmation

#### `client/src/pages/orders.tsx`
- **Role**: Order history and tracking
- **Contains**: User's order list, order details, status tracking

### Components (`client/src/components/`)

#### Reviews System
- **`client/src/components/reviews/ReviewSection.tsx`**
  - **Role**: Complete review and rating system
  - **Contains**: 
    - Star rating display and input
    - Review writing dialog
    - Review list with helpful voting
    - Rating statistics

#### UI Components (`client/src/components/ui/`)
- **Role**: Reusable UI components based on shadcn/ui
- **Contains**: Buttons, dialogs, forms, cards, navigation components

### Hooks (`client/src/hooks/`)

#### `client/src/hooks/use-auth.tsx`
- **Role**: Authentication state management
- **Contains**: Login/logout functions, user session management

#### `client/src/hooks/use-mobile.tsx`
- **Role**: Responsive design utilities
- **Contains**: Mobile device detection

### Library (`client/src/lib/`)

#### `client/src/lib/queryClient.ts`
- **Role**: API communication setup
- **Contains**: TanStack Query configuration, HTTP request functions

#### `client/src/lib/protected-route.tsx`
- **Role**: Route protection for authenticated users
- **Contains**: Authentication guards, redirect logic

## 📁 Scripts Directory (`scripts/`)

### `scripts/seed-products.js`
- **Role**: Database seeding with sample data
- **Contains**: 
  - Gaming product data insertion
  - Category creation
  - Inventory unit generation
  - Development data setup

## 📁 Documentation Files

### Setup and Configuration
- **`README.md`**: Project overview and basic setup
- **`QUICK_START.md`**: Fast setup guide
- **`LOCAL_SETUP_GUIDE.md`**: Detailed local development setup
- **`LOCALHOST_SETUP_GUIDE.md`**: Localhost-specific configuration
- **`WINDOWS_SETUP.md`**: Windows development environment setup
- **`EMAIL_SETUP_GUIDE.md`**: Email service configuration
- **`TECHNICAL_SYSTEM_DOCUMENTATION.md`**: Comprehensive technical architecture

### Project Context
- **`replit.md`**: Project preferences, architecture summary, changelog
- **`ESSENTIAL_FILES.md`**: Critical files for system operation

## 📁 Platform Files

### Replit Configuration
- **`.replit`**: Replit platform configuration
- **`replit.nix`**: Nix package management for Replit

### Build and Development
- **`postcss.config.js`**: PostCSS configuration for Tailwind
- **`components.json`**: shadcn/ui component configuration

## 🗂️ Data Flow Summary

### Authentication Flow
1. `client/src/pages/auth-page.tsx` → User login/register
2. `server/localAuth.ts` → Password validation & session creation
3. `client/src/hooks/use-auth.tsx` → Frontend auth state management

### Product Management Flow
1. `shared/schema.ts` → Data structure definition
2. `server/storage.ts` → Database operations
3. `server/routes.ts` → API endpoints
4. `client/src/pages/product-detail.tsx` → Product display

### Order Processing Flow
1. `client/src/pages/cart.tsx` → Shopping cart
2. `client/src/pages/checkout.tsx` → Order placement
3. `server/services/emailService.ts` → Confirmation emails
4. `server/services/qrService.ts` → Product verification codes

### Review System Flow
1. `client/src/components/reviews/ReviewSection.tsx` → Review interface
2. `server/routes.ts` → Review API endpoints
3. `server/storage.ts` → Review database operations
4. `shared/schema.ts` → Review data structure

## 🔧 Key Dependencies by Category

### Backend Core
- **Express.js**: Web server framework
- **Drizzle ORM**: Database operations
- **Passport.js**: Authentication
- **Multer**: File uploads

### Frontend Core
- **React**: UI framework
- **TanStack Query**: Server state management
- **Wouter**: Routing
- **Tailwind CSS**: Styling

### Database
- **PostgreSQL**: Primary database
- **Neon**: Serverless PostgreSQL (production)

### Development
- **Vite**: Build tool
- **TypeScript**: Type safety
- **ESBuild**: Fast compilation

This documentation provides a complete map of how each file contributes to the GamerBazaar e-commerce platform's functionality.