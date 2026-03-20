import React from 'react';

interface StatsTableProps {
  statistics: any[];
}

const StatsTable: React.FC<StatsTableProps> = ({ statistics }) => {
  if (!statistics || statistics.length === 0) return null;

  return (
    <div className="stats-container">
      <h3>Descriptive Statistics</h3>
      <table className="stats-table">
        <thead>
          <tr>
            <th>Column</th>
            <th>Min</th>
            <th>Max</th>
            <th>Mean</th>
            <th>Median</th>
            <th>Std Dev</th>
            <th>Missing</th>
          </tr>
        </thead>
        <tbody>
          {statistics.map((stat) => (
            <tr key={stat.column}>
              <td>{stat.column}</td>
              <td>{stat.min !== null ? stat.min.toFixed(4) : 'NaN'}</td>
              <td>{stat.max !== null ? stat.max.toFixed(4) : 'NaN'}</td>
              <td>{stat.mean !== null ? stat.mean.toFixed(4) : 'NaN'}</td>
              <td>{stat.median !== null ? stat.median.toFixed(4) : 'NaN'}</td>
              <td>{stat.std !== null ? stat.std.toFixed(4) : 'NaN'}</td>
              <td>{stat.missing}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StatsTable;
