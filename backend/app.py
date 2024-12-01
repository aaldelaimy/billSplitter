from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import re

import os
import shutil
import pytesseract

def find_tesseract():
    possible_paths = [
        "/usr/bin/tesseract",  # Render
        "/opt/homebrew/bin/tesseract",  # macOS
        "/usr/local/bin/tesseract",
        shutil.which("tesseract")
    ]
    
    for path in possible_paths:
        if path and os.path.exists(path):
            return path
    
    raise FileNotFoundError("Tesseract executable not found. Please install Tesseract OCR.")

# Set the Tesseract path
pytesseract.pytesseract.tesseract_cmd = find_tesseract()

app = Flask(__name__)
CORS(app) # Allows cross-origin requests (for React to connect)

@app.route('/api/split', methods=['POST'])
def split_bill():
    try:
        # Get uploaded file & number of people
        receipt = request.files['receipt']
        num_people = int(request.form['num_people'])

        # Temporarily save uploaded file
        receipt_path = f"./uploads/{receipt.filename}"
        receipt.save(receipt_path)

        # Perform OCR & extract text
        image = Image.open(receipt_path)
        text = pytesseract.image_to_string(image)

        # Use regex to find the total amount
        match = re.search(r'Total\s*\$?([\d,.]+)', text, re.IGNORECASE)
        if not match:
            raise ValueError("Total amount not found in receipt.")
        
        total = float(match.group(1).replace(',', ''))
        per_person = round(total / num_people, 2)

        return jsonify({"total": total, "per_person": per_person})
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
    if __name__ == '__main__':
        app.run(debug=True)