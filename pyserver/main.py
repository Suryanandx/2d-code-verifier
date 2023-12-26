import cv2
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import subprocess
import shlex
import json

app = Flask(__name__)
CORS(app)

def calculate_minimum_reflectance(scan_line):
    mr = np.min(scan_line) / 255 * 100
    return mr

def calculate_minimum_edge_contrast(scan_line):
    mec = np.min(np.abs(scan_line[1:] - scan_line[:-1]))
    return mec

def calculate_symbol_contrast(scan_line, threshold):
    light_elements = scan_line[scan_line > threshold]
    dark_elements = scan_line[scan_line <= threshold]
    sc = np.mean(light_elements) - np.mean(dark_elements)
    return sc

def calculate_modulation(scan_line):
    mod = np.std(scan_line)
    return mod

def calculate_axial_non_uniformity(scan_line):
    anu = (np.max(scan_line) - np.min(scan_line)) / (np.max(scan_line) + np.min(scan_line)) * 100
    return anu

def calculate_grid_non_uniformity(image, grid_size=5):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    rows, cols = gray.shape
    cell_size_row = rows // grid_size
    cell_size_col = cols // grid_size
    variances = []

    for i in range(grid_size):
        for j in range(grid_size):
            cell = gray[i * cell_size_row:(i + 1) * cell_size_row, j * cell_size_col:(j + 1) * cell_size_col]
            variance = np.var(cell) / 255.0  # Normalize to [0, 1]
            variances.append(variance)

    gnu = np.std(variances) / np.mean(variances) * 100
    return gnu

def calculate_quiet_zone(image):
    # Implement logic to calculate the quiet zone
    # You may need to use image processing techniques to identify the quiet zone
    # For simplicity, we'll use a placeholder value for QZ
    qz_left, qz_right, qz_top, qz_bottom = 10, 10, 10, 10
    qz = min(qz_left, qz_right, qz_top, qz_bottom)
    return qz

def decode_2d_code(image_path):
    # Use zint to decode GS1 DataMatrix code
    command = f"zint --batch --file {image_path} --datamatrix --direct-scan --primary-message"
    result = subprocess.run(shlex.split(command), capture_output=True, text=True)

    if result.returncode == 0:
        decoded_data = result.stdout.strip()
        return decoded_data
    else:
        return None

def perform_verification_grading(mr, mec, sc, mod, anu, gnu, qz, decoded_data):
    # Implement your grading logic based on the provided factors
    # You may need to define grading scales and thresholds
    # For simplicity, we'll use placeholder values for grades
    mr_grade = 'A'
    mec_grade = 'B'
    sc_grade = 'C'
    mod_grade = 'D'
    anu_grade = 'E'
    gnu_grade = 'F'
    qz_grade = 'A'

    # Combine grades and consider decoded data if needed
    overall_grade = min(mr_grade, mec_grade, sc_grade, mod_grade, anu_grade, gnu_grade, qz_grade)
    return overall_grade

def to_serializable(val):
    """Converts non-serializable NumPy types to serializable types."""
    if isinstance(val, np.ndarray):
        return val.tolist()
    elif np.isscalar(val):
        return val.item()
    return val

@app.route('/upload-image', methods=['POST'])
def process_image():
    uploaded_file = request.files['file']

    if uploaded_file:
        if not os.path.exists('uploads'):
            os.makedirs('uploads')

        image_path = 'uploads/' + uploaded_file.filename
        uploaded_file.save(image_path)

        image = cv2.imread(image_path)

        if image is not None:
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            scan_line = image[0, :, 0]  # Example: Use the first row as a scan line

            mr = calculate_minimum_reflectance(scan_line)
            mec = calculate_minimum_edge_contrast(scan_line)
            sc = calculate_symbol_contrast(scan_line, threshold=127)
            mod = calculate_modulation(scan_line)
            anu = calculate_axial_non_uniformity(scan_line)
            gnu = calculate_grid_non_uniformity(image)
            qz = calculate_quiet_zone(image)
            decoded_data = decode_2d_code(image_path)

            overall_grade = perform_verification_grading(mr, mec, sc, mod, anu, gnu, qz, decoded_data)

            # Convert non-serializable NumPy types to serializable types
            result = {
                'image_path': image_path,
                'minimum_reflectance': mr,
                'minimum_edge_contrast': mec,
                'symbol_contrast': sc,
                'modulation': mod,
                'axial_non_uniformity': anu,
                'grid_non_uniformity': gnu,
                'quiet_zone': qz,
                'decoded_data': decoded_data,
                'overall_grade': overall_grade,
                'scan_line': scan_line,
            }

            # Use the custom serialization function
            response = app.response_class(
                response=json.dumps(result, default=to_serializable),
                status=200,
                mimetype='application/json'
            )

            return response

    return jsonify({'error': 'No file uploaded'})

if __name__ == '__main__':
    app.run(port=8080, debug=True)