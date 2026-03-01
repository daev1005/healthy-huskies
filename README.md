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
Make sure you have the following installed:
- **Node.js** (v18 or newer)
- **MongoDB** (local installation or MongoDB Atlas)
- **Git**

---

### Clone the Repository
```bash
git clone https://github.com/daev1005/healthy-huskies.git
cd healthy-huskies
```

### Install Dependencies
```bash
npm install
```

Install app dependencies:
```bash
npm --prefix backend install
npm --prefix frontend install
```

### Environment Variables

Create a `.env` file in the project root and add:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
FRONTEND_URL=http://localhost:5173
# Local development only: bypass JWT auth/account creation
LOCAL_AUTH_BYPASS=true
# Optional local identity fields:
# LOCAL_DEV_USER_ID=000000000000000000000001
# LOCAL_DEV_USER_NAME=Local Dev
# LOCAL_DEV_USER_EMAIL=local-dev@example.com
# LOCAL_DEV_USER_ROLE=admin
```
### Run the Application

```bash
npm run dev
```

This starts both:
- Backend at `http://localhost:5000`
- Frontend at `http://localhost:5173`

You can also run each app separately:
```bash
npm run dev:backend
npm run dev:frontend
```

The backend will start at:
`http://localhost:5000`

If the frontend is run separately, start it using the appropriate frontend script and visit the URL shown in the terminal.
