import requests
import json
import os

BASE_URL = "http://localhost:8000"
FILE_PATH = "/Users/admin/Documents/Фриланс /Fulstack разработчик /econo-engine/iris.csv"

def run_tests():
    print("--- 1. Testing /upload ---")
    with open(FILE_PATH, 'rb') as f:
        res = requests.post(f"{BASE_URL}/upload", files={"file": f})
    print(f"Status: {res.status_code}")
    data = res.json()
    print("Columns:")
    for col in data['columns']:
        print(f" - {col['name']} ({col['type']})")

    print("\n--- 2. Testing /analyze ---")
    with open(FILE_PATH, 'rb') as f:
        res2 = requests.post(f"{BASE_URL}/analyze", files={"file": f})
    print(f"Status: {res2.status_code}")
    data2 = res2.json()
    print("Statistics size:", len(data2['statistics']))
    print("Correlation matrix size:", len(data2['correlation_matrix']['columns']))
    print("Top correlations:", data2['top_correlations'])

    print("\n--- 3. Testing /regression ---")
    with open(FILE_PATH, 'rb') as f:
        res3 = requests.post(
            f"{BASE_URL}/regression", 
            data={"target": "sepal_length", "features": "petal_length,petal_width"}, 
            files={"file": f}
        )
    print(f"Status: {res3.status_code}")
    data3 = res3.json()
    print("R-squared:", data3.get('r_squared'))
    print("Coefficients:")
    for coef in data3.get('coefficients', []):
         print(f" - {coef['name']}: {coef['coefficient']:.4f} (p={coef['p_value']:.4f}, sig={coef['significant']})")
    
if __name__ == "__main__":
    run_tests()
