# Marvel Watch Tracker — Standalone Native Android Application

A modern, native Android app for tracking Marvel Cinematic Universe (MCU) watch order, built using the state-of-the-art Android stack and synced to your **Firebase (`marval-5f1cf`)** cloud database in real time.

---

## 🛠️ State-of-the-Art Android Stack:
- **Language**: Kotlin 2.0
- **UI Framework**: Jetpack Compose + Material 3 Dark Cinematic Theme
- **Architecture**: MVVM + StateFlow + Coroutines
- **Image Loading**: Coil Compose
- **Backend / Real-time Sync**: Firebase Firestore KTX & Firebase Auth KTX
- **Database Schema**: Document `marvel_tracker/watchProgress` & User document `users/{userId}/watchProgress/watchProgress` (100% compatible with the Desktop / Web App save format).

---

## 📱 How to Push to Your Android Phone via Wireless Debugging

### Step 1: Enable Wireless Debugging on Your Android Phone
1. Go to **Settings -> About Phone** $\rightarrow$ Tap **Build Number** 7 times to unlock **Developer Options**.
2. Go to **Settings -> System -> Developer Options**.
3. Enable **Wireless Debugging** (Ensure your phone and PC are connected to the same Wi-Fi network).
4. Tap **Wireless Debugging** $\rightarrow$ Select **Pair device with pairing code**. Note the **IP address**, **Port**, and **Pairing Code**.

### Step 2: Connect & Install via ADB / PowerShell
Open PowerShell inside `android-app/` and run:

```powershell
# 1. Pair your phone (first time only)
adb pair 192.168.1.50:37123 123456

# 2. Connect via ADB
adb connect 192.168.1.50:5555

# 3. Build & Push APK directly to your phone
.\deploy_wireless_adb.ps1 -IpAddress "192.168.1.50" -Port "5555"
```

Or open the `android-app` folder in **Android Studio** and click **Run** $\rightarrow$ select your wireless Android phone!

---

## 🔄 Real-time Save File Compatibility:
- Any movie/series you mark as watched in your Android app instantly updates your Desktop / Web app.
- Uses identical item IDs (`mcu-01`, `mcu-02`, etc.) and ISO timestamp formatting.
