import React, { useState } from 'react';
import axios from 'axios';

interface RegressionFormProps {
  columns: { name: string; type: string }[];
  file: File | null;
  onRegressionComplete: (results: any) => void;
  onError: (msg: string) => void;
}

const RegressionForm: React.FC<RegressionFormProps> = ({ columns, file, onRegressionComplete, onError }) => {
  const [target, setTarget] = useState<string>('');
  const [features, setFeatures] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const numericColumns = columns.filter(c => c.type === 'numeric').map(c => c.name);

  if (!file || numericColumns.length === 0) return null;

  const handleFeatureToggle = (col: string) => {
    if (features.includes(col)) {
      setFeatures(features.filter(f => f !== col));
    } else {
      setFeatures([...features, col]);
    }
  };

  const handleRunRegression = async () => {
    if (!target) {
      onError('Please select a target variable.');
      return;
    }
    if (features.length === 0) {
      onError('Please select at least one feature variable.');
      return;
    }
    if (features.includes(target)) {
      onError('Target variable cannot be strictly in the feature set.');
      return;
    }

    setLoading(true);
    onError('');

    try {
      const formData = new FormData();
      formData.append('target', target);
      formData.append('features', features.join(','));
      formData.append('file', file);
      
      const res = await axios.post('http://localhost:8000/regression', formData);
      onRegressionComplete(res.data);
    } catch (err: any) {
      onError(err.response?.data?.detail || 'Regression failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="regression-form">
      <h3>Linear Regression Model</h3>
      
      <div className="form-group">
        <label>Target Variable (Y):</label>
        <select value={target} onChange={(e) => setTarget(e.target.value)}>
          <option value="">-- Select Target --</option>
          {numericColumns.map(col => (
            <option key={col} value={col}>{col}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Features (X):</label>
        <div className="checkbox-group">
          {numericColumns.map(col => (
            <div key={`feat-${col}`} className="checkbox-item">
              <input 
                type="checkbox" 
                id={`feat-${col}`} 
                checked={features.includes(col)}
                onChange={() => handleFeatureToggle(col)}
              />
              <label htmlFor={`feat-${col}`}>{col}</label>
            </div>
          ))}
        </div>
      </div>

      <button onClick={handleRunRegression} disabled={loading || !target || features.length === 0}>
        {loading ? 'Running...' : 'Run Regression'}
      </button>
    </div>
  );
};

export default RegressionForm;
