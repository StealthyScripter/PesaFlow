# PesaFlow Frontend - React Next.js Application

A modern React Next.js frontend for the PesaFlow SACCO Management Platform, converted from the original HTML prototype.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Backend API running on `http://localhost:5000`

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your API URL:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   ```
   http://localhost:3000
   ```

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles with design system
│   ├── layout.tsx         # Root layout component
│   └── page.tsx          # Main page component
├── components/            # React components
│   ├── screens/          # Main screen components
│   │   ├── DashboardScreen.tsx
│   │   ├── TransactionsScreen.tsx
│   │   ├── AddTransactionScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── AdminScreen.tsx
│   ├── DashboardLayout.tsx
│   ├── LoginScreen.tsx
│   └── Notification.tsx
├── contexts/             # React contexts
│   └── AuthContext.tsx
├── services/            # API service layer
│   ├── api.ts           # Base API utilities
│   ├── userService.ts   # User API calls
│   ├── accountService.ts # Account API calls
│   └── transactionService.ts # Transaction API calls
└── types/               # TypeScript type definitions
    └── index.ts
```

## 🎨 Key Features

### ✅ Converted from Original HTML
- **Authentication:** Simple member number-based login
- **Dashboard:** Account overview with balance cards and recent transactions
- **Transactions:** View all transactions with filtering and pagination
- **Add Transaction:** Form to create new transactions
- **Profile Management:** Edit user profile information
- **Settings:** Theme switching and API configuration
- **Admin Panel:** Transaction approval and system overview (for admin users)

### ✅ Modern Tech Stack
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React Hooks** for state management
- **Fetch API** for HTTP requests

### ✅ Design System
- **Consistent styling** with CSS custom properties
- **Dark/Light theme** support
- **Responsive design** for mobile and desktop
- **Accessible components** with proper ARIA labels
- **Loading states** and error handling

## 🔧 Configuration

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### API Integration
The frontend expects the backend API to be running with the following endpoints:
- `GET /api/users/:memberNumber` - Get user by member number
- `GET /api/accounts/:memberNumber` - Get account details
- `GET /api/transactions/member/:memberNumber` - Get user transactions
- `POST /api/transactions` - Create new transaction
- And more...

## 🧪 Testing

Run tests with:
```bash
npm test
```

Watch mode:
```bash
npm run test:watch
```

## 🚧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests

### Demo Accounts

Use these member numbers for testing:
- `MEM001` - Admin user with full access
- `MEM002` - Regular user
- `MEM003` - Another regular user

## 📝 API Documentation

The frontend consumes the PesaFlow backend API. Make sure the backend is running before starting the frontend.

### Expected API Responses

**User Response:**
```json
{
  "_id": "...",
  "memberNumber": "MEM001",
  "fname": "John",
  "lname": "Doe",
  "email": "john@example.com",
  "phoneNumber": "+1234567890",
  "dateJoined": "2025-01-01T00:00:00.000Z",
  "isActive": true
}
```

**Account Response:**
```json
{
  "_id": "...",
  "memberNumber": "MEM001",
  "savings": 5000,
  "monthlyContribution": 250,
  "sharesOwned": 10,
  "accountStatus": "active",
  "lastTransactionDate": "2025-01-15T00:00:00.000Z"
}
```

## 🎯 Key Differences from Original HTML

### Simplified Architecture
- **Removed complex animations** and kept only essential UI transitions
- **Simplified state management** using React hooks instead of vanilla JS
- **Cleaner API integration** with dedicated service layer
- **Better error handling** with user-friendly notifications

### Enhanced User Experience
- **Responsive design** that works on all devices
- **Loading states** for better perceived performance
- **Form validation** with real-time feedback
- **Keyboard navigation** support

### Modern Development Practices
- **TypeScript** for type safety and better development experience
- **Component-based architecture** for better maintainability
- **Separation of concerns** with dedicated service layer
- **Environmental configuration** for different deployment environments

## 🔒 Security Considerations

- **Client-side only:** This is a frontend application with no server-side authentication
- **Environment variables:** API URLs and sensitive config stored in environment variables
- **Input validation:** Forms include client-side validation (server-side validation still required)
- **HTTPS recommended:** Use HTTPS in production for secure communication

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel (Recommended)
```bash
npx vercel --prod
```

### Deploy to Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
```

### Environment Variables for Production
Set these in your deployment platform:
```
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Add TypeScript types for all new components/functions
3. Test your changes thoroughly
4. Update documentation as needed

## 📞 Support

For issues related to:
- **Frontend bugs:** Check browser console and network tab
- **API integration:** Ensure backend is running and accessible
- **Authentication:** Verify user exists in backend database
- **Performance:** Check network requests and optimize as needed