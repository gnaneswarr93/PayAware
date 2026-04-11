# 📱 **BUILD ANDROID APK - COMPLETE GUIDE**

## 🎯 **What You'll Get**

- ✅ **SMS auto-detection works!**
- ✅ Full native Android app
- ✅ Install on any Android phone
- ✅ All features at 100% capacity
- ✅ Can publish to Google Play Store

**Estimated Time:** 1-2 hours (first time only)

---

## 📋 **PREREQUISITES - INSTALL FIRST**

### **Step 1: Install Java JDK 17**

#### **Option A: Direct Download (Recommended)**
1. Go to: https://adoptium.net/temurin/releases/
2. Select:
   - **Version:** 17 (LTS)
   - **Operating System:** Windows
   - **Architecture:** x64
3. Download the `.msi` installer
4. Run installer with **default settings**
5. ✅ JDK installed!

#### **Option B: Using Chocolatey**
```powershell
# Run PowerShell as Administrator
choco install openjdk17
```

#### **Verify Installation:**
```bash
java -version
# Should show: openjdk version "17.x.x"
```

---

### **Step 2: Install Android Studio**

1. **Download:**
   - Go to: https://developer.android.com/studio
   - Click "Download Android Studio"
   - Accept terms, download (1GB)

2. **Install:**
   - Run installer
   - Choose "Standard" installation
   - Accept all default settings
   - Wait 10-15 minutes for download

3. **First Launch Setup:**
   - Open Android Studio
   - Click "More Actions" → "SDK Manager"
   - In "SDK Platforms" tab:
     - ✅ Check "Android 14.0 (UpsideDownCake)" or latest
     - ✅ Check "Android 13.0 (Tiramisu)"
   - In "SDK Tools" tab:
     - ✅ Check "Android SDK Build-Tools"
     - ✅ Check "Android SDK Command-line Tools"
     - ✅ Check "Android SDK Platform-Tools"
   - Click "Apply" → Download (2-3 GB)
   - Wait 15-20 minutes

4. **Note SDK Path:**
   Usually: `C:\Users\user\AppData\Local\Android\Sdk`

---

### **Step 3: Set Environment Variables**

#### **Windows:**

1. Press `Win + R`, type `sysdm.cpl`, press Enter
2. Click "Advanced" tab → "Environment Variables"
3. Under "System variables" click "New":

**Add ANDROID_HOME:**
```
Variable name: ANDROID_HOME
Variable value: C:\Users\user\AppData\Local\Android\Sdk
```

**Add JAVA_HOME:**
```
Variable name: JAVA_HOME
Variable value: C:\Program Files\Eclipse Adoptium\jdk-17.0.x.x
```
(Replace x.x with your version, check in Program Files)

4. Edit "Path" variable, add:
```
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
%JAVA_HOME%\bin
```

5. Click OK on all windows

6. **Restart PowerShell/Command Prompt**

7. **Verify:**
```bash
echo $env:ANDROID_HOME
# Should show: C:\Users\user\AppData\Local\Android\Sdk

echo $env:JAVA_HOME
# Should show your JDK path

adb version
# Should show Android Debug Bridge version
```

---

## 🏗️ **BUILD THE APK**

### **Step 4: Build Web App**

```bash
cd c:\Users\user\Downloads\Payaware\project

# Build production version
npm run build

# Verify dist/ folder created
dir dist
# Should see: index.html, assets/, etc.
```

**Expected output:**
```
✓ 127 modules transformed.
dist/index.html                  2.14 kB
dist/assets/index-abc123.css     45.2 kB
dist/assets/index-def456.js     534.2 kB
✓ built in 12.54s
```

---

### **Step 5: Sync to Android**

```bash
# Still in project/ directory

# Copy web app to Android folder
npx cap sync android

# If sync fails, try:
npx cap copy android
npx cap update android
```

**Expected output:**
```
✔ Copying web assets from dist to android/app/src/main/assets/public
✔ Creating capacitor.config.json in android/app/src/main/assets
✔ copy android in 2.51s
✔ Updating Android plugins
✔ update android in 1.23s
```

---

### **Step 6: Add SMS Permissions**

#### **Edit Android Manifest:**

Open: `c:\Users\user\Downloads\Payaware\project\android\app\src\main\AndroidManifest.xml`

Add these permissions **BEFORE** the `<application>` tag:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <!-- ADD THESE PERMISSIONS -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.RECEIVE_SMS" />
    <uses-permission android:name="android.permission.READ_SMS" />
    <uses-permission android:name="android.permission.SEND_SMS" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    
    <application>
        <!-- existing app config -->
    </application>
</manifest>
```

---

### **Step 7: Install SMS Plugin** (Optional but recommended)

```bash
cd c:\Users\user\Downloads\Payaware\project

# Install SMS reading plugin
npm install @capacitor-community/sms

# Sync again
npx cap sync android
```

---

### **Step 8: Open in Android Studio**

```bash
# From project directory
npx cap open android
```

**This will:**
- Launch Android Studio
- Open your Android project
- Start Gradle sync (wait 5-10 minutes first time)

---

### **Step 9: Wait for Gradle Sync**

**In Android Studio:**
- Bottom status bar shows "Gradle sync"
- **WAIT** until it says "Gradle sync finished"
- First time: 10-15 minutes (downloads dependencies)
- Subsequent times: 1-2 minutes

**If you see errors:**
- Click "File" → "Invalidate Caches" → "Invalidate and Restart"
- Wait for sync again

---

### **Step 10: Build APK**

**In Android Studio:**

1. **Menu:** Build → Build Bundle(s) / APK(s) → **Build APK(s)**

2. **Wait 30-60 minutes** (first time)
   - Gradle downloads dependencies
   - Compiles Java code
   - Packages resources
   - Progress bar at bottom

3. **Success Message:**
   ```
   BUILD SUCCESSFUL in 45m 23s
   APK(s) generated successfully
   locate or analyze the APK
   ```

4. **Find APK:**
   - Click "locate" in success message
   -OR-
   - File location: `android\app\build\outputs\apk\debug\app-debug.apk`

---

### **Step 11: Full Path to APK**

```
c:\Users\user\Downloads\Payaware\project\android\app\build\outputs\apk\debug\app-debug.apk
```

**APK Size:** ~50-70 MB

---

## 📲 **INSTALL ON YOUR PHONE**

### **Method 1: Via USB (Recommended)**

1. **Enable Developer Options on Phone:**
   - Settings → About Phone
   - Tap "Build Number" **7 times**
   - Enter PIN if asked
   - "You are now a developer!" appears

2. **Enable USB Debugging:**
   - Settings → System → Developer Options
   - Enable "USB Debugging"

3. **Connect Phone to Computer:**
   - Use USB cable
   - Allow USB debugging when prompted on phone

4. **Verify Connection:**
   ```bash
   adb devices
   # Should show your device: ABC123XYZ   device
   ```

5. **Install via Android Studio:**
   - In Android Studio: Run → **Run 'app'**
   - Wait 2-3 minutes
   - App installs and launches on phone!

---

### **Method 2: Via APK File**

1. **Copy APK to Phone:**
   - Connect phone via USB
   - Copy `app-debug.apk` to phone's Downloads folder
   - OR use Google Drive, email, etc.

2. **Install on Phone:**
   - Open "Files" app on phone
   - Go to Downloads
   - Tap `app-debug.apk`
   - Allow "Install from Unknown Sources" if asked
   - Tap "Install"
   - Tap "Open"

---

## ✅ **VERIFY INSTALLATION**

### **On Your Phone:**

1. **Open the app**
2. **Grant Permissions:**
   - Allow SMS permissions
   - Allow Notifications
   - Allow Internet access

3. **Test Features:**
   - ✅ Login/Signup works
   - ✅ Dashboard loads
   - ✅ Dark mode works
   - ✅ Add transaction works
   - ✅ **SMS detection works!**
   - ✅ Voice logging works
   - ✅ Offline mode works

---

## 📝 **TESTING SMS DETECTION**

### **Test the SMS Feature:**

1. **Simulate a bank SMS:**
   - Send yourself an SMS like:
   ```
   Your account has been debited by Rs.500 at STARBUCKS on 14-Feb-2026
   ```

2. **App Should:**
   - Detect the SMS
   - Show notification popup
   - Auto-fill Amount: 500
   - Auto-fill Merchant: Starbucks
   - Ask you to confirm

3. **Confirm or Edit:**
   - Add description/category
   - Save transaction

✅ **SMS detection working!**

---

## 🐛 **TROUBLESHOOTING**

### **Issue: "Gradle sync failed"**

**Solution:**
1. Android Studio → File → Invalidate Caches → Restart
2. Delete folders:
   - `android/.gradle`
   - `android/build`
3. Sync again

---

### **Issue: "SDK not found"**

**Solution:**
1. Check environment variables are set
2. Restart Android Studio
3. Tools → SDK Manager → Reinstall SDK

---

### **Issue: "Build failed - missing dependencies"**

**Solution:**
```bash
cd android
gradlew clean
gradlew build
```

---

### **Issue: "App crashes on phone"**

**Check:**
1. Android version (need Android 7.0+)
2. Permissions granted
3. Supabase accessible from phone network
4. Check logcat in Android Studio

---

## 🎯 **BUILD RELEASE APK (For Play Store)**

### **For Production:**

1. **Generate Signing Key:**
```bash
cd c:\Users\user\Downloads\Payaware\project\android
keytool -genkey -v -keystore payaware-release-key.jks -alias payaware -keyalg RSA -keysize 2048 -validity 10000
```

2. **Update `android/app/build.gradle`:**
```gradle
android {
    signingConfigs {
        release {
            storeFile file('../payaware-release-key.jks')
            storePassword 'your_password'
            keyAlias 'payaware'
            keyPassword 'your_password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

3. **Build Release APK:**
```bash
cd android
gradlew assembleRelease
```

4. **APK Location:**
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## 📊 **CHECKLIST**

### **Prerequisites:**
- [ ] Java JDK 17 installed
- [ ] Android Studio installed
- [ ] Android SDK downloaded
- [ ] Environment variables set
- [ ] `adb` command works

### **Build Steps:**
- [ ] `npm run build` successful
- [ ] `npx cap sync android` works
- [ ] SMS permissions added to manifest
- [ ] Android Studio opens project
- [ ] Gradle sync completes
- [ ] APK builds successfully

### **Installation:**
- [ ] APK file found
- [ ] USB debugging enabled OR
- [ ] APK transferred to phone
- [ ] App installed on phone
- [ ] Permissions granted

### **Testing:**
- [ ] App opens without crash
- [ ] Login works
- [ ] Dashboard loads
- [ ] SMS detection works
- [ ] All features functional

---

## ⏱️ **TIME ESTIMATES**

**First Time:**
- Install prerequisites: 30-45 min
- Build web app: 1-2 min
- Gradle sync: 10-15 min
- Build APK: 30-60 min
- Install on phone: 2-5 min
**Total: 1.5 - 2 hours**

**Subsequent Builds:**
- Build web app: 1-2 min
- Sync: 30 sec
- Build APK: 2-5 min
**Total: 5-10 minutes**

---

## 🎉 **SUCCESS!**

You'll have:
- ✅ Native Android app
- ✅ SMS auto-detection working
- ✅ Installable APK file
- ✅ Can share with anyone
- ✅ Can publish to Play Store

**Next Steps:**
- Test thoroughly
- Gather feedback
- Prepare for Play Store (optional)

---

**Ready to start? Let's go step by step!** 🚀
