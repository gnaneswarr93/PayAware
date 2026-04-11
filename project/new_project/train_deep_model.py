import pandas as pd
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import SGDClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

def train_deep_model():
    print("🧠 Training DEEP CONTEXT MODEL (Random Forest)...")
    
    # 1. Load the new 'Context-Aware' Dataset
    filepath = "deep_context_dataset.csv"
    if not os.path.exists(filepath):
        print("Error: Dataset not found.")
        return

    df = pd.read_csv(filepath)
    X = df['description'].fillna('').astype(str)
    y = df['category']
    
    print(f"Dataset Size: {len(df)} samples")
    print(f"Unique Categories: {df['category'].nunique()}")
    
    # 2. Pipeline for Context Understanding
    # - TfidfVectorizer:
    #   * 'char_wb' + ngram_range=(2,6): Captures word boundaries and prefixes/suffixes 
    #   * 'max_features=50000': Allows it to learn many rare phrases ("paid to", "sent from")
    
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(
            analyzer='char_wb',
            ngram_range=(2, 6),     # Wide n-grams to catch "paid to uber" as a unit
            min_df=2,
            max_features=50000,
            sublinear_tf=True 
        )),
        ('clf', RandomForestClassifier( # Stable, semantic learner
            n_estimators=60,      # Enough trees for nuance, small enough for GitHub
            max_depth=30,         # Deep trees to understand complex sentences
            min_samples_leaf=2,   # Prevent over-memorizing
            class_weight='balanced',
            n_jobs=-1,
            random_state=42,
            verbose=1
        ))
    ])
    
    # Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.15, random_state=42, stratify=y)
    
    # Train
    print("Fitting model to learn sentence structures...")
    pipeline.fit(X_train, y_train)
    
    # Evaluate
    y_pred = pipeline.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    
    print(f"\n✨ DEEP CONTEXT MODEL ACCURACY: {acc*100:.2f}%")
    
    # Save Pipeline (Compressed for GitHub)
    print("Saving compressed model pipeline...")
    joblib.dump(pipeline, 'expense_model.pkl', compress=3)
    print("✅ DEPLOYED: Context-Aware Model is ready.")

if __name__ == "__main__":
    train_deep_model()
