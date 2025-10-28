# Welcome to your Expo app 👋

# 📦 StockTally

**StockTally** is a cross-platform inventory and sales management app built with **React Native + Expo Router**, integrated with **Appwrite** (authentication & cloud storage) and **RevenueCat** (subscriptions).  
It runs seamlessly on iOS, Android, and Web.

---

## 🚀 Features
- 🔐 User authentication (Appwrite)
- 📦 Stock & sales management
- 💰 Income dashboard with charts
- 🧾 PDF invoice and report export
- 🧩 Pro subscription with free trial (RevenueCat)
- ☁️ Per-user cloud data separation

---

## 🛠️ Tech Stack
| Layer | Technology |
|-------|-------------|
| Frontend | React Native, Expo Router, TypeScript |
| Backend | Appwrite Cloud |
| Payments | RevenueCat SDK |
| Charts | react-native-chart-kit |
| Storage | AsyncStorage (guest) + Appwrite (user) |
| Build | EAS Build & Submit (TestFlight / Play Store) |

---

## 🧑‍💻 Setup Guide

1. **Clone the repo**
   ```bash
   git clone https://github.com/<your-username>/stocktally.git
   cd stocktally

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.


🧱 Version Control
Follow the Conventional Commits style:
feat: – new feature
fix: – bug fix
chore: – minor/non-code change

Example:
git add .
git commit -m "feat(invoice): auto-generate invoice numbers"
git push
Tag releases:
npm version minor -m "chore(release): %s"
git push && git push --tags

📱 Build for Release
iOS
eas build -p ios --profile production
eas submit -p ios
Android
eas build -p android --profile production
eas submit -p android

🏁 Roadmap
 Dark mode
 Category-wise analytics
 Cloud backups
 Multi-device sync

🧑‍🤝‍🧑 Author
Asif Siddiqui
💼 [LinkedIn](https://www.linkedin.com/in/asif-siddiqui-ds/)
📧 asifsiddiqui@dataexpert.co.site
📝 License


---



## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
