import React from 'react';

interface RegressionResultsProps {
  results: {
    r_squared: number;
    adj_r_squared: number;
    multicollinearity_warning: boolean;
    coefficients: {
      name: string;
      coefficient: number;
      p_value: number;
      significant: boolean;
    }[];
  } | null;
}

const RegressionResults: React.FC<RegressionResultsProps> = ({ results }) => {
  if (!results) return null;

  return (
    <div className="regression-results">
      <h3>Regression Results</h3>
      
      <div className="metrics-cards">
        <div className="card">
          <h4>R-Squared</h4>
          <p>{results.r_squared.toFixed(4)}</p>
        </div>
        <div className="card">
          <h4>Adj. R-Squared</h4>
          <p>{results.adj_r_squared.toFixed(4)}</p>
        </div>
      </div>

      {results.multicollinearity_warning && (
        <div className="warning-banner">
          Warning: Strong multicollinearity detected! Model condition number is high.
        </div>
      )}

      <h4>Coefficients</h4>
      <table className="coef-table">
        <thead>
          <tr>
            <th>Variable</th>
            <th>Coefficient</th>
            <th>P-Value</th>
            <th>Significant (p &lt; 0.05)</th>
          </tr>
        </thead>
        <tbody>
          {results.coefficients.map((coef, idx) => (
            <tr key={idx} className={!coef.significant ? 'insignificant' : ''}>
              <td>{coef.name}</td>
              <td>{coef.coefficient.toFixed(4)}</td>
              <td>{coef.p_value.toFixed(4)}</td>
              <td>
                {coef.significant ? (
                  <span className="badge true">Yes</span>
                ) : (
                  <span className="badge false">No</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RegressionResults;
