# Vercel Deployment Guide

## 🚀 Deploy Your Full-Stack Portfolio to Vercel

### Prerequisites
- Vercel account (free): https://vercel.com/signup
- Git installed
- GitHub account (optional but recommended)

---

## Step 1: Prepare for Deployment

### Files Created for Vercel:
- ✅ `vercel.json` - Vercel configuration
- ✅ `api/audit.js` - Serverless API function
- ✅ `lib/db.js` - Database connection utility

---

## Step 2: Initialize Git Repository

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Full-stack portfolio"
```

---

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - What's your project's name? **parallax-portfolio**
   - In which directory is your code located? **./**
   - Want to override settings? **N**

4. **Set Environment Variables**
   ```bash
   vercel env add MONGODB_URI
   # Paste: mongodb+srv://rajputbhargav001_db_user:Bhargav0110%40@parallaxstudios.qbgz5ed.mongodb.net/parallax-portfolio?retryWrites=true&w=majority&appName=PARALLAXSTUDIOS
   
   vercel env add EMAIL_HOST
   # Enter: smtp.gmail.com
   
   vercel env add EMAIL_PORT
   # Enter: 587
   
   vercel env add EMAIL_USER
   # Enter: rajputbhargav001@gmail.com
   
   vercel env add EMAIL_PASSWORD
   # Enter: msqblqpjbtqicwis
   
   vercel env add EMAIL_FROM
   # Enter: rajputbhargav001@gmail.com
   
   vercel env add ADMIN_EMAIL
   # Enter: parallaxstudio.work@gmail.com
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

### Option B: Deploy via Vercel Dashboard

1. **Push to GitHub**
   - Create a new repository on GitHub
   - Push your code:
     ```bash
     git remote add origin https://github.com/yourusername/parallax-portfolio.git
     git branch -M main
     git push -u origin main
     ```

2. **Import to Vercel**
   - Go to https://vercel.com/new
   - Click "Import Git Repository"
   - Select your repository
   - Click "Import"

3. **Configure Environment Variables**
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add each variable:
     - `MONGODB_URI`
     - `EMAIL_HOST`
     - `EMAIL_PORT`
     - `EMAIL_USER`
     - `EMAIL_PASSWORD`
     - `EMAIL_FROM`
     - `ADMIN_EMAIL`

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete

---

## Step 4: Test Your Deployment

1. Visit your Vercel URL (e.g., `https://parallax-portfolio.vercel.app`)
2. Test the contact form
3. Check emails are being sent
4. Verify data is saved in MongoDB

---

## 🎯 What's Different in Production?

**Local Development:**
- Express server on `localhost:3000`
- All routes handled by `server.js`

**Vercel Production:**
- Serverless functions in `/api` folder
- Static files served by Vercel CDN
- Automatic HTTPS
- Global edge network

---

## 🔧 Troubleshooting

**Environment Variables Not Working:**
- Make sure all variables are set in Vercel dashboard
- Redeploy after adding variables

**API Not Working:**
- Check Vercel function logs
- Verify MongoDB connection string
- Check CORS settings

**Email Not Sending:**
- Verify Gmail app password is correct
- Check email service logs in Vercel

---

## 📊 Monitor Your Deployment

- **Vercel Dashboard**: View deployments, logs, analytics
- **MongoDB Atlas**: Monitor database usage
- **Gmail**: Check sent emails

---

## 🎨 Custom Domain (Optional)

1. Go to Vercel project settings
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed

---

Your portfolio will be live at: `https://parallax-portfolio.vercel.app` 🚀
