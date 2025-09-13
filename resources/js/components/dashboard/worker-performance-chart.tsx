import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface WorkerPerformanceChartProps {
    data?: {
        workers: string[];
        completedJobs: number[];
        activeJobs: number[];
    };
}

export function WorkerPerformanceChart({ data }: WorkerPerformanceChartProps) {
    // Default mock data if no data provided
    const defaultData = {
        workers: ['John D.', 'Jane S.', 'Mike R.', 'Lisa K.', 'Tom B.'],
        completedJobs: [12, 15, 8, 11, 9],
        activeJobs: [3, 2, 5, 1, 4],
    };

    const chartData = data || defaultData;

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: false,
            },
        },
        scales: {
            x: {
                stacked: true,
            },
            y: {
                stacked: true,
                beginAtZero: true,
            },
        },
        maintainAspectRatio: false,
    };

    const chartDataConfig = {
        labels: chartData.workers,
        datasets: [
            {
                label: 'Completed Jobs',
                data: chartData.completedJobs,
                backgroundColor: 'rgba(34, 197, 94, 0.8)',
                borderColor: 'rgba(34, 197, 94, 1)',
                borderWidth: 1,
            },
            {
                label: 'Active Jobs',
                data: chartData.activeJobs,
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-card p-6">
            <div className="mb-4">
                <h3 className="text-lg font-semibold">Worker Performance</h3>
                <p className="text-sm text-muted-foreground">Jobs completed vs active this week</p>
            </div>
            <div className="h-[300px]">
                <Bar options={options} data={chartDataConfig} />
            </div>
        </div>
    );
}
