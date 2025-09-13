import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface JobTimelineChartProps {
    data?: {
        labels: string[];
        created: number[];
        completed: number[];
        cancelled: number[];
    };
}

export function JobTimelineChart({ data }: JobTimelineChartProps) {
    // Default mock data if no data provided
    const defaultData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        created: [5, 8, 6, 10, 7, 3, 2],
        completed: [3, 6, 4, 8, 9, 2, 1],
        cancelled: [1, 1, 0, 1, 0, 0, 0],
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
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                },
            },
        },
        maintainAspectRatio: false,
    };

    const chartDataConfig = {
        labels: chartData.labels,
        datasets: [
            {
                label: 'Created',
                data: chartData.created,
                borderColor: 'rgba(59, 130, 246, 1)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
            },
            {
                label: 'Completed',
                data: chartData.completed,
                borderColor: 'rgba(34, 197, 94, 1)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                tension: 0.4,
            },
            {
                label: 'Cancelled',
                data: chartData.cancelled,
                borderColor: 'rgba(239, 68, 68, 1)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.4,
            },
        ],
    };

    return (
        <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-card p-6">
            <div className="mb-4">
                <h3 className="text-lg font-semibold">Job Timeline</h3>
                <p className="text-sm text-muted-foreground">Job status changes over the last week</p>
            </div>
            <div className="h-[300px]">
                <Line options={options} data={chartDataConfig} />
            </div>
        </div>
    );
}
