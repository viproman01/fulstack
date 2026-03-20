import React from 'react';
import Plot from 'react-plotly.js';

interface CorrelationHeatmapProps {
  correlationData: {
    columns: string[];
    matrix: (number | null)[][];
  };
}

const CorrelationHeatmap: React.FC<CorrelationHeatmapProps> = ({ correlationData }) => {
  if (!correlationData || !correlationData.columns) return null;

  const { columns, matrix } = correlationData;

  // Plotly expects z as an array of arrays (rows), y as rows, x as columns
  return (
    <div className="heatmap-container">
      <h3>Correlation Matrix</h3>
      <Plot
        data={[
          {
            z: matrix,
            x: columns,
            y: columns,
            type: 'heatmap',
            colorscale: 'RdBu',
            zmin: -1,
            zmax: 1,
            hoverongaps: false,
          },
        ]}
        layout={{
          width: 600,
          height: 600,
          margin: { t: 50, r: 50, b: 100, l: 100 },
          title: 'Pearson Correlation Heatmap'
        }}
      />
    </div>
  );
};

export default CorrelationHeatmap;
