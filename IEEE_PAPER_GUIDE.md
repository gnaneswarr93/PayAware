# IEEE Paper Structure Guide for Payaware Algorithm

**Title Proposal:**
*Robust Short-Text Classification for Financial Transaction Categorization using Character-Level N-Gram SVMs*

---

## 1. Abstract
*Drafting Tip: Keep it under 250 words.*
Summarize the problem (messy bank transaction text), the proposed solution (Character-level SVM with probability calibration), and the results (high accuracy even on abbreviations). Mention the **hybrid approach** of using synthetic data augmentation to solve the "cold start" problem.

## 2. Introduction
Define the problem:
- Financial transaction descriptions are **short, noisy, and unstructured** (e.g., "UPI/1239/STARBUC/MUM" instead of "Starbucks Coffee").
- Traditional word-based models (like BERT or standard Naive Bayes) often fail because of:
  1.  **Out-of-Vocabulary (OOV) terms**: "Ntflx" instead of "Netflix".
  2.  **High Sparsity**: Unique transaction IDs make patterns hard to find.
  3.  **Data Scarcity**: Users don't want to manually tag 1,000 transactions to train a personal model.

## 3. Methodology (The Core Section)
*This is where you explain the algorithms we discussed. Use the following technical descriptions:*

### A. Data Augmentation Strategy (Dealing with Cold Start)
Explain that financial datasets for individuals are private and scarce.
- **Technique**: Rule-based Template Generation.
- **Implementation**: We utilized a generative engine to create synthetic transaction descriptions based on semantic templates (e.g., `{Action} + {Entity}`).
- **Benefit**: This allows the model to pre-train on ~500 samples per class, ensuring a balanced decision boundary before the user even enters their first transaction.

### B. Feature Engineering: Character-Level TF-IDF
Explain why you didn't use Word Embeddings (Word2Vec/GloVe).
- **Algorithm**: `TfidfVectorizer` with `analyzer='char_wb'` and `ngram_range=(2,5)`.
- **Justification**:
    - **Morphological Robustness**: By vectorizing character sequences (e.g., "UBE", "BER"), the model becomes resilient to misspellings and truncations common in SMS alerts.
    - **Dimensionality**: Applies `sublinear_tf` scaling to reduce the impact of repetitive tokens.

### C. Classification Model: Linear Support Vector Machine (SVM)
- **Algorithm**: `LinearSVC` with Squared Hinge Loss.
- **Justification**: SVMs are mathematically proven to perform best in **high-dimensional sparse spaces** (which is exactly what N-gram text data is).
- **Optimization**: Used `class_weight='balanced'` to penalize misclassification of minority classes (like "Education" expenses) more heavily than majority classes (like "Food").

### D. Probability Calibration (The "Confidence" Score)
- **Problem**: Standard SVMs output a strictly geometric distance from the hyperplane, which is not a probability.
- **Solution**: **Platt Scaling** (via `CalibratedClassifierCV`).
- **Equation**: $P(y|x) = \frac{1}{1 + exp(Af(x) + B)}$
- **Application**: This transforms the SVM output into a confidence score $[0, 1]$. The system uses this to implement a **Human-in-the-Loop** mechanism:
    - *Confidence > Threshold ($\tau$)*: Auto-categorize.
    - *Confidence < Threshold ($\tau$)*: Prompt user for verification.

## 4. System System Architecture
Briefly describe the **Electron-Python Bridge**. use a diagram if possible.
- Low-latency inference via Standard I/O streams implies the model is lightweight enough for local deployment (Privacy-preserving AI).

## 5. Experimental Results
*You can take screenshots of your terminal output for this.*
- **Metric**: F1-Score (Harmonic mean of Precision and Recall).
- **Performance**: Highlight specific categories where the character-level approach shines (e.g., differentiating "Uber" vs "Uber Eats").

## 6. Conclusion
Conclude that the combination of **synthetic data augmentation**, **character-level vectorization**, and **calibrated SVMs** provides a lightweight, privacy-first, and highly accurate solution for personal finance management.
