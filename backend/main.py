
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import joblib
import os
import numpy as np

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TransactionRequest(BaseModel):
    description: str

# Load model
# Paths: Try multiple locations for local vs Railway deployment
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Try different possible paths
possible_paths = [
    # Local development (current structure)
    (os.path.join(BASE_DIR, '../project/new_project/expense_model.pkl'),
     os.path.join(BASE_DIR, '../project/new_project/tfidf_vectorizer.pkl')),
    # Railway deployment (if models are in backend folder)
    (os.path.join(BASE_DIR, 'expense_model.pkl'),
     os.path.join(BASE_DIR, 'tfidf_vectorizer.pkl')),
    # Railway deployment (models in root)
    (os.path.join(BASE_DIR, '../expense_model.pkl'),
     os.path.join(BASE_DIR, '../tfidf_vectorizer.pkl')),
]

model = None
vectorizer = None
is_pipeline = False

for MODEL_PATH, VECTORIZER_PATH in possible_paths:
    if os.path.exists(MODEL_PATH):
        try:
            loaded_obj = joblib.load(MODEL_PATH)
            
            # CHECK 1: Is it a Pipeline? (Embedded Vectorizer)
            if hasattr(loaded_obj, 'predict') and hasattr(loaded_obj, 'steps'):
                model = loaded_obj
                is_pipeline = True
                print(f"✅ Pipeline Model loaded from {MODEL_PATH}")
                # Pipeline doesn't need external vectorizer, but we check if it exists just in case
                break
                
            # CHECK 2: Is it a legacy model requiring a separate Vectorizer?
            elif os.path.exists(VECTORIZER_PATH):
                model = loaded_obj
                vectorizer = joblib.load(VECTORIZER_PATH)
                is_pipeline = False
                print(f"✅ LinearSVC Model & Vectorizer loaded from {MODEL_PATH}")
                break
            else:
                print(f"Found non-pipeline model at {MODEL_PATH} but missing vectorizer at {VECTORIZER_PATH}")
                continue

        except Exception as e:
            print(f"Failed to load from {MODEL_PATH}: {e}")
            continue

if model is None:
    print("⚠️ WARNING: Model files not found. Prediction endpoint will not work.")
    print(f"Searched in: {[p[0] for p in possible_paths]}")

@app.get("/")
def read_root():
    return {"status": "online", "model_loaded": model is not None, "type": "Pipeline" if is_pipeline else "LinearSVC"}

@app.post("/predict")
async def predict_category(request: TransactionRequest):
    if not model:
        raise HTTPException(status_code=503, detail="Model not loaded on server. Check logs.")
    
    try:
        # Enhanced Rule-Based Overrides
        desc_lower = request.description.lower()
        import re
        
        # Helper to check whole word
        def has_word(text, word):
            return re.search(r'\b' + re.escape(word) + r'\b', text)

        final_category = None
        
        # Keyword Mappings (Priority over AI)
        # Priority-Based Rules (First Match Wins)
        # Format: (Keyword, Category)
        # Placed specifics (e.g. "pet food", "dog") BEFORE generals (e.g. "food")
        # Priority-Based Rules (First Match Wins)
        # Format: (Keyword, Category)
        # Placed specifics (e.g. "pet food", "dog") BEFORE generals (e.g. "food")
        PRIORITY_RULES = [
            # --- Pets (Must be before Food) ---
            ("dog food", "Expense__Pets"),
            ("cat food", "Expense__Pets"),
            ("vet", "Expense__Pets"),
            ("pets", "Expense__Pets"),
            ("pet", "Expense__Pets"),
            ("dogs", "Expense__Pets"),
            ("dog", "Expense__Pets"),
            ("cats", "Expense__Pets"),
            ("cat", "Expense__Pets"),

            # --- Medical & Healthcare (High Priority) ---
            ("pharmacy", "Expense__Healthcare__Medicine"),
            ("medplus", "Expense__Healthcare__Medicine"),
            ("apollo", "Expense__Healthcare__Medicine"),
            ("medicine", "Expense__Healthcare__Medicine"),
            ("tablet", "Expense__Healthcare__Medicine"),
            ("doctor", "Expense__Healthcare__Doctor"),
            ("hospital", "Expense__Healthcare__Doctor"),
            ("clinic", "Expense__Healthcare__Doctor"),
            ("checkup", "Expense__Healthcare__Doctor"),
            ("lab", "Expense__Healthcare__Doctor"),
            ("scan", "Expense__Healthcare__Doctor"),

            # --- Education ---
            ("pencils", "Expense__Education__Stationery"),
            ("pencil", "Expense__Education__Stationery"),
            ("pens", "Expense__Education__Stationery"),
            ("pen", "Expense__Education__Stationery"),
            ("books", "Expense__Education__Books"),
            ("book", "Expense__Education__Books"),
            ("xerox", "Expense__Education__Stationery"),
            ("print", "Expense__Education__Stationery"),
            ("courses", "Expense__Education__Tuition"),
            ("course", "Expense__Education__Tuition"),
            ("tuition", "Expense__Education__Tuition"),
            ("fee", "Expense__Education__Tuition"),
            ("college", "Expense__Education__Tuition"),
            ("school", "Expense__Education__Tuition"),

            # --- Specific Food (Before General Food) ---
            ("burgers", "Expense__Food & Dining__Fast Food"),
            ("burger", "Expense__Food & Dining__Fast Food"),
            ("pizzas", "Expense__Food & Dining__Fast Food"),
            ("pizza", "Expense__Food & Dining__Fast Food"),
            ("swiggy", "Expense__Food & Dining__Delivery"),
            ("zomato", "Expense__Food & Dining__Delivery"),
            ("blinkit", "Expense__Groceries__General"), # Often groceries/food
            ("zepto", "Expense__Groceries__General"),
            ("lunch", "Expense__Food & Dining__Restaurant"),
            ("dinner", "Expense__Food & Dining__Restaurant"),
            ("breakfast", "Expense__Food & Dining__Restaurant"),
            ("meals", "Expense__Food & Dining__Restaurant"),
            ("meal", "Expense__Food & Dining__Restaurant"),
            ("snacks", "Expense__Food & Dining__Treats"),
            ("snack", "Expense__Food & Dining__Treats"),
            ("coffee", "Expense__Food & Dining__Cafe"),
            ("tea", "Expense__Food & Dining__Cafe"),
            ("chocolates", "Expense__Food & Dining__Treats"),
            ("chocolate", "Expense__Food & Dining__Treats"),
            ("cake", "Expense__Food & Dining__Treats"),
            ("ice cream", "Expense__Food & Dining__Treats"),
            
            # --- Personal Care ---
            ("salon", "Expense__Personal Care"),
            ("haircut", "Expense__Personal Care"),
            ("barber", "Expense__Personal Care"),
            ("spa", "Expense__Personal Care"),
            ("facial", "Expense__Personal Care"),
            ("makeup", "Expense__Personal Care"),
            ("cosmetics", "Expense__Personal Care"),
            ("shampoo", "Expense__Personal Care"),
            ("soap", "Expense__Personal Care"),

            # --- Transportation ---
            ("petrol", "Expense__Transportation__Fuel"),
            ("diesel", "Expense__Transportation__Fuel"),
            ("fuel", "Expense__Transportation__Fuel"),
            ("cab", "Expense__Transportation__Taxi"),
            ("taxi", "Expense__Transportation__Taxi"),
            ("uber", "Expense__Transportation__Taxi"),
            ("ola", "Expense__Transportation__Taxi"),
            ("rapido", "Expense__Transportation__Taxi"),
            ("auto", "Expense__Transportation__Taxi"),
            ("bus", "Expense__Transportation__Public Transport"),
            ("metro", "Expense__Transportation__Public Transport"),
            ("train", "Expense__Transportation__Public Transport"),
            ("irctc", "Expense__Transportation__Public Transport"),
            ("flights", "Expense__Travel & Vacations__Flights"),
            ("flight", "Expense__Travel & Vacations__Flights"),
            ("parking", "Expense__Transportation__Parking"),
            ("toll", "Expense__Transportation__Tolls"),
            ("fastag", "Expense__Transportation__Tolls"),

            # --- Utilities & Home ---
            ("electricity", "Expense__Housing & Utilities__Electricity"),
            ("bescom", "Expense__Housing & Utilities__Electricity"),
            ("bill", "Expense__Housing & Utilities__Bills"),
            ("recharge", "Expense__Housing & Utilities__Phone"),
            ("jio", "Expense__Housing & Utilities__Phone"),
            ("airtel", "Expense__Housing & Utilities__Phone"),
            ("vodafone", "Expense__Housing & Utilities__Phone"),
            ("wifi", "Expense__Housing & Utilities__Internet"),
            ("broadband", "Expense__Housing & Utilities__Internet"),
            ("act", "Expense__Housing & Utilities__Internet"),
            ("gas", "Expense__Housing & Utilities__Gas"),
            ("cylinder", "Expense__Housing & Utilities__Gas"),
            ("indane", "Expense__Housing & Utilities__Gas"),
            ("bharat", "Expense__Housing & Utilities__Gas"),
            ("water", "Expense__Housing & Utilities__Water"),
            ("maintenance", "Expense__Housing & Utilities__Maintenance"),
            ("maid", "Expense__Housing & Utilities__Maintenance"),
            ("rent", "Expense__Housing & Utilities__Rent"),

            # --- Shopping ---
            ("shirts", "Expense__Shopping__Clothing"),
            ("shirt", "Expense__Shopping__Clothing"),
            ("pants", "Expense__Shopping__Clothing"),
            ("pant", "Expense__Shopping__Clothing"),
            ("jeans", "Expense__Shopping__Clothing"),
            ("dresses", "Expense__Shopping__Clothing"),
            ("dress", "Expense__Shopping__Clothing"),
            ("shoes", "Expense__Shopping__Footwear"),
            ("shoe", "Expense__Shopping__Footwear"),
            ("sandal", "Expense__Shopping__Footwear"),
            ("clothes", "Expense__Shopping__Clothing"),
            ("amazon", "Expense__Shopping__Online"),
            ("flipkart", "Expense__Shopping__Online"),
            ("myntra", "Expense__Shopping__Clothing"),
            ("ajio", "Expense__Shopping__Clothing"),
            ("meesho", "Expense__Shopping__Clothing"),
            ("zudio", "Expense__Shopping__Clothing"),
            ("ikea", "Expense__Shopping__Home Decor"),
            ("decathlon", "Expense__Shopping__Sports"),
            
            # --- Entertainment ---
            ("movies", "Expense__Entertainment__Movies"),
            ("movie", "Expense__Entertainment__Movies"),
            ("cinema", "Expense__Entertainment__Movies"),
            ("bookmyshow", "Expense__Entertainment__Movies"),
            ("netflix", "Expense__Entertainment__Streaming"),
            ("prime", "Expense__Entertainment__Streaming"),
            ("hotstar", "Expense__Entertainment__Streaming"),
            ("spotify", "Expense__Entertainment__Streaming"),
            ("youtube", "Expense__Entertainment__Streaming"),
            ("game", "Expense__Entertainment__Games"),
            ("steam", "Expense__Entertainment__Games"),

            # --- Income ---
            ("salary", "Income__Salary & Wages__Monthly"),
            ("stipend", "Income__Salary & Wages__Monthly"),
            ("interest", "Income__Investment Returns__Bank Interest"),
            ("dividend", "Income__Investment Returns__Dividends"),
            ("refund", "Income__Miscellaneous__Refunds"),
            ("cashback", "Income__Miscellaneous__Refunds"),
            
            # --- Groceries (Specifics) ---
            ("rice", "Expense__Groceries__General"),
            ("atta", "Expense__Groceries__General"),
            ("dal", "Expense__Groceries__General"),
            ("oil", "Expense__Groceries__General"),
            ("sugar", "Expense__Groceries__General"),
            ("salt", "Expense__Groceries__General"),
            ("spices", "Expense__Groceries__General"),
            ("egg", "Expense__Groceries__Daily Essentials"),
            ("eggs", "Expense__Groceries__Daily Essentials"),
            ("bread", "Expense__Groceries__Daily Essentials"),
            ("butter", "Expense__Groceries__Daily Essentials"),
            ("cheese", "Expense__Groceries__Daily Essentials"),
            ("curd", "Expense__Groceries__Daily Essentials"),
            ("paneer", "Expense__Groceries__Daily Essentials"),
            ("chicken", "Expense__Groceries__Meat"),
            ("meat", "Expense__Groceries__Meat"),
            ("fish", "Expense__Groceries__Meat"),
            ("onion", "Expense__Groceries__Produce"),
            ("potato", "Expense__Groceries__Produce"),
            ("tomato", "Expense__Groceries__Produce"),
            ("maggi", "Expense__Groceries__General"),
            ("biscuit", "Expense__Groceries__Snacks"),
            ("chips", "Expense__Groceries__Snacks"),

            # --- General Fallbacks (Lowest Priority) ---
            ("food", "Expense__Food & Dining__General"),
            ("groceries", "Expense__Groceries__General"),
            ("grocery", "Expense__Groceries__General"),
            ("kirana", "Expense__Groceries__General"),
            ("mart", "Expense__Groceries__General"),
            ("supermarket", "Expense__Groceries__General"),
            ("milk", "Expense__Groceries__Daily Essentials"),
            ("vegetables", "Expense__Groceries__Produce"),
            ("vegetable", "Expense__Groceries__Produce"),
            ("fruits", "Expense__Groceries__Produce"),
            ("fruit", "Expense__Groceries__Produce"),
        ]

        
        # Check Rules
        for keyword, cat in PRIORITY_RULES:
            # Handle string keywords (standard regex check)
            if re.search(r'\b' + re.escape(str(keyword)) + r'\b', desc_lower):
                final_category = cat
                break
                
        # Special Logic for Loans (Context dependent)
        if not final_category:
            if has_word(desc_lower, 'emi'):
                final_category = "Expense__Debt Payments__Loan EMIs"
            elif has_word(desc_lower, 'loan'):
                if any(w in desc_lower for w in ['paid', 'repayment', 'clear', 'settle', 'installment']):
                     final_category = "Expense__Debt Payments__Loan Repayment"
                elif any(w in desc_lower for w in ['borrowed', 'received', 'credit', 'advance', 'disbursement', 'taken']):
                     final_category = "Loan__Disbursement (Amount Borrowed)__Bank Loan"

        if final_category:
            return {
                "category": final_category,
                "confidence": 1.0,
                "input": request.description
            }

        # AI Prediction logic
        if is_pipeline:
             # Pipeline handles vectorization internally
             # Pass raw string in a list
             prediction = model.predict([request.description])[0]
             
             try:
                 probs = model.predict_proba([request.description])[0]
                 confidence = float(np.max(probs))
             except:
                 confidence = 1.0
        
        else:
             # Legacy logic (Separate Vectorizer)
             if not vectorizer:
                 raise HTTPException(status_code=500, detail="Legacy model loaded but vectorizer missing.")
                 
             vec_text = vectorizer.transform([request.description])
             prediction = model.predict(vec_text)[0]
             
             try:
                 probs = model.predict_proba(vec_text)[0]
                 confidence = float(np.max(probs))
             except:
                 confidence = 1.0
                 
        return {
            "category": str(prediction),
            "confidence": confidence,
            "input": request.description
        }

    except Exception as e:
        print(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

# Forecast Models
from typing import List
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA

class TransactionSchema(BaseModel):
    amount: float
    date: str

class ForecastRequest(BaseModel):
    transactions: List[TransactionSchema]
    period: str = "W"  # W (Weekly), M (Monthly)
    steps: int = 4

@app.post("/forecast")
async def forecast_spending(req: ForecastRequest):
    try:
        if not req.transactions:
            return {"history": [], "forecast": []}
            
        # Create DataFrame
        df = pd.DataFrame([t.dict() for t in req.transactions])
        df['date'] = pd.to_datetime(df['date'])
        df.set_index('date', inplace=True)
        
        # Resample logic
        display_format = '%Y-%m-%d'
        if req.period == 'M':
            offset = 'ME'  # Month End (modern pandas)
            display_format = '%b %Y'
        elif req.period == 'W':
            offset = 'W'
            display_format = 'Week %U, %Y'
        else:
            offset = 'D'
            
        # Sum by period (Expenses only, assuming frontend filters for Debit)
        # We fill missing dates with 0 to have continuous time series
        resampled = df.resample(offset)['amount'].sum().fillna(0)
        
        # Determine strict ARIMA standard
        # ARIMA needs sufficient data points. If < 5, use simple mean/last value.
        history_points = len(resampled)
        forecast_values = []
        
        if history_points < 5:
            # Fallback: Simple Average
            avg = resampled.mean() if history_points > 0 else 0
            forecast_values = [float(avg)] * req.steps
        else:
            try:
                # Fit ARIMA(1,1,1)
                model = ARIMA(resampled, order=(1,1,1))
                model_fit = model.fit()
                forecast_result = model_fit.forecast(steps=req.steps)
                forecast_values = [float(x) for x in forecast_result]
            except Exception as arima_err:
                print(f"ARIMA fitting failed: {arima_err}, falling back to mean.")
                avg = resampled.mean()
                forecast_values = [float(avg)] * req.steps

        # Prepare Response Data
        history_data = [
            {"name": idx.strftime(display_format), "amount": float(val), "isForecast": False}
            for idx, val in resampled.items()
        ]
        
        last_date = resampled.index[-1] if not resampled.empty else pd.Timestamp.now()
        forecast_data = []
        
        for i, val in enumerate(forecast_values):
            # Calculate next date
            if req.period == 'M':
                 next_date = last_date + pd.DateOffset(months=i+1)
            elif req.period == 'W':
                 next_date = last_date + pd.DateOffset(weeks=i+1)
            else:
                 next_date = last_date + pd.DateOffset(days=i+1)
                 
            forecast_data.append({
                "name": next_date.strftime(display_format) + " (Est)",
                "amount": float(val),
                "isForecast": True
            })
            
        return {
            "history": history_data,
            "forecast": forecast_data,
            "full_data": history_data + forecast_data
        }

    except Exception as e:
        print(f"Forecast error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
