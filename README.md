# Upwork Income Tracker

A modern, responsive web application for tracking freelance income, expenses, and generating professional reports with full authentication system.

## 🚀 Features

### 🔐 Authentication System

- **Complete Authentication Flow**
  - User registration with validation
  - Secure login with error handling
  - Protected routes with authentication guards
  - Persistent sessions with localStorage
  - Automatic redirect to login for unauthenticated users

- **User Management**
  - Profile management with editable information
  - Settings page with comprehensive options
  - Password change functionality
  - Account preferences and privacy settings
  - Logout functionality

### ✨ Enhanced Features

- **Modern Authentication Pages**
  - Beautiful sign-in and sign-up pages with password strength validation
  - Social login options (GitHub, Google) - UI ready
  - Remember me functionality
  - Demo credentials for testing

- **Comprehensive User Management**
  - User list with search and filtering
  - Role-based access control (Admin, User, Collaborator)
  - User status tracking (Active, Inactive, Pending)
  - Share percentage management for collaborators
  - Import/Export functionality

- **Advanced Income Tracking**
  - Dedicated income list page with advanced filtering
  - Category-based income organization
  - Payment status tracking (Paid, Pending, Overdue)
  - Invoice number tracking
  - Chart and table view modes
  - Real-time statistics and analytics

- **Profile & Settings**
  - Complete profile management
  - Account statistics and information
  - Notification preferences
  - Privacy settings
  - Appearance customization
  - Password management

### 📊 Dashboard Features

- **Quick Stats Overview**
  - Total income, expenses, net profit, and collaborator count
  - Visual indicators with icons and color-coded cards
  - Real-time calculations

- **Enhanced Data Entry**
  - Improved modals for adding/editing income and expenses
  - Better form validation and user feedback
  - Date picker integration

- **Professional Reporting**
  - PDF generation with comprehensive data
  - Monthly and yearly filtering
  - Collaborator profit sharing calculations

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **UI Components**: shadcn/ui with Tailwind CSS
- **Routing**: React Router DOM v6 with protected routes
- **State Management**: React Context for authentication, React Query for server state
- **Authentication**: Custom auth context with localStorage persistence
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom gradients

## 📱 Pages

1. **Sign In** (`/signin`) - Authentication page with demo credentials
2. **Sign Up** (`/signup`) - Registration with password strength validation
3. **Dashboard** (`/`) - Main overview with quick stats and data entry (Protected)
4. **Income List** (`/income`) - Comprehensive income tracking with charts (Protected)
5. **User Management** (`/users`) - Team and collaborator management (Protected)
6. **Profile** (`/profile`) - User profile management (Protected)
7. **Settings** (`/settings`) - Account settings and preferences (Protected)
8. **Reports** (`/reports`) - Advanced reporting (Protected, coming soon)

## 🔐 Authentication

### Demo Credentials
- **Email**: `demo@example.com`
- **Password**: `password`

### Features
- Automatic session persistence
- Protected route guards
- Loading states during authentication
- Error handling and user feedback
- Secure logout functionality

## 🎨 Design Improvements

- **Color Scheme**: Professional blue-purple gradient theme
- **Typography**: Modern font hierarchy with proper spacing
- **Layout**: Responsive grid system with proper breakpoints
- **Components**: Consistent card designs with shadows and borders
- **Animations**: Smooth transitions and hover effects
- **Accessibility**: Proper contrast ratios and focus states
- **Loading States**: Spinners and skeleton screens

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Access the Application**
   - Open your browser to `http://localhost:5173`
   - Use demo credentials to sign in: `demo@example.com` / `password`
   - Or create a new account through the sign-up page

4. **Build for Production**
   ```bash
   npm run build
   ```

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/           # shadcn/ui components
│   ├── Navigation.tsx
│   ├── IncomeModal.tsx
│   ├── CostModal.tsx
│   ├── SummarySection.tsx
│   └── CollaboratorSection.tsx
├── contexts/
│   └── AuthContext.tsx  # Authentication context
├── pages/
│   ├── SignIn.tsx    # Authentication
│   ├── SignUp.tsx    # Registration
│   ├── Index.tsx     # Dashboard (Protected)
│   ├── UserList.tsx  # User management (Protected)
│   ├── IncomeList.tsx # Income tracking (Protected)
│   ├── Profile.tsx   # User profile (Protected)
│   ├── Settings.tsx  # Account settings (Protected)
│   └── NotFound.tsx  # 404 page
├── utils/
│   └── pdfGenerator.ts
└── App.tsx           # Main app with routing and auth
```

## 🔧 Configuration

The application uses:
- **Tailwind CSS** for styling with custom configuration
- **shadcn/ui** for consistent component design
- **React Router** for navigation and protected routes
- **React Context** for authentication state management
- **React Query** for data fetching and caching

## 🔒 Security Features

- Protected routes with authentication guards
- Session persistence with localStorage
- Password strength validation
- Form validation and error handling
- Secure logout functionality
- Role-based access control (UI ready)

## 📈 Future Enhancements

- [ ] Backend API integration
- [ ] Real-time notifications
- [ ] Advanced reporting with multiple chart types
- [ ] Export to Excel/CSV functionality
- [ ] Email notifications for payment reminders
- [ ] Multi-currency support
- [ ] Time tracking integration
- [ ] Client management system
- [ ] Invoice generation
- [ ] Tax calculation features
- [ ] Dark mode support
- [ ] Mobile app version

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ for freelancers and small businesses**

### 🎯 Quick Start Guide

1. **Clone and install**: `npm install`
2. **Start development**: `npm run dev`
3. **Sign in with demo**: `demo@example.com` / `password`
4. **Explore features**: Dashboard, Income tracking, User management, Profile, Settings
5. **Test authentication**: Try accessing protected routes without signing in
