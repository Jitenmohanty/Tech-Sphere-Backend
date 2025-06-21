# 🧠 TechSphere – Modern Blog Platform

TechSphere is a full-featured blog application built with the **MERN Stack (MongoDB, Express.js, React.js, Node.js)** and enhanced using **TypeScript**, **Radix UI**, **TailwindCSS**, and **AI-powered assistance**.

It provides users and content creators with a powerful, user-friendly platform to **create**, **share**, and **interact** with blog content.

---

## ✨ Features

### 🔐 Authentication
- Secure login/register with hashed passwords
- JWT-based session handling with cookies
- Social login support (planned)

### 📝 Blogging
- Create, edit, delete, and publish blog posts
- Share blogs via social channels
- Save/like blogs for future reading
- Owner control on editing and deleting blogs

### 💬 Comments & Replies
- Nested commenting with threaded replies
- Edit/delete your comments
- Realtime interaction updates

### 🤖 AI-Powered Reader Assistant
- Select text and ask the AI chatbot (Google Generative AI)
- Explain terms, detect issues, verify facts

### 👤 User Profiles
- Upload profile image, bio, and social links
- View saved/liked blogs
- Public and editable profile pages

### 📱 Responsive UI
- Built using **Radix UI**, **ShadCN**, and **TailwindCSS**
- Mobile-first and fully responsive
- Keyboard and screen-reader friendly

---

## 🛠️ Tech Stack

| Layer              | Tech                                                                 |
|--------------------|----------------------------------------------------------------------|
| **Frontend**       | React, TypeScript, Vite, TailwindCSS, ShadCN, Radix UI              |
| **Backend**        | Node.js, Express.js, MongoDB, Mongoose                              |
| **Authentication** | JWT, bcryptjs, cookie-parser                                        |
| **AI**             | @google/generative-ai                                               |
| **Forms & UX**     | Zod, React Hook Form, Lucide Icons, Tailwind CSS Animate            |
| **Others**         | Cloudinary, Multer, React Query, DateFns, TipTap                    |

---

## 🧩 Folder Structure

```bash
techSphere/
├── backend/
│   ├── controllers/       # All logic for routes
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API routes
│   ├── middlewares/       # Auth, error handlers
│   └── server.js          # App entry point
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Main app pages
│   │   ├── features/      # Blog, Auth, Comments, etc.
│   │   └── lib/           # Utils, constants, configs
│   └── vite.config.ts     # Vite configuration
└── README.md
```

---

## 🧠 AI Chatbot Assistant

Easily clarify any part of a blog by selecting the text and invoking the AI Assistant. It can:

- ✅ Explain difficult concepts  
- ✅ Translate selected text  
- ✅ Detect factual inconsistencies  
- ✅ Suggest improvements  

Powered by `@google/generative-ai`

---

## 🚀 Getting Started

### 📦 Backend Setup

```bash
cd backend
npm install
npm run dev
```

Create a `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

### 🎨 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

App runs on [http://localhost:5173](http://localhost:5173)

---

## 🧭 Architecture Diagram

```
                  +----------------------+
                  |   Frontend (Vite)    |
                  |  React + TS + UI     |
                  +----------+-----------+
                             |
                             v
                 +-----------+-----------+
                 |        Express.js     |
                 | JWT + REST API Layer  |
                 +-----------+-----------+
                             |
                             v
                  +----------+----------+
                  |       MongoDB       |
                  |   (Mongoose ORM)    |
                  +---------------------+

      +---------------------------------------------+
      |      Cloudinary for Media Uploads           |
      |     Google Generative AI for Assistant      |
      +---------------------------------------------+
```

---

## 📸 Screenshots

*Coming soon...*

---

## 📄 License

This project is licensed under the MIT License.

---

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repo  
2. Create a feature branch  
3. Submit a pull request  

---

## 📬 Contact

Built with ❤️ by **[Jiten Kumar Mohanty]**  
📧 Email: [jitenmoahntyaz@gmail.com]  
🌐 Portfolio: [https://portfolio-react-me.vercel.app/]

---

## 📢 Support

If you found this project useful:

- ⭐ Star the repository on GitHub  
- 📣 Share it with others  
- 🛠️ Submit issues or feature suggestions  

---

## ✅ Next Suggestions

- [x] Add GitHub Actions for lint/test
- [x] Add live demo link (Vercel for frontend + Render for backend)
- [x] Auto-deploy badge
- [x] Dockerize your app

---

Let me know if you'd like a **downloadable `README.md` file**, deployment configuration help, or badge integration!

