<div align="center">
  <h1 align="center">🛡️ Disaster Resource Coordination Platform</h1>
  <p align="center">
    <strong>Fast, Coordinated, Life-Saving Disaster Relief in Real Time.</strong><br>
    <em>Engineered by Team Sync6 to eliminate communication lag, streamline emergency inventory, and dispatch field aid.</em>
  </p>

  <p align="center">
    <a href="#-about-the-product">About The Product</a> •
    <a href="#-how-it-helps-you">How It Works</a> •
    <a href="#-key-features">Key Features</a> •
    <a href="#-technology-stack">Tech Stack</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-team-sync6">Team Sync6</a>
  </p>
</div>

---

## 🌟 About The Product

When disaster strikes, delays cost lives. Traditional relief channels often suffer from fragmented phone calls, unverified social media posts, lost paper logs, and zero delivery tracking. 

The **Disaster Resource Coordination Platform** bridges this critical gap. It is a full-stack, real-time emergency ecosystem that connects **citizens in distress**, **accredited NGOs**, **field volunteers**, and **disaster operators** into one unified, synchronized hub.

---

## 💡 How It Helps You (By User Role)

### 🆘 1. For Citizens & Families
- **Instant Geotagged Aid Requests:** Submit requests for food, clean water, medical supplies, or shelter with exact GPS location and photos.
- **Live Status Tracking:** Track your request stage-by-stage (*Pending* ➔ *Verified* ➔ *Assigned* ➔ *Delivered*).
- **Emergency Shelter Locator:** Find active shelters near you with live bed capacity, food availability, and emergency contacts.

### 🏢 2. For Relief NGOs & Organizations
- **Verification Engine:** Review and verify incoming citizen distress calls to eliminate duplicates and prioritize critical cases.
- **Live Stock & Inventory Tracker:** Monitor food packs, medical kits, and blankets in real time to prevent shortages.
- **Volunteer Mission Dispatch:** Assign relief delivery orders directly to nearby field volunteers.

### 🙋 3. For Field Volunteers & Responders
- **Instant Mission Dispatch:** Receive clear delivery tasks complete with items list, recipient details, and exact coordinates.
- **Turn-by-Turn Guidance:** Navigate straight to affected families without getting lost in disaster-affected areas.
- **One-Tap Delivery Confirmation:** Mark tasks delivered from the field to keep the entire network updated.

### 🛡️ 4. For Disaster Operators & Admins
- **Campaign Management:** Declare active disaster events with custom severity levels and emergency zones.
- **NGO Accreditation:** Verify relief organizations to maintain platform trust and data integrity.
- **Real-Time Analytics:** Monitor emergency metrics, request distribution, and active volunteers.

---

## 🔥 Key Features At A Glance

- ⚡ **Real-Time Supabase & WebSocket Sync:** Instant status updates across all connected devices.
- 📍 **GPS Geotagging & Mapping:** Pinpoint exact rescue locations and nearby relief shelters.
- 📦 **Transparent Inventory Control:** Real-time warehouse supply tracking to ensure supplies reach where they're needed most.
- 🛡️ **Role-Based Access Control (RBAC):** Secure, dedicated dashboards for Citizens, NGOs, Volunteers, and Admins.

---

## ⚙️ Technology Stack

### Frontend (Client)
- **Framework:** [React 19](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Routing:** React Router v7
- **Styling:** Custom CSS Design Tokens & Lucide React Iconography
- **Data & API:** Axios, Supabase Client

### Backend (Server)
- **Environment:** [Node.js](https://nodejs.org/) (v20+)
- **Framework:** [Express.js](https://expressjs.com/)
- **Database:** [MongoDB](https://www.mongodb.com/) (Mongoose ODM)
- **Auth & Real-time:** [Supabase](https://supabase.com/), WebSockets (`ws`)

---

## 🚀 Getting Started

### 1. Clone the repository
```sh
git clone https://github.com/Adhilpalangad/Disaster-Resource-Coordination-Platform.git
cd Disaster-Resource-Coordination-Platform
```

### 2. Install Client Dependencies
```sh
cd client
npm install
```

### 3. Install Server Dependencies
```sh
cd ../server
npm install
```

### 4. Run Development Servers
```sh
# Start Backend (from /server)
npm run dev

# Start Frontend (from /client)
npm run dev
```

---

## 🎓 Developed by Team Sync6

This platform was designed, engineered, and developed by **Team Sync6**—a group of dedicated student developers committed to building modern, open-source technology for social good and emergency relief operations.

---

© 2026 Disaster Resource Coordination Platform. Built with ❤️ by **Team Sync6**.
