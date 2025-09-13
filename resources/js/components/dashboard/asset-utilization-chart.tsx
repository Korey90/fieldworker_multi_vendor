import React from 'react';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface AssetUtilizationChartProps {
    data?: {
        labels: string[];
        values: number[];
        colors: string[];
    };
}

export function AssetUtilizationChart({ data }: AssetUtilizationChartProps) {
    // Default mock data if no data provided
    const defaultData = {
        labels: ['In Use', 'Available', 'Maintenance', 'Out of Service'],
        values: [45, 25, 15, 15],
        colors: [
            'rgba(34, 197, 94, 0.8)',    // Green - In Use
            'rgba(59, 130, 246, 0.8)',   // Blue - Available
            'rgba(245, 158, 11, 0.8)',   // Yellow - Maintenance
            'rgba(239, 68, 68, 0.8)',    // Red - Out of Service
        ],
    };

    const chartData = data || defaultData;

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    padding: 20,
                    usePointStyle: true,
                },
            },
            title: {
                display: false,
            },
        },
        maintainAspectRatio: false,
        cutout: '60%',
    };

    const chartDataConfig = {
        labels: chartData.labels,
        datasets: [
            {
                data: chartData.values,
                backgroundColor: chartData.colors,
                borderColor: chartData.colors.map(color => color.replace('0.8', '1')),
                borderWidth: 2,
            },
        ],
    };

    // Calculate total for center display
    const total = chartData.values.reduce((sum, value) => sum + value, 0);

    return (
        <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-card p-6">
            <div className="mb-4">
                <h3 className="text-lg font-semibold">Asset Utilization</h3>
                <p className="text-sm text-muted-foreground">Current status of all assets</p>
            </div>
            <div className="relative h-[300px]">
                <Doughnut options={options} data={chartDataConfig} />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-2xl font-bold">{total}</div>
                        <div className="text-sm text-muted-foreground">Total Assets</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
