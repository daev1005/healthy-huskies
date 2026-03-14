# 🥗 Healthy Huskies

**Healthy Huskies** is a full-stack web application that helps Northeastern University students track daily meals and calorie intake using **real dining hall menu data**. The platform allows users to browse dining hall menus, log meals into a personal daily meal plan, and visualize calorie consumption over time.

This project was built to explore **end-to-end web application development**, including API design, authentication, data validation, and frontend state management.

**Repository:** https://github.com/daev1005/healthy-huskies

---

## 🚀 Features

### 🍽️ Dining Hall Menu Browsing
- Browse Northeastern dining hall menus  
- Currently supports **International Village (IV)** and **Stetson East (Steast)**  
- View food items with associated calorie information  
- Data sourced from Northeastern Dining Services  

---

### 📊 Meal & Calorie Tracking
- Add meals to a daily meal plan  
- Automatically calculate total daily calorie intake  
- Edit or remove meals at any time  
- Functions similarly to a personal calorie tracker  

---

### 📅 Weekly Meal History
- View meals consumed over the past week (starting Sunday)  
- Weekly reset to keep tracking organized and relevant  

---

### 🥧 Data Visualization
- Pie chart visualization of calorie distribution by meal period:
  - Breakfast
  - Lunch
  - Dinner

---

### 🌐 Community Page
- Blog-style community page  
- Users can create posts and interact with others  

---

## 🛠️ Tech Stack

**Frontend**
- React
- Chart.js (or similar charting library)

**Backend**
- Node.js
- Express
- MongoDB

**Other**
- RESTful API design
- JWT-based authentication
- User-specific data ownership enforcement

**DEMO**
- [![Watch the demo](https://img.youtube.com/vi/D0IKClWj9YI/0.jpg)](https://youtu.be/D0IKClWj9YI)

---

## 📦 Installation & Running Locally

### Prerequisites

Make sure you have:

- Docker (Desktop or Engine)

- Docker Compose (usually comes with Docker Desktop)

- No need to install Node.js or MongoDB locally — Docker handles it.

### 1️⃣ Clone the Repository
git clone https://github.com/daev1005/healthy-huskies.git
cd healthy-huskies

### 2️⃣ Create a .env file

In the project root, create .env and add:
```bash
PORT=5000
MONGO_URI=mongodb://mongo:27017/healthyhuskies
JWT_SECRET=your_jwt_secret
VITE_API_URL=http://backend:5000
```

Note: mongo is the hostname for the MongoDB container in Docker.

### 3️⃣ Start the Application

Build and start all containers:
```bash
docker compose up --build
```

This will start:

- Backend → http://localhost:5000

- Frontend → http://localhost:5173

- MongoDB → accessible inside Docker as mongo:27017

Check running containers:
```bash
docker ps
```

### 4️⃣ Stop the Application
```bash
docker compose down
```

Add -v to also remove volumes (resets database):

```bash
docker compose down -v
```

### 5️⃣ Notes

- The frontend uses Vite — Docker runs it in development mode with hot reload.

- Backend automatically connects to MongoDB using the service name mongo.

- Environment variables from .env are automatically injected into containers.
