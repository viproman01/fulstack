import pandas as pd
import numpy as np
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from typing import List
import io
import statsmodels.api as sm

router = APIRouter()

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

async def validate_and_read_csv(file: UploadFile) -> pd.DataFrame:
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Invalid file format. Only CSV allowed.")
    
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Max size is 10MB.")
    
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="File is empty.")
    
    try:
        df = pd.read_csv(io.BytesIO(contents))
        return df
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    df = await validate_and_read_csv(file)
    
    columns_info = []
    for col in df.columns:
        dtype = str(df[col].dtype)
        if "int" in dtype or "float" in dtype:
            col_type = "numeric"
        elif "datetime" in dtype:
            col_type = "datetime"
        else:
            col_type = "categorical"
        
        columns_info.append({
            "name": col,
            "type": col_type
        })
        
    return {"filename": file.filename, "columns": columns_info}

@router.post("/analyze")
async def analyze_data(file: UploadFile = File(...)):
    df = await validate_and_read_csv(file)
    
    numeric_df = df.select_dtypes(include=[np.number])
    if numeric_df.empty:
        raise HTTPException(status_code=400, detail="No numeric columns found for analysis.")
    
    # 1. Descriptive stats
    stats = []
    for col in numeric_df.columns:
        col_data = numeric_df[col]
        stats.append({
            "column": col,
            "min": float(col_data.min()) if not pd.isna(col_data.min()) else None,
            "max": float(col_data.max()) if not pd.isna(col_data.max()) else None,
            "mean": float(col_data.mean()) if not pd.isna(col_data.mean()) else None,
            "median": float(col_data.median()) if not pd.isna(col_data.median()) else None,
            "std": float(col_data.std()) if not pd.isna(col_data.std()) else None,
            "missing": int(col_data.isna().sum())
        })
        
    # 2. Correlation matrix
    corr_matrix = numeric_df.corr(method='pearson')
    
    # Format correlation matrix for frontend
    corr_data = {
        "columns": corr_matrix.columns.tolist(),
        "matrix": corr_matrix.replace({np.nan: None}).values.tolist()
    }
    
    # 3. Top-3 pairs with largest correlation
    # We unstack, drop self-correlation, take abs, sort, and get top 3 unique pairs
    c = corr_matrix.abs().unstack()
    # Filter out self correlation (diagonal)
    c = c[c < 1.0]
    # Drop duplicates like (A,B) and (B,A) by using frozenset or taking upper triangle
    pairs = c.drop_duplicates().sort_values(ascending=False).head(3)
    
    top_pairs = []
    for index, val in pairs.items():
        # Get actual correlation with sign
        actual_corr = corr_matrix.loc[index[0], index[1]]
        top_pairs.append({
            "feature1": index[0],
            "feature2": index[1],
            "correlation": float(actual_corr)
        })
        
    return {
        "statistics": stats,
        "correlation_matrix": corr_data,
        "top_correlations": top_pairs
    }

@router.post("/regression")
async def run_regression(
    target: str = Form(...),
    features: str = Form(...), # Comma separated list of features
    file: UploadFile = File(...)
):
    df = await validate_and_read_csv(file)
    
    features_list = [f.strip() for f in features.split(",") if f.strip()]
    
    if target not in df.columns:
        raise HTTPException(status_code=400, detail=f"Target column '{target}' not found.")
    for f in features_list:
        if f not in df.columns:
            raise HTTPException(status_code=400, detail=f"Feature column '{f}' not found.")
            
    # Prepare data, drop NAs
    model_data = df[[target] + features_list].dropna()
    if model_data.empty:
        raise HTTPException(status_code=400, detail="Data is empty after dropping missing values.")
        
    Y = model_data[target]
    X = model_data[features_list]
    
    # Ensure they are numeric
    if not pd.api.types.is_numeric_dtype(Y):
        raise HTTPException(status_code=400, detail="Target variable must be numeric.")
    for col in X.columns:
        if not pd.api.types.is_numeric_dtype(X[col]):
            # Try converting to dummies if categorical? The task doesn't explicitly ask, so let's error or just use numeric.
            raise HTTPException(status_code=400, detail=f"Feature variable '{col}' must be numeric.")
            
    # Add constant for OLS
    X_with_const = sm.add_constant(X)
    
    try:
        model = sm.OLS(Y, X_with_const).fit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Regression failed: {str(e)}")
        
    # Extract results
    results = {
        "r_squared": float(model.rsquared),
        "adj_r_squared": float(model.rsquared_adj),
        "coefficients": [],
        "multicollinearity_warning": False
    }
    
    # Check for multicollinearity using condition number
    if model.condition_number > 30:
        results["multicollinearity_warning"] = True
        
    for name, coef in model.params.items():
        # Skip the constant if you want, or include it
        if name == 'const':
            name_label = 'Intercept'
            p_val = float(model.pvalues['const']) if 'const' in model.pvalues else 0.0
        else:
            name_label = name
            p_val = float(model.pvalues[name]) if name in model.pvalues else 0.0
            
        results["coefficients"].append({
            "name": name_label,
            "coefficient": float(coef),
            "p_value": p_val,
            "significant": bool(p_val <= 0.05)
        })
        
    return results
