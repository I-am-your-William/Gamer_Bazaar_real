# Gamer Bazaar - Gaming Equipment E-Commerce Platform

## Overview

Gamer Bazaar is a comprehensive e-commerce platform designed specifically for gaming equipment with advanced inventory management and product verification features. The application combines a React frontend with an Express.js backend, utilizing PostgreSQL for data persistence. The system features QR code-based product authentication, local username/password authentication, and complete e-commerce functionality including shopping cart, checkout, and order management.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Tailwind CSS with custom cyberpunk gaming theme
- **Component Library**: Radix UI components with shadcn/ui styling
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js 20
- **Authentication**: Passport.js with local strategy and session management
- **File Uploads**: Multer for handling product verification images
- **Email Service**: Mock email service for order confirmations (extensible for real providers)
- **QR Code Generation**: QRCode library for product verification

### Database Architecture
- **Primary Database**: PostgreSQL with Drizzle ORM
- **Session Storage**: PostgreSQL sessions table for authentication
- **Database Connection**: Dual support for local PostgreSQL and Neon serverless
- **Migration Strategy**: Drizzle Kit for schema migrations

## Key Components

### Authentication System
- Local username/password authentication using Passport.js
- Separate admin authentication system with simple credentials (admin/1234)
- Session-based authentication with secure cookie handling
- Role-based access control (customer/admin)

### Product Management
- Complete product catalog with categories, descriptions, and pricing
- Image upload and management for product verification
- Inventory tracking with individual unit management
- Serial number and security code tracking for authenticity

### E-Commerce Features
- Shopping cart functionality with persistent sessions
- Multi-step checkout process with shipping and billing addresses
- Order management with status tracking
- Payment method selection (UI only - no actual payment processing)

### QR Code Verification System
- Unique QR code generation for each product unit
- Camera-based QR code scanning for verification
- Manual code entry fallback option
- Product authenticity verification with detailed results

### Admin Dashboard
- Inventory management with stock level controls
- Order status management and tracking
- QR code management and verification oversight
- Product catalog administration

## Data Flow

### User Registration/Login Flow
1. User submits credentials via auth form
2. Passport.js validates credentials against database
3. Session created and stored in PostgreSQL
4. User context updated throughout application

### Product Purchase Flow
1. User browses products from PostgreSQL catalog
2. Items added to cart (stored in database with user session)
3. Checkout process collects shipping/billing information
4. Order created with unique QR codes for each product unit
5. Email confirmation sent (mock implementation)

### Product Verification Flow
1. Customer receives product with QR code
2. QR code scanned or manually entered
3. System validates code against database
4. Verification result displayed with product details
5. Verification status updated in database

## External Dependencies

### Runtime Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver
- **@tanstack/react-query**: Server state management
- **@radix-ui/react-***: UI component primitives
- **drizzle-orm**: TypeScript ORM for PostgreSQL
- **express**: Web application framework
- **multer**: File upload middleware
- **passport**: Authentication middleware
- **qrcode**: QR code generation library
- **react-hook-form**: Form state management
- **tailwindcss**: Utility-first CSS framework
- **zod**: TypeScript-first schema validation

### Development Dependencies
- **typescript**: Static type checking
- **vite**: Build tool and development server
- **tsx**: TypeScript execution for Node.js
- **drizzle-kit**: Database migration toolkit

### Database Requirements
- PostgreSQL 16+ (local development)
- Alternative: Neon serverless PostgreSQL (production)

## Deployment Strategy

### Local Development
- **Prerequisites**: Node.js 18+, PostgreSQL 16+
- **Environment**: `.env` file with database connection string
- **Database Setup**: Manual database creation and schema migration
- **File Storage**: Local file system for product images
- **Session Storage**: PostgreSQL sessions table

### Production Deployment (Replit)
- **Platform**: Replit autoscale deployment
- **Database**: Neon serverless PostgreSQL
- **Build Process**: Vite frontend build + esbuild backend bundle
- **Environment Variables**: Replit secrets management
- **File Storage**: Replit filesystem (ephemeral)

### Configuration Management
- Environment-specific database drivers (local vs. serverless)
- Conditional WebSocket configuration for Neon
- Development vs. production authentication settings
- Cross-platform compatibility (Windows batch files included)

## User Preferences

Preferred communication style: Simple, everyday language.
Priority: Fix functionality immediately without loading delays or complex queries.
Cost concern: User frustrated with $2 spent on basic functionality - prioritize direct working solutions.

## Changelog

### June 24, 2025
- Initial setup and debugging of gaming equipment e-commerce platform
- Fixed major performance issues (reduced API response times from 572ms to 26ms)
- Implemented complete admin product management system
- Added comprehensive order management with dummy payment processing
- **Email Notification System**: Implemented order confirmation emails with:
  - Product serial numbers for each ordered item
  - Security QR code images for product verification
  - Professional HTML email templates
  - Automatic inventory unit assignment (available → sold)
  - Fallback to console logging if email credentials not provided
- Enhanced inventory management with individual unit tracking
- Added customer order tracking with detailed progress visualization
- **Admin Order Management System**: Complete admin dashboard functionality with:
  - Session-based authentication with fallback for browser compatibility
  - View all customer orders from all users with proper address rendering
  - Edit order statuses via dropdown menus
  - Navigation buttons with highlighted styling (Back to Dashboard)
  - Fixed React rendering errors for mixed address formats
  - Updated inventory button styling to light blue as requested
  - Updated inventory page buttons: "Add Unit" buttons changed to green, "Add New Product" button prominently displayed
  - **Fixed Footer 404 Errors**: Updated footer links to point to existing pages instead of undefined routes that were causing 404 errors at bottom of homepage
- **QR Code Generation System**: Implemented comprehensive QR code system with:
  - Automatic QR code generation when orders are placed
  - QR codes visible to both admin and users until product delivery
  - Product authentication page showing product details and certificates
  - Certificate upload functionality in inventory unit creation
  - QR code deactivation when orders are marked as delivered
  - Clear separation between active and inactive QR codes