# Essential Files for Local Development

## Core Application Files (REQUIRED)
```
📁 client/                    # Frontend React application
📁 server/                    # Backend Express server
📁 shared/                    # Shared types and database schema
📁 uploads/                   # File upload storage (create this folder)
📄 package.json              # Dependencies and scripts
📄 .env                       # Database configuration (copy from .env.example)
📄 drizzle.config.ts         # Database migration configuration
📄 tsconfig.json             # TypeScript configuration
📄 tailwind.config.ts        # CSS framework configuration
📄 vite.config.ts             # Frontend build configuration
📄 postcss.config.js         # CSS processing
📄 components.json           # UI component configuration
```

## Setup Files (NEEDED FOR SETUP)
```
📄 .env.example              # Template for environment variables
📄 start-local.bat           # Windows startup script
📄 LOCAL_SETUP_GUIDE.md      # Complete setup instructions
📄 QUICK_START.md            # 5-minute setup guide
📄 WINDOWS_SETUP.md          # Windows-specific instructions
📄 LOCAL_DATABASE_FIX.md     # Database connection troubleshooting
📄 ESSENTIAL_FILES.md        # This file
```

## Files You Can Delete (NOT NEEDED)
```
📄 setup-local.md            # Duplicate setup guide
📄 WINDOWS_RUN_INSTRUCTIONS.md # Superseded by other guides
📄 admin_cookies.txt         # Test cookies
📄 admin_session.txt         # Test session
📄 cookies.txt               # Test cookies
📄 demo_session.txt          # Test session
📄 test_cookies.txt          # Test cookies
📄 user_cookies.txt          # Test cookies
📄 test-qr.html              # Test file
📁 attached_assets/          # Screenshots from our conversation
```

## Auto-Generated Files (IGNORE)
```
📁 node_modules/             # Dependencies (auto-created by npm install)
📁 dist/                     # Build output
📄 package-lock.json        # Dependency lock file
📄 .gitignore               # Git ignore rules
📄 .replit                  # Replit configuration (not needed locally)
```

## Minimum Files for Local Setup
1. Copy entire `client/`, `server/`, `shared/` folders
2. Copy `package.json`, `tsconfig.json`, `vite.config.ts`, `tailwind.config.ts`
3. Copy `.env.example` and rename to `.env` with your PostgreSQL password
4. Copy `start-local.bat` for easy startup
5. Create empty `uploads/` folder
6. Run `npm install` and `npm run db:push`
7. Start with `start-local.bat`

That's it! Your gaming equipment e-commerce application will be ready for local Windows development.