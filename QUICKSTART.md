# 🚀 QUICK START GUIDE - Parallax Portfolio Full-Stack

## Prerequisites
- Node.js installed (v14 or higher)
- MongoDB (local or Atlas account)
- Gmail account (for email notifications)

---

## 📋 Step-by-Step Setup

### 1️⃣ Install Dependencies (Already Done ✅)
```bash
npm install
```

### 2️⃣ Set Up MongoDB

**Option A: MongoDB Atlas (Recommended - Free Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create a new cluster (free tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Update `.env` file:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/parallax-portfolio
   ```

**Option B: Local MongoDB**
1. Download: https://www.mongodb.com/try/download/community
2. Install and start MongoDB
3. Keep default in `.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/parallax-portfolio
   ```

### 3️⃣ Configure Email (Gmail)

1. **Enable 2-Factor Authentication**
   - Go to https://myaccount.google.com
   - Security → 2-Step Verification → Turn on

2. **Generate App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Select app: "Mail"
   - Select device: "Other" (name it "Portfolio")
   - Click "Generate"
   - Copy the 16-character password

3. **Update `.env` file**
   ```env
   EMAIL_USER=youremail@gmail.com
   EMAIL_PASSWORD=abcd efgh ijkl mnop  # ← The 16-char app password
   EMAIL_FROM=youremail@gmail.com
   ADMIN_EMAIL=youremail@gmail.com     # ← Where you receive notifications
   ```

### 4️⃣ Start the Server
```bash
npm start
```

You should see:
```
✅ Connected to MongoDB
🚀 Server running on http://localhost:3000
```

### 5️⃣ Test the Application
1. Open browser: http://localhost:3000
2. Scroll to footer or click "CONTACT US"
3. Click "CONTACT & QUERY" button
4. Fill out the audit form
5. Submit and check:
   - Browser shows success message
   - You receive confirmation email
   - Admin receives notification email

---

## 🎯 What's Working Now

✅ **Backend Server** - Express.js running on port 3000
✅ **Database** - MongoDB storing form submissions
✅ **API Endpoints** - POST/GET for audit requests
✅ **Email Notifications** - Automatic emails on form submit
✅ **Form Validation** - Frontend + backend validation
✅ **Error Handling** - Proper error messages

---

## 📁 Project Structure

```
Parallax-Portfolio/
├── server.js              # Main Express server
├── models/
│   └── AuditRequest.js    # MongoDB schema
├── routes/
│   └── api.js             # API endpoints
├── services/
│   └── emailService.js    # Email logic
├── js/
│   └── api.js             # Frontend API client
├── index.html             # Main page
├── audit.html             # Contact form (updated)
├── .env                   # Your config (UPDATE THIS!)
└── package.json           # Dependencies
```

---

## 🔧 Troubleshooting

**MongoDB Connection Error:**
- Make sure MongoDB is running (if local)
- Check connection string in `.env`
- For Atlas: whitelist your IP address

**Email Not Sending:**
- Verify 2FA is enabled on Gmail
- Use App Password, not regular password
- Check EMAIL_USER and EMAIL_PASSWORD in `.env`

**Port Already in Use:**
- Change PORT in `.env` to 3001 or another number
- Or kill the process using port 3000

---

## 🎨 Development Mode (Auto-Restart)

```bash
npm run dev
```

This uses nodemon to automatically restart when you change files.

---

## 📊 View Submissions

To see all form submissions, make a GET request:
```
http://localhost:3000/api/audit
```

Or use this in your browser console:
```javascript
fetch('/api/audit').then(r => r.json()).then(console.log)
```

---

## 🚀 Next Steps

- [ ] Test form submission end-to-end
- [ ] Verify emails are received
- [ ] Check MongoDB for stored data
- [ ] Deploy to production (Vercel, Heroku, etc.)

---

## 📞 Need Help?

Check the detailed walkthrough in the artifacts or README.md for more information.
