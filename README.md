# 💰 **Payaware** - Intelligent Expense Tracker

> AI-powered expense tracking with SMS auto-detection, voice logging, and predictive analytics

[![Made with React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.9+-green.svg)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-Private-red.svg)]()

---

## ✨ **Features**

### 🎤 **Voice Logging**
- Speak your expenses: *"500 rupees for coffee"*
- Automatically extracts amount and description
- Instant transaction creation

### 📱 **SMS Auto-Detection**
- Monitors SMS for bank transaction notifications
- Automatically detects amount, merchant, date
- Smart popup for confirmation with AI categorization

### 🧠 **AI Categorization**
- Machine learning model categorizes expenses
- 17+ expense categories (Food, Travel, Shopping, etc.)
- 90%+ accuracy with continuous learning

### 📊 **Advanced Analytics**
- ARIMA forecasting for future expenses
- Visual charts and spending insights
- Budget tracking with smart alerts
- Monthly/weekly expense trends

### 🔍 **Smart Search & Filtering**
- Real-time search across transactions
- Filter by date range, amount, category
- Payment mode filtering (Cash/Online)
- Export to CSV

### 🌙 **Dark Mode**
- Beautiful dark theme
- Auto/Light/Dark theme options
- Smooth transitions

### 📴 **Offline Support**
- Works without internet connection
- Automatic data sync when online
- Transaction queue for offline entries

---

## 🏗️ **Tech Stack**

### **Frontend**
- ⚛️ **React 18.3** with TypeScript
- 🎨 **Tailwind CSS** for styling
- 📱 **Capacitor** for mobile (Android/iOS)
- 🔄 **React Router** for navigation
- 📈 **Recharts** for data visualization

### **Backend**
- 🐍 **FastAPI** (Python) for ML predictions
- 🗄️ **Supabase** (PostgreSQL) for database
- 🔐 **Supabase Auth** for authentication
- 🤖 **scikit-learn** for ML models

### **Machine Learning**
- **ARIMA** forecasting model
- **TF-IDF** vectorization for text
- **Logistic Regression** for categorization
- Custom expense classification model

---

## 📦 **Project Structure**

```
Payaware/
├── project/                    # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/            # Page components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── contexts/         # React Context providers
│   │   ├── services/         # API services
│   │   └── lib/              # Utilities
│   ├── android/              # Android build (Capacitor)
│   └── electron/             # Desktop build (Electron)
│
├── backend/                   # Backend (FastAPI)
│   ├── main.py               # FastAPI server
│   ├── expense_model.pkl     # Trained ML model
│   └── tfidf_vectorizer.pkl  # TF-IDF vectorizer
│
└── new_project/              # ML Training Scripts
    └── train_deep.py         # Model training
```

---

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ and npm
- Python 3.9+
- Supabase account
- Git

### **1. Clone the Repository**
```bash
git clone <your-private-repo-url>
cd Payaware
```

### **2. Frontend Setup**
```bash
cd project
npm install
```

Create `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Run development server:
```bash
npm run dev
```

### **3. Backend Setup**
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux

pip install -r requirements.txt
```

Run backend server:
```bash
uvicorn main:app --reload --port 8000
```

### **4. Database Setup (Supabase)**

Run the SQL schema:
```sql
-- See SUPABASE_SCHEMA.sql for complete schema
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  amount DECIMAL NOT NULL,
  type TEXT NOT NULL,
  category TEXT,
  description TEXT,
  date TIMESTAMPTZ DEFAULT NOW(),
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own transactions
CREATE POLICY "Users can only see their own transactions"
  ON transactions FOR ALL
  USING (user_id = auth.uid());
```

---

## 📱 **Build for Production**

### **Web Build**
```bash
cd project
npm run build
```

### **Android Build**
```bash
cd project
npx cap sync android
npx cap open android
# Build APK in Android Studio
```

### **Desktop Build (Electron)**
```bash
cd project
npm run electron
```

---

## 🎯 **Key Features Implementation**

### **Phase 1 (Complete) ✅**
- ✅ Error handling & offline support
- ✅ Dark mode with theme toggle
- ✅ Advanced search & filtering
- ✅ Onboarding flow
- ✅ Network status monitoring

### **Phase 2 (Planned) 🚧**
- 🔄 Recurring transactions tracker
- 🔄 Smart insights & recommendations
- 🔄 Receipt scanning (OCR)
- 🔄 Savings goals
- 🔄 Bill reminders

---

## 🔐 **Security**

- ✅ Environment variables for secrets
- ✅ Supabase Row Level Security (RLS)
- ✅ Secure authentication flow
- ✅ No sensitive data in repository
- ✅ Private repository recommended

**Important:** Never commit `.env` files!

---

## 📊 **Performance**

- **Lighthouse Score:** 95+ (Performance, Accessibility)
- **Bundle Size:** ~500KB (gzipped)
- **First Contentful Paint:** < 1.5s
- **Time to Interactive:** < 3s

---

## 🤝 **Contributing**

This is a private project. For team members:

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open a Pull Request

---

## 📝 **License**

Private & Confidential - All Rights Reserved

---

## 👨‍💻 **Author**

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

---

## 🙏 **Acknowledgments**

- React Team for React 18
- Supabase for backend infrastructure
- FastAPI for ML API
- Tailwind CSS for styling

---

## 📞 **Support**

For issues or questions:
- Open an issue in this repository
- Email: support@yourapp.com

---

**Built with ❤️ using React, TypeScript, and AI**
