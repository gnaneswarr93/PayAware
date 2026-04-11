# Expense Classification AI

This project uses Machine Learning (Linear SVM) to classify daily expenses into ~15 categories (e.g., `food_dining`, `transportation`, `utilities`) with >99% accuracy.

## How to Run

### 1. Install Python
Ensure you have Python installed (version 3.8 or higher recommended).

### 2. Install Dependencies
Open a terminal in this folder and run:
```bash
pip install -r requirements.txt
```

### 3. Run the Prediction Tool
To classify your expenses interactively:
```bash
python predict_expense.py
```
*Type a description (e.g., "uber to airport") and press Enter.*

### 4. View Model Accuracy
To see the detailed accuracy report:
```bash
python evaluate_model.py
```

## Files Overview
-   `predict_expense.py`: The main tool for classifying new payments.
-   `expense_model.pkl`: The pre-trained AI model.
-   `cleaned_expense_dataset.csv`: The original dataset.
-   `augment_data.py`: Script used to generate synthetic training data.
-   `train_augmented.py`: Script to retrain the model if you add more data.
