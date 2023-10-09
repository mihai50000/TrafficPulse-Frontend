import { ChartConfiguration } from 'chart.js';
import {AnimationSpec} from "chart.js/dist/types";
import 'chartjs-plugin-zoom';
import 'chartjs-adapter-date-fns';
import { parseISO, format } from 'date-fns';

export const generateLabels = (data: any[]) => {
    if(data.length <= 1) {
        return []
    }

    console.log(data)
    const minTime = parseISO(data[0].Start);
    const maxTime = parseISO(data[data.length - 1].Start);
    const interval = (maxTime.getTime() - minTime.getTime()) / 10;
    const labels = [];

    for (let i = 0; i < 10; i++) {
        const time = new Date(minTime.getTime() + i * interval);
        labels.push(format(time, 'MMM dd HH:mm'));
    }

    return labels;
};

export const createChartConfig = (data: any[]) => {
    // Calculate the earliest and latest time from the data
    const chartConfig: ChartConfiguration<'line'> = {
        type: 'line',
        labels: generateLabels(data),

        data: {
            labels: data.map((entry) => entry.Start),
            datasets: [
                {
                    label: 'Size',
                    data: data.map((entry) => ({
                        x: parseISO(entry.Start.replace('T', ' ')),
                        y: entry.Size,
                    })),
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        tooltipFormat: 'yyyy-MM-dd HH:mm:ss',
                        unit: 'day',
                        displayFormats: {
                            day: 'MMM dd HH:mm', // Include hour and minute in the display format
                        },
                    },
                    ticks: {
                        source: 'labels',
                    },
                },
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: (value: number) => {
                            if (value >= 1e9) {
                                return Math.round(value / 1e9) + 'GB';
                            } else if (value >= 1e6) {
                                return Math.round(value / 1e6) + 'MB';
                            } else if (value >= 1e3) {
                                return Math.round(value / 1e3) + 'KB';
                            } else if (value >= 1) {
                                return Math.round(value) + 'B';
                            } else {
                                return value.toString();
                            }
                        },
                        max: 10, // Adjust the maximum value according to your data
                    } as any,
                },
            },
            animation: {
                duration: 1000, // Set the animation duration (in milliseconds)
                easing: 'easeInOutElastic', // Set the easing function
            } as AnimationSpec<'line'>,
        },
        plugins: {
            zoom: {
                zoom: {
                    wheel: {
                        enabled: true,
                    },
                    pinch: {
                        enabled: true,
                    },
                    mode: 'xy',
                },
                pan: {
                    enabled: true,
                    mode: 'xy',
                },
            },
        },
    } as any;

    return chartConfig
}