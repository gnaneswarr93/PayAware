import pandas as pd
import random
import os

def generate_deep_context_data():
    print("🧠 Generating Deep Semantic Data (Understanding Meaning, Context & Purpose)...")
    
    # Contextual Templates: Teaching the model "Purpose"
    # Format: [Action/Verb] + [Beneficiary/Target] + [Purpose]
    
    # 1. EXPENSE CONTEXTS (Money Leaving)
    expense_templates = [
        "paid for {item}", "money sent to {person} for {item}", "transfer to {entity} regarding {item}",
        "purchase of {item} at {entity}", "{item} bill payment", "bought {item} from {entity}",
        "spending on {item}", "charged for {item}", "debit for {item}", "payment towards {item}"
    ]
    
    # 2. INCOME CONTEXTS (Money Coming In)
    income_templates = [
        "received from {entity} for {item}", "credited by {entity} as {item}", "{item} deposited",
        "income from {item}", "payment received for {item}", "{item} credit", "refund of {item}",
        "cashback for {item}", "salary credited by {entity}", "bonus for {item}"
    ]

    # 3. LOAN CONTEXTS (Borrowed vs Repaid)
    loan_templates = [
        "loan disbursement from {entity}", "{item} loan credited", "amount borrowed from {entity}",
        "emi deducted for {item}", "repayment of {item} loan", "interest charged on {item}",
        "credit card bill due for {entity}", "payment of credit card outstanding"
    ]

    # Entities & Items Mapped to Categories
    category_map = {
        # EXPENSES
        "Expense__Food & Dining__Restaurant": {
            "entity": ["Zomato", "Swiggy", "McDonalds", "Starbucks", "Dominos", "Pizza Hut", "KFC", "Subway", "Burger King", "Barbeque Nation", "Local Cafe", "Restaurant", "Dhaba", "Canteen", "Bistro", "Food Court"],
            "item": ["dinner", "lunch", "breakfast", "buffet", "thali", "biryani", "pizza", "burger", "meal", "combo meal"]
        },
        "Expense__Food & Dining__Cafe": {
            "entity": ["Starbucks", "CCD", "Cafe Coffee Day", "Costa Coffee", "Chai Point", "Chaayos", "Tea Post"],
            "item": ["coffee", "tea", "cappuccino", "latte", "snacks", "bun maska", "cookies"]
        },
         "Expense__Food & Dining__Treats": {
            "entity": ["Ice Cream Parlour", "Bakery", "Sweet Shop", "Haldirams", "Baskin Robbins", "Amul"],
            "item": ["ice cream", "cake", "pastry", "sweets", "mithai", "chocolate", "dessert"]
        },
        "Expense__Groceries__General": {
            "entity": ["BigBasket", "Instamart", "Zepto", "Blinkit", "D-Mart", "Reliance Fresh", "More Supermarket", "Spencer's", "Nature's Basket", "Local Kirana", "General Store"],
            "item": ["groceries", "provisions", "monthly ration", "household items", "cleaning supplies", "staples", "rice", "dal", "oil", "sugar", "salt"]
        },
        "Expense__Groceries__Produce": {
            "entity": ["Vegetable Vendor", "Fruit Market", "Farmers Market", "Sabzi Mandi", "Organic Store"],
            "item": ["vegetables", "fruits", "onions", "potatoes", "tomatoes", "fresh produce", "greens"]
        },
         "Expense__Groceries__Daily Essentials": {
            "entity": ["Milk Booth", "Dairy", "Nandini", "Amul Parlour", "Mother Dairy"],
            "item": ["milk", "curd", "paneer", "eggs", "bread", "butter", "cheese"]
        },
        "Expense__Transportation__Taxi": {
            "entity": ["Uber", "Ola", "Rapido", "Cab Service", "Taxi Stand", "Auto Rickshaw"],
            "item": ["ride", "trip", "cab fare", "auto fare", "drop to office", "pickup cost"]
        },
        "Expense__Transportation__Fuel": {
            "entity": ["Indian Oil", "Bharat Petroleum", "Shell", "HP Petrol Pump", "Gas Station"],
            "item": ["petrol", "diesel", "fuel", "CNG", "full tank"]
        },
        "Expense__Transportation__Public Transport": {
            "entity": ["Metro Rail", "BMTC", "Bus Conductor", "Railway Station", "IRCTC"],
            "item": ["ticket", "metro card recharge", "bus pass", "train ticket", "monthly pass"]
        },
        "Expense__Shopping__Clothing": {
            "entity": ["Amazon", "Flipkart", "Myntra", "Ajio", "Zara", "H&M", "Trends", "Max Fashion", "Pantaloons", "Westside", "Zudio", "Meesho"],
            "item": ["clothes", "shirt", "t-shirt", "jeans", "dress", "kurta", "saree", "jacket", "outfit"]
        },
         "Expense__Shopping__Footwear": {
            "entity": ["Nike", "Adidas", "Puma", "Bata", "Metro Shoes", "Footwear Shop"],
            "item": ["shoes", "sandals", "slippers", "sneakers", "boots", "heels"]
        },
        "Expense__Shopping__Electronics": {
            "entity": ["Croma", "Reliance Digital", "Apple Store", "Samsung Shop", "Xiaomi Store"],
            "item": ["mobile", "laptop", "charger", "earbuds", "headphones", "power bank", "tablet"]
        },
        "Expense__Housing & Utilities__Bills": {
            "entity": ["Electricity Board", "Bescom", "Adani Power", "Tata Power", "Water Authority"],
            "item": ["electricity bill", "power bill", "water bill", "utility bill"]
        },
        "Expense__Housing & Utilities__Internet": {
            "entity": ["Airtel", "Jio", "Act Fibernet", "Spectra", "Hathway", "Broadband Provider"],
            "item": ["wifi recharge", "broadband bill", "internet plan", "fiber connection"]
        },
        "Expense__Housing & Utilities__Phone": {
            "entity": ["Jio", "Airtel", "Vi", "Vodafone", "BSNL"],
            "item": ["mobile recharge", "postpaid bill", "data pack", "topup"]
        },
         "Expense__Housing & Utilities__Gas": {
            "entity": ["Indane", "Bharat Gas", "HP Gas", "Gas Agency"],
            "item": ["gas cylinder", "LPG refill", "piped gas bill"]
        },
        "Expense__Entertainment__Movies": {
            "entity": ["PVR", "Inox", "Cinepolis", "BookMyShow", "Paytm Movies"],
            "item": ["movie tickets", "matinee show", "cinema tickets", "popcorn combo"]
        },
        "Expense__Entertainment__Streaming": {
             "entity": ["Netflix", "Amazon Prime", "Hotstar", "Spotify", "YouTube", "Apple Music"],
             "item": ["subscription", "monthly plan", "premium membership", "renewal"]
        },
        "Expense__Healthcare__Medicine": {
            "entity": ["Apollo Pharmacy", "MedPlus", "1mg", "Netmeds", "Local Chemist"],
            "item": ["medicines", "tablets", "syrup", "prescription drugs", "medical supplies"]
        },
        "Expense__Healthcare__Doctor": {
            "entity": ["Doctor", "Hospital", "Clinic", "Practo", "Lab", "Diagnostics Center"],
            "item": ["consultation fee", "checkup", "blood test", "scan", "x-ray", "treatment"]
        },
        "Expense__Personal Care": {
            "entity": ["Salon", "Barber Shop", "Spa", "Urban Company", "Naturals", "Green Trends"],
            "item": ["haircut", "shaving", "facial", "massage", "waxing", "grooming"]
        },
        "Expense__Education__Tuition": {
            "entity": ["School", "College", "University", "Coaching Centre", "Byjus", "Unacademy", "Udemy"],
            "item": ["school fees", "college fees", "semester fee", "course fee", "subscription"]
        },
         "Expense__Education__Stationery": {
            "entity": ["Stationery Shop", "Book Store", "Xerox Shop"],
            "item": ["notebooks", "pens", "pencils", "photocopies", "printouts", "art supplies"]
        },
        "Expense__Travel & Vacations__Flights": {
            "entity": ["Indigo", "Air India", "MakeMyTrip", "Cleartrip", "Easemytrip"],
            "item": ["flight ticket", "ticket booking", "airfare"]
        },
         "Expense__Travel & Vacations__Hotels": {
            "entity": ["Airbnb", "Oyo", "Hotel", "Resort", "Booking.com"],
            "item": ["room booking", "stay", "accommodation", "hotel bill"]
        },
        
        # INCOME
        "Income__Salary & Wages__Monthly": {
            "entity": ["Employer", "Google", "Microsoft", "TCS", "Infosys", "Wipro", "Accenture", "Company Account"],
            "item": ["salary", "monthly salary", "payroll", "stipend", "earnings"]
        },
        "Income__Business & Freelance": {
            "entity": ["Client", "Upwork", "Fiverr", "Customer", "Consultancy"],
            "item": ["project fee", "invoice payment", "freelance income", "service charge", "consulting fee"]
        },
        "Income__Rental Income": {
            "entity": ["Tenant", "Renter"],
            "item": ["monthly rent", "shop rent", "house rent", "lease amount"]
        },
        "Income__Investment Returns__Dividends": {
            "entity": ["Zerodha", "Groww", "Stock Broker", "Company"],
            "item": ["dividend payout", "profit share"]
        },
         "Income__Investment Returns__Bank Interest": {
            "entity": ["Bank", "SBI", "HDFC", "ICICI"],
            "item": ["savings interest", "FD interest", "interest credit"]
        },
        
        # MISC EXPENSES
        "Expense__Charity & Donations": {
            "entity": ["Temple", "Church", "Mosque", "NGO", "Relief Fund", "Charity", "Beggar", "Orphanage"],
            "item": ["donation", "offering", "contribution", "charity", "help"]
        },
        "Expense__Miscellaneous": {
            "entity": ["Shop", "Vendor", "Person", "Friend"],
            "item": ["misc expense", "sundry items", "small purchase", "adjustment"]
        },
        "Expense__Debt Payments__Loan EMIs": {
            "entity": ["HDFC Bank", "SBI", "Bajaj Finance", "Home Credit", "IDFC First"],
            "item": ["loan EMI", "installment", "auto debit", "monthly repayment"]
        },
         "Expense__Debt Payments__Loan Repayment": {
            "entity": ["Friend", "Relative", "Lender"],
            "item": ["returned money", "paid back loan", "cleared debt", "settled amount"]
        },
        "Expense__Pets": {
            "entity": ["Vet Clinic", "Pet Shop", "Heads Up For Tails", "Drools"],
            "item": ["pet food", "dog food", "cat food", "vaccination", "checkup"]
        },
        "Expense__Home Maintenance": {
            "entity": ["Plumber", "Electrician", "Carpenter", "Painter", "Hardware Shop"],
            "item": ["repair", "fixing charge", "labour", "materials", "paint"]
        },
        "Expense__Subscriptions & Memberships": {
            "entity": ["Gym", "Club", "Magazine", "App Store", "Google Play"],
            "item": ["membership fee", "subscription renewal", "monthly charge"]
        },

        # LOAN - BORROWING
        "Loan__Disbursement (Amount Borrowed)__Bank Loan": {
            "entity": ["HDFC Bank", "SBI", "ICICI", "Axis Bank", "Loan App"],
            "item": ["personal loan credited", "home loan disbursement", "car loan amount", "amount credited"]
        },
         "Loan__Disbursement (Amount Borrowed)__Personal": {
             "entity": ["Friend", "Relative", "Colleague"],
             "item": ["borrowed money", "took hand loan", "received help", "credit from friend"]
         },
         
        # CREDIT CARD
        "Loan__Credit Card Dues": {
             "entity": ["Cred", "Cheq", "HDFC Card", "SBI Card", "Amex"],
             "item": ["credit card bill", "card payment", "statement due", "total due"]
        }
    }

    data = []
    
    # Generate Sentence Variations
    print("Creating varied sentence structures...")
    
    for category, vocab in category_map.items():
        is_income = "Income" in category
        is_loan = "Loan" in category
        
        # Select appropriate templates
        if "Disbursement" in category:
            templates = [t for t in loan_templates if "borrowed" in t or "disbursement" in t or "loan credited" in t]
        elif "Repayment" in category:
            templates = [t for t in loan_templates if "repayment" in t or "emi" in t]
        elif is_income:
            templates = income_templates
        else:
            templates = expense_templates

        # Generate 2000 variations per category -> ~60,000 samples total
        # This volume is needed for Deep Learning to pick up patterns
        for _ in range(2000):
            template = random.choice(templates)
            entity = random.choice(vocab["entity"])
            item = random.choice(vocab["item"])
            
            # Fill template
            text = template.replace("{entity}", entity).replace("{item}", item)
            
            # Add Noise (Realism)
            if random.random() > 0.7:
                text = text.lower() # lowercase sometimes
            if random.random() > 0.9:
                text += f" {random.randint(100,999)}" # Add random transaction ID
                
            data.append({"description": text, "category": category})

    df = pd.DataFrame(data)
    df = df.sample(frac=1).reset_index(drop=True)
    
    output_path = "deep_context_dataset.csv"
    df.to_csv(output_path, index=False)
    print(f"✅ Generated {len(df)} rich semantic samples.")
    print(f"📊 Dataset saved to: {output_path}")

if __name__ == "__main__":
    generate_deep_context_data()
