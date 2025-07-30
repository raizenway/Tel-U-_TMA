'use client';

import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface RadarData {
  campus: string;
  radarValues: { [key: string]: number };
  color: string;
}

interface Props {
  data: RadarData[];
}

export default function AssessmentRadarChart({ data }: Props) {
  const labels = Object.keys(data[0]?.radarValues ?? {});

  const datasets = data.map((item) => ({
    label: item.campus,
    data: labels.map((key) => item.radarValues[key]),
    borderColor: item.color,
    backgroundColor: item.color + '33',
    borderWidth: 2,
    fill: true,
  }));

  return (
    <div className="bg-white rounded-lg p-4 shadow-md">
      <h3 className="text-lg font-semibold mb-4">Radar Penilaian</h3>
      <Radar
        data={{ labels, datasets }}
        options={{
          responsive: true,
          scales: {
            r: {
              angleLines: { display: true },
              suggestedMin: 0,
              suggestedMax: 100,
              ticks: { stepSize: 20 },
            },
          },
        }}
      />
    </div>
  );
}
