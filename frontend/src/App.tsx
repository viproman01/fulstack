import { useState } from 'react';
import './App.css';
import FileUpload from './components/FileUpload';
import StatsTable from './components/StatsTable';
import CorrelationHeatmap from './components/CorrelationHeatmap';
import RegressionForm from './components/RegressionForm';
import RegressionResults from './components/RegressionResults';

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [columns, setColumns] = useState<any[]>([]);
  const [analyzeData, setAnalyzeData] = useState<any>(null);
  const [regressionResults, setRegressionResults] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const handleAnalyzeComplete = (data: any, uploadedFile: File, cols: any[]) => {
    setAnalyzeData(data);
    setFile(uploadedFile);
    setColumns(cols);
    setRegressionResults(null);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>ECONO Engine</h1>
        <p>Econometric Analysis Platform</p>
      </header>

      <main className="app-main">
        {error && <div className="error-banner">{error}</div>}

        <section className="section upload-section">
          <FileUpload onAnalyzeComplete={handleAnalyzeComplete} onError={setError} />
        </section>

        {analyzeData && (
          <>
            <section className="section data-section">
              <div className="top-correlations">
                <h3>Top Correlations</h3>
                <ul>
                  {analyzeData.top_correlations.map((pair: any, idx: number) => (
                    <li key={idx}>
                      <strong>{pair.feature1}</strong> & <strong>{pair.feature2}</strong>: {pair.correlation.toFixed(4)}
                    </li>
                  ))}
                </ul>
              </div>
              <StatsTable statistics={analyzeData.statistics} />
            </section>

            <section className="section heatmap-section">
              <CorrelationHeatmap correlationData={analyzeData.correlation_matrix} />
            </section>

            <section className="section regression-section">
              <div className="regression-container">
                <RegressionForm 
                  columns={columns} 
                  file={file} 
                  onRegressionComplete={setRegressionResults}
                  onError={setError}
                />
                <RegressionResults results={regressionResults} />
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
