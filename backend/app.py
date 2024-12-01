import os
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import pytesseract

# Ensure uploads directory exists
os.makedirs('./uploads', exist_ok=True)

# Try to set Tesseract path with multiple fallbacks
try:
    pytesseract.pytesseract.tesseract_cmd = '/usr/bin/tesseract'
except Exception:
    try:
        pytesseract.pytesseract.tesseract_cmd = shutil.which('tesseract')
    except Exception:
        print("Warning: Could not set Tesseract path")

app = Flask(__name__)
CORS(app)

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
    app.run(host='0.0.0.0', port=8000)