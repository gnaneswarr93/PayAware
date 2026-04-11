# 🎨 **RENDER.COM DEPLOYMENT - 100% FREE FOREVER**

## ✅ **WHY RENDER?**

- ✅ **FREE forever** (not a trial!)
- ✅ No credit card required
- ✅ 750 hours/month (enough for always-on)
- ✅ 512MB RAM
- ✅ 100GB bandwidth/month
- ⚠️ Apps sleep after 15 min inactivity (wakes in 30 sec)

**Perfect for your backend!**

---

## 🚀 **STEP-BY-STEP DEPLOYMENT**

### **Step 1: Sign Up for Render**

1. Go to: **https://render.com**
2. Click **"Get Started for Free"**
3. Sign up with **GitHub** (easiest!)
4. Authorize Render to access your repos

---

### **Step 2: Create Web Service**

1. Click **"New +"** → **"Web Service"**
2. Click **"Connect a repository"**
3. Find and select: **"Risheendra183/payaware"**
4. Click **"Connect"**

---

### **Step 3: Configure Service**

Fill in these settings:

**Name:**
```
payaware-backend
```

**Region:**
```
Singapore (or closest to you)
```

**Branch:**
```
main
```

**Root Directory:** ⚠️ **CRITICAL!**
```
backend
```

**Runtime:**
```
Python 3
```

**Build Command:**
```
pip install -r requirements.txt
```

**Start Command:**
```
uvicorn main:app --host 0.0.0.0 --port $PORT
```

**Instance Type:**
```
Free
```

---

### **Step 4: Advanced Settings (Optional)**

**Auto-Deploy:**
- ✅ Yes (deploys on every GitHub push)

**Health Check Path:**
```
/
```

---

### **Step 5: Deploy!**

1. Scroll down
2. Click **"Create Web Service"**
3. Wait 5-10 minutes
4. Watch the build logs

**Progress:**
```
→ Installing Python...
→ Installing dependencies...
→ Loading ML models...
✓ Live!
```

---

### **Step 6: Get Your Backend URL**

After deployment:
1. You'll see your service dashboard
2. URL at the top (looks like):
   ```
   https://payaware-backend.onrender.com
   ```
3. **Copy this URL!**

---

### **Step 7: Test Your Backend**

1. Click the URL or open in browser
2. Should see:
   ```json
   {
     "status": "online",
     "model_loaded": true
   }
   ```

3. Test the API docs:
   ```
   https://payaware-backend.onrender.com/docs
   ```

✅ **It works!**

---

### **Step 8: Update Vercel Environment Variable**

1. Go to: **https://vercel.com/dashboard**
2. Click **"payaware"** project
3. **Settings** → **Environment Variables**
4. Add or update:
   
   **Name:** `VITE_API_URL`  
   **Value:** `https://payaware-backend.onrender.com`

5. Select: ✅ Production ✅ Preview ✅ Development
6. Click **"Save"**

---

### **Step 9: Redeploy Vercel**

1. **Deployments** tab
2. Click latest deployment
3. Click **"Redeploy"**
4. Wait 2-3 minutes

---

### **Step 10: Test Auto-Categorization!**

1. Open Vercel app
2. Add transaction: "coffee at starbucks"
3. **Automatically categorizes** to "Dining Out"!
4. ✅ **IT WORKS!** 🎉

---

## ⚠️ **IMPORTANT: Free Tier Sleep**

### **What Happens:**
- After **15 minutes** of no requests
- Your backend **goes to sleep**
- First request after sleep: **~30-60 seconds**
- Subsequent requests: **Fast** (normal speed)

### **User Experience:**
- Most of the time: ✅ Fast
- After inactivity: ⏳ First request slow
- Then fast again

### **Solutions:**

#### **Option A: Accept the Sleep** (Recommended)
- Most users won't notice
- Only affects first use after 15min break
- **Still better than nothing!**

#### **Option B: Keep-Alive Service** (Free!)
Use a free cron job to ping your backend every 14 minutes:

**Services:**
- https://uptimerobot.com (Free)
- https://cron-job.org (Free)

**Setup:**
1. Create account
2. Add monitor: `https://payaware-backend.onrender.com/`
3. Check every **14 minutes**
4. ✅ Your backend never sleeps!

#### **Option C: Upgrade to Paid** ($7/month)
- No sleep
- Always fast
- More resources

---

## 🆓 **FREE TIER LIMITS**

**Render Free:**
- ✅ 750 hours/month (enough for 24/7)
- ✅ 512MB RAM
- ✅ 100GB bandwidth/month
- ✅ Free SSL (HTTPS)
- ⚠️ Sleeps after 15 min

**Should be enough for:**
- 100-1000 users
- Moderate usage
- Your current needs

---

## 🐛 **TROUBLESHOOTING**

### **Issue: Build fails**

**Check logs:**
1. Click on deployment
2. View build logs
3. Look for errors

**Common fixes:**
- Make sure Root Directory = `backend`
- Check requirements.txt exists
- Verify Python 3.11+ compatible

---

### **Issue: "Model not loaded"**

**Check:**
1. Logs should show: "✅ Model and vectorizer loaded successfully!"
2. If not, verify model files are in GitHub:
   - `backend/expense_model.pkl`
   - `backend/tfidf_vectorizer.pkl`

---

### **Issue: App times out**

**Render free tier has 90s timeout.**

**If models take too long to load:**
1. They should load on startup, not on request
2. Already handled in main.py ✅

---

## 📊 **COMPARISON**

| Feature | Railway | Render (Free) | Fly.io |
|---------|---------|---------------|---------|
| **Cost** | 30-day trial | FREE forever | FREE forever |
| **Credit Card** | Not required | Not required | Required |
| **Sleep** | No | Yes (15 min) | No |
| **RAM** | 512MB | 512MB | 256MB |
| **Setup** | Easy | Easy | Medium |
| **Always On** | ✅ | ❌ | ✅ |

**Recommendation:** **Render** for no credit card, **Fly.io** if you can verify with card.

---

## 🎯 **ALTERNATIVE: FLY.IO**

If you have a credit card for verification:

```bash
# Install Fly CLI
irm https://fly.io/install.ps1 | iex

# Login
fly auth login

# Deploy
cd c:\Users\user\Downloads\Payaware\backend
fly launch
fly deploy
```

**Benefits:**
- No sleep
- Always fast
- Still free!

---

## ✅ **DEPLOYMENT CHECKLIST**

**Before:**
- [x] Backend prepared ✅
- [x] Requirements.txt exists ✅
- [x] Model files in backend ✅
- [x] Pushed to GitHub ✅

**During:**
- [ ] Render account created
- [ ] Web Service configured
- [ ] Root Directory set to `backend`
- [ ] Deployment started

**After:**
- [ ] Backend URL obtained
- [ ] Tested `/` endpoint
- [ ] Updated Vercel env variable
- [ ] Tested auto-categorization

---

## 🚀 **START NOW!**

**Go to: https://render.com**

1. Click **"Get Started for Free"**
2. Sign up with GitHub
3. Follow steps above!

---

## 💡 **KEEP-ALIVE SETUP** (Optional)

To prevent sleep:

### **UptimeRobot (FREE):**

1. Go to: https://uptimerobot.com
2. Sign up (free)
3. Add New Monitor:
   - **Type:** HTTP(s)
   - **URL:** `https://payaware-backend.onrender.com/`
   - **Interval:** 15 minutes
4. Save
5. ✅ Backend stays awake!

---

**Render is 100% free forever!** No trials, no tricks. The only "cost" is the 15-minute sleep, which you can solve with free keep-alive services.

**Ready to deploy?** 🎨🚀
