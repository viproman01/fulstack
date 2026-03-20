import React, { useState } from 'react';
import axios from 'axios';

interface FileUploadProps {
  onAnalyzeComplete: (data: any, file: File, columns: any[]) => void;
  onError: (msg: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onAnalyzeComplete, onError }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      onError('Please select a file first.');
      return;
    }
    setLoading(true);
    onError('');

    try {
      // 1. Upload for columns parsing
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadRes = await axios.post('http://localhost:8000/upload', formData);
      const columns = uploadRes.data.columns;

      // 2. Automatically analyze
      const analyzeRes = await axios.post('http://localhost:8000/analyze', formData);
      
      onAnalyzeComplete(analyzeRes.data, file, columns);
    } catch (err: any) {
      onError(err.response?.data?.detail || 'An error occurred during file upload or analysis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <h3>1. Upload CSV Data</h3>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!file || loading}>
        {loading ? 'Processing...' : 'Upload & Analyze'}
      </button>
    </div>
  );
};

export default FileUpload;
