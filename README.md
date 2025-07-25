# 🎓 Bhemu Calculator

A comprehensive educational calculator suite designed for students, featuring GPA calculation, profile management, real-time collaboration, and additional utility calculators.

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-11.9.1-orange.svg)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-calc--bhemu.vercel.app-brightgreen.svg)](https://calc-bhemu.vercel.app/)

## 🚀 Quick Start

**🔗 [Live Demo - Try it now!](https://calc-bhemu.vercel.app/)**

Experience all the features without any setup - just click and start calculating!

## ✨ Features

### 🎯 GPA Calculator (Primary Feature)

-   **Multi-semester Management**: Organize subjects by semesters with individual and cumulative GPA calculation
-   **Profile System**: Create multiple GPA profiles for different academic programs
-   **Real-time Collaboration**: Share profiles with classmates with read-only or edit permissions
-   **Grade System Support**: Indian/International grading scale (O=10, A+=9, A=8, etc.)
-   **Automatic Sync**: Real-time synchronization across all devices
-   **Smart Analytics**: Track total subjects, credits, and semester-wise performance

### 🧮 Additional Calculators

-   **Speed/Distance/Time Calculator**: Physics calculations with multiple unit conversions
-   **Matrix Determinant Calculator**: Linear algebra tool supporting up to 5×5 matrices
-   **Number Converter**: Convert between binary, octal, decimal, and hexadecimal systems

### 🔐 User Management

-   **Firebase Authentication**: Secure login with email/password or Google OAuth
-   **Profile Management**: Customizable user profiles with display names and avatars
-   **Password Recovery**: Built-in password reset functionality
-   **Account Security**: Secure account management and deletion options

### 🤝 Sharing & Collaboration

-   **Email-based Sharing**: Share GPA profiles with other users via email
-   **Permission Control**: Grant read-only or edit access to shared profiles
-   **Live Collaboration**: Multiple users can simultaneously edit shared profiles
-   **Share Management**: View and manage all your shared and received profiles

## 🚀 Technologies Used

-   **Frontend**: React 18.2.0, React Router DOM 6.24.1
-   **Backend**: Firebase (Authentication + Firestore)
-   **Math Engine**: Math.js for complex calculations
-   **UI Components**: React Responsive Modal
-   **Styling**: Custom CSS with responsive design
-   **Build Tool**: Create React App

## 📦 Installation

### Prerequisites

-   Node.js (v14 or higher)
-   npm or yarn
-   Firebase project with Authentication and Firestore enabled

### Setup Instructions

1. **Clone the repository**

    ```bash
    git clone https://github.com/adarsh3699/Bhemu-Calculator.git
    cd Bhemu-Calculator
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Configure Firebase**
   Create a `.env` file in the root directory:

    ```env
    REACT_APP_FIREBASE_API_KEY=your_api_key
    REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
    REACT_APP_FIREBASE_PROJECT_ID=your_project_id
    REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
    REACT_APP_FIREBASE_APP_ID=your_app_id
    REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
    ```

4. **Start the development server**

    ```bash
    npm start
    ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎮 Usage Guide

### Getting Started with GPA Calculator

1. **Sign Up/Login**: Create an account or sign in with Google
2. **Create Profile**: Your first profile is created automatically
3. **Add Semesters**: Click "Add Semester" to create semester divisions
4. **Add Subjects**: Fill in subject name, grade, and credits for each course
5. **View Results**: See real-time GPA calculations for individual semesters and cumulative GPA

### Sharing Profiles

1. **Share Profile**: Click the share button on any profile
2. **Enter Email**: Add the recipient's email address
3. **Set Permissions**: Choose read-only or edit access
4. **Manage Shares**: View and modify sharing permissions anytime

### Using Other Calculators

-   **Speed/Distance/Time**: Enter any two values to calculate the third
-   **Matrix Determinant**: Create matrices up to 5×5 and calculate determinants
-   **Number Converter**: Convert numbers between different number systems

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Shared components (NavBar, Modals, etc.)
│   └── GpaCalculator/   # GPA-specific components
├── firebase/            # Firebase configuration and services
├── pages/               # Main application pages
├── styles/              # CSS stylesheets
├── assets/              # Images, icons, and static files
└── Routes.js            # Application routing configuration
```

## 🛠 Available Scripts

-   `npm start` - Runs the app in development mode
-   `npm run build` - Builds the app for production
-   `npm run lint` - Runs ESLint to check code quality

## 🔧 Configuration

### Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password and Google providers)
3. Enable Firestore Database
4. Configure security rules for Firestore
5. Add your web app configuration to `.env`

### Environment Variables

All Firebase configuration should be stored in environment variables for security.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📋 Roadmap

-   [ ] Data visualization with charts and graphs
-   [ ] PDF/CSV export functionality
-   [ ] Progressive Web App (PWA) support
-   [ ] Multiple grading systems (different countries)
-   [ ] Mobile app development
-   [ ] Advanced analytics and insights
-   [ ] Notification system for shared profiles

## 🐛 Known Issues

-   Large GPA profiles may experience slower loading times
-   Limited to 5×5 matrices in matrix calculator
-   No offline functionality currently

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Adarsh Kumar**

-   GitHub: [@adarsh3699](https://github.com/adarsh3699)
-   Email: adarsh3699@gmail.com

## 🙏 Acknowledgments

-   Firebase for backend services
-   React community for excellent documentation
-   Math.js for mathematical computations
-   All contributors and users of Bhemu Calculator

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/adarsh3699/Bhemu-Calculator/issues) page
2. Create a new issue with detailed information
3. Contact the developer via email

---

⭐ **Star this repository if you find it helpful!**
