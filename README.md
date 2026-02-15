# CSA Portal - Computer Science Association 🎓

The official digital platform for the Computer Science Association at International University of Africa. A modern, high-performance web application designed to connect students with the latest tech news, events, and academic resources.

![Status](https://img.shields.io/badge/Status-Active-success)
![Version](https://img.shields.io/badge/Version-2.0.0-blue)
![Tech](https://img.shields.io/badge/Built%20With-React%20%7C%20TypeScript%20%7C%20Tailwind-0ea5e9)

## 🚀 Key Features

### 📱 User Experience
-   **Progressive Web App (PWA)**: Fully installable on iOS and Android devices with a native app-like feel.
-   **Bilingual Interface**: Seamless switching between English (LTR) and Arabic (RTL) layouts.
-   **Dark Mode**: Automatic theme detection and manual toggle for comfortable viewing.
-   **Responsive Design**: Optimized for all screen sizes, from mobile phones to 4K desktops.

### 📰 News & Media
-   **Instagram-Style Carousel**: View multiple images and videos in a single post with swipe gestures.
-   **Smart Search & Filtering**: Find content instantly by tags, keywords, or dates.
-   **Engagement**: Like posts, track views, and share content easily.

### 📅 Events Management
-   **Interactive Calendar**: Browse upcoming and past events.
-   **Hybrid Support**: Clear distinction between Physical and Online events with direct meeting links (Zoom/Meet).
-   **Calendar Integration**: One-click "Add to Google Calendar" functionality.

### 🛡️ Admin Dashboard
-   **Content Management**: Create, edit, and delete news posts and events with a rich editor.
-   **Media Gallery**: Upload and manage multiple media assets per post (up to 128 items).
-   **Analytics**: Track post performance (Views vs. Likes) and engagement rates.
-   **Team Management**: manage association members and roles.

## 🛠️ Technology Stack

-   **Frontend Framework**: [React 18](https://reactjs.org/)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Build Tool**: [Vite](https://vitejs.dev/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **AI Integration**: Google Generative AI (Gemini) ready

## 📦 Installation & Setup

### Prerequisites
-   Node.js (v18.0.0 or higher)
-   npm (v9.0.0 or higher)

### Steps
1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/csa-portal.git
    cd csa-portal
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Start Development Server**
    ```bash
    npm run dev
    ```
    The application will launch at `http://localhost:5173`.

4.  **Build for Production**
    ```bash
    npm run build
    ```

## 📱 Mobile Installation (PWA)

This portal is designed to be installed as an app:

*   **iOS (iPhone/iPad)**:
    1.  Open in **Safari**.
    2.  Tap the **Share** button.
    3.  Select **"Add to Home Screen"**.
    
*   **Android**:
    1.  Open in **Chrome**.
    2.  Tap the **Menu** (three dots).
    3.  Select **"Install App"** or **"Add to Home screen"**.

## 📂 Project Structure

```bash
/src
├── /components     # Reusable UI components (Footer, Navbar, Cards)
├── /pages          # Main Views (Home, Events, Admin, About)
├── /types          # TypeScript interfaces (NewsPost, EventItem, Member)
├── /services       # API services and helpers
├── App.tsx         # Main application router and layout
└── main.tsx        # Entry point
/public             # Static assets (images, icons, manifest.json)
```

## 🤝 Contributing

We welcome contributions from the student community!
1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
**CSA Tech Team** - *Innovating the Future*
