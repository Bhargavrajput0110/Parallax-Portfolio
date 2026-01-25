# MongoDB Setup Guide for Windows

## You Have: MongoDB Compass (GUI) ✅
## You Need: MongoDB Server (Database Engine)

---

## Option 1: Install MongoDB Server Locally (Recommended)

### Step 1: Download MongoDB Community Server
1. Go to: https://www.mongodb.com/try/download/community
2. Select:
   - Version: Latest (7.0 or higher)
   - Platform: Windows
   - Package: MSI
3. Click "Download"

### Step 2: Install MongoDB
1. Run the downloaded `.msi` file
2. Choose "Complete" installation
3. **IMPORTANT**: Check "Install MongoDB as a Service"
4. **IMPORTANT**: Check "Install MongoDB Compass" (you already have it, but it's fine)
5. Complete the installation

### Step 3: Verify Installation
Open a NEW terminal (PowerShell or CMD) and run:
```bash
mongod --version
```

You should see version information.

### Step 4: Start MongoDB Service
MongoDB should auto-start as a Windows service. To verify:

**Option A: Check if service is running**
```bash
# In PowerShell (as Administrator)
Get-Service MongoDB
```

**Option B: Start manually if needed**
```bash
# In PowerShell (as Administrator)
net start MongoDB
```

### Step 5: Connect with Compass
1. Open MongoDB Compass
2. Connection string: `mongodb://localhost:27017`
3. Click "Connect"
4. You should see your local MongoDB instance!

### Step 6: Your `.env` is Already Configured!
Your `.env` file already has:
```
MONGODB_URI=mongodb://localhost:27017/parallax-portfolio
```
This will work once MongoDB is running!

---

## Option 2: Use MongoDB Atlas (Cloud - Easier, No Installation)

If you don't want to install MongoDB locally:

### Step 1: Sign Up
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Create a free account

### Step 2: Create Cluster
1. Choose "Free" tier (M0)
2. Select a cloud provider (AWS/Google/Azure)
3. Choose a region close to you
4. Click "Create Cluster" (takes 3-5 minutes)

### Step 3: Create Database User
1. Security → Database Access
2. Click "Add New Database User"
3. Username: `portfoliouser`
4. Password: Generate or create your own (SAVE THIS!)
5. Database User Privileges: "Read and write to any database"
6. Click "Add User"

### Step 4: Whitelist Your IP
1. Security → Network Access
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. Click "Confirm"

### Step 5: Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. It looks like: `mongodb+srv://portfoliouser:<password>@cluster0.xxxxx.mongodb.net/`

### Step 6: Update `.env`
Replace the MONGODB_URI in your `.env` file:
```env
MONGODB_URI=mongodb+srv://portfoliouser:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/parallax-portfolio
```
(Replace `YOUR_PASSWORD` with the actual password you created)

### Step 7: Connect Compass (Optional)
You can also connect MongoDB Compass to Atlas:
1. Open Compass
2. Paste the same connection string
3. Click "Connect"

---

## Which Option Should You Choose?

**Local MongoDB (Option 1):**
- ✅ Faster (no internet needed)
- ✅ Free forever
- ✅ Good for development
- ❌ Requires installation
- ❌ Only accessible from your computer

**MongoDB Atlas (Option 2):**
- ✅ No installation needed
- ✅ Accessible from anywhere
- ✅ Better for production
- ✅ Automatic backups
- ❌ Requires internet
- ❌ Free tier has limits (512MB storage)

---

## Next Steps After MongoDB is Ready

1. **Update `.env`** with your MongoDB connection (if using Atlas)
2. **Configure Gmail** in `.env` (see QUICKSTART.md)
3. **Run your server**:
   ```bash
   npm start
   ```
4. **Test**: Visit http://localhost:3000

---

## Troubleshooting

**"mongod is not recognized"**
- MongoDB Server isn't installed or not in PATH
- Restart your terminal after installation
- Or use MongoDB Atlas instead

**"Connection refused"**
- MongoDB service isn't running
- Check Windows Services for "MongoDB"
- Or use `net start MongoDB` as Administrator

**"Authentication failed" (Atlas)**
- Check username/password in connection string
- Make sure IP is whitelisted
- Password might have special characters (URL encode them)

---

Need help? Check QUICKSTART.md for more details!
