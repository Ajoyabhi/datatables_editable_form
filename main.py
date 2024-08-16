from flask import Flask, render_template, jsonify, request
import pandas as pd
import os

app = Flask(__name__)

# Define the path to the Parquet file
parquet_file = 'data.parquet'

# Load data from the Parquet file (if it exists), otherwise use the sample data
if os.path.exists(parquet_file):
    df = pd.read_parquet(parquet_file)
    data = df.to_dict(orient='records')
else:
    data = [
        {"id": 1, "name": "John Doe", "incident_age": 2, "age": 30, "age1": "", "incident_age_entered": "", "city": "New York"},
        {"id": 3, "name": "Jane Smith", "incident_age": 2, "age": 25, "age1": "", "incident_age_entered": "", "city": "Los Angeles"},
        {"id": 2, "name": "John Doe", "incident_age": 4, "age": 30, "age1": "", "incident_age_entered": "", "city": "New York"},
        {"id": 4, "name": "Jane Smith", "incident_age": 4, "age": 25, "age1": "", "incident_age_entered": "", "city": "Los Angeles"}
    ]
    df = pd.DataFrame(data)
    df.to_parquet(parquet_file, index=False)

@app.route('/')
def index():
    return render_template('index3.html')

# Route for getting all data
@app.route('/get_data')
def get_data():
    return jsonify(data)

# Route for adding new data
@app.route('/add_data', methods=['POST'])
def add_data():
    new_data = request.get_json()
    data.append(new_data)

    # Save the updated data to the Parquet file
    df = pd.DataFrame(data)
    df.to_parquet(parquet_file, index=False)

    return jsonify({"message": "Data added successfully"})

# Route for updating data
@app.route('/update_data/<int:id>', methods=['PUT'])
def update_data(id):
    updated_data = request.get_json()
    
    # Update the data in memory
    for item in data:
        if item['id'] == id:
            item.update(updated_data)
    
    # Convert data to a DataFrame
    df = pd.DataFrame(data)

    # Convert problematic columns to numeric, forcing invalid parsing to NaN
    df['age1'] = pd.to_numeric(df['age1'], errors='coerce')
    df['incident_age_entered'] = pd.to_numeric(df['incident_age_entered'], errors='coerce')
    
    # Fill NaN values with a default value like 0
    df['age1'].fillna(0, inplace=True)
    df['incident_age_entered'].fillna(0, inplace=True)
    
    # Save to Parquet
    df.to_parquet(parquet_file, index=False)

    return jsonify({"message": "Data updated and saved successfully"})
# Route for deleting data
@app.route('/delete_data/<int:id>', methods=['DELETE'])
def delete_data(id):
    global data
    data = [item for item in data if item['id'] != id]

    # Save the updated data to the Parquet file
    df = pd.DataFrame(data)
    df.to_parquet(parquet_file, index=False)

    return jsonify({"message": "Data deleted successfully"})

if __name__ == '__main__':
    app.run(debug=True)
