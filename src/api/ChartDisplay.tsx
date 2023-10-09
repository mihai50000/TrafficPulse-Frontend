import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Chart, registerables} from 'chart.js';
import './chart.css';
import './spinner.css';
import './settings.css';
import {IconButton} from '@mui/material';
import {Settings} from '@mui/icons-material';
import {parseISO} from 'date-fns';
import {createChartConfig} from "./chartConfig";
import AppSettings from "./settings";
import {defaultFilters} from "./domain/Filters";
import PacketWindow from "./domain/PacketWindow";


const MAX_RETRIES = 3;

const ChartComponent: React.FC = () => {
    const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
    const [chart, setChart] = useState<Chart | null>(null);
    const chartRef = useRef<HTMLCanvasElement | null>(null);
    const [data, setData] = useState<PacketWindow[]>([]);
    const [retryCount, setRetryCount] = useState(0);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const socketRef = useRef<WebSocket | null>(null);


    const connectWebSocket = useCallback(() => {
        const socket = new WebSocket('ws://localhost:8080/data/ws');
        socketRef.current = socket;

        socket.onopen = () => {
            console.log('WebSocket connection opened');
            setData([])
            setIsWebSocketConnected(true);
            setRetryCount(0)
        };

        socket.onmessage = (event) => {
            const newData: PacketWindow = JSON.parse(event.data);
            console.log('Received data:');
            console.log('Size:', newData.Size);
            console.log('Start:', newData.Start);
            console.log('End:', newData.End);
            console.log(event.data)
            setData((prevData) => [...prevData, newData]);
        };

        socket.onclose = (event) => {
            console.log('WebSocket connection closed');
            setIsWebSocketConnected(false);
            setData([])
            setChart(null)

            if (retryCount < MAX_RETRIES) {
                setTimeout(connectWebSocket, 3000);
                setRetryCount((prevRetryCount) => prevRetryCount + 1);
            }
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };


        return () => {
            socket.close()
            setData([])
        };
    }, [retryCount])

    useEffect(() => {
        connectWebSocket();
    }, []);

    useEffect(() => {
        if (data.length === 0) return;

        if (chartRef.current) {
            const ctx = chartRef.current.getContext('2d');

            if (ctx) {
                Chart.register(...registerables);

                if (chart == null) {
                    console.log("Here")
                    const chartConfig = createChartConfig(data);
                    const newChart = new Chart(ctx, chartConfig);
                    setChart(newChart);
                } else {
                    chart.data.labels = data.map((entry) => entry.Start);
                    chart.data.datasets[0].data = data.map((entry) => ({
                        x: parseISO(entry.Start).getTime(),
                        y: entry.Size,
                    }));
                    chart.update();
                }
            }
        }
    }, [data, chart]);

    function handleSettingsClick() {
        setIsFiltersOpen(!isFiltersOpen)
    }

    return (
        <div className="chart-container">
            {isWebSocketConnected && (
                <>
                    <div className="settings-button">
                        <IconButton color="inherit" className="settings-icon" onClick={handleSettingsClick}>
                            <Settings/>
                        </IconButton>
                    </div>
                    {isFiltersOpen && (
                        <AppSettings socket={socketRef.current} setData={setData}/>
                    )}
                </>
            )}

            {!isWebSocketConnected && retryCount >= MAX_RETRIES ? (
                <div className="retry-message">WebSocket reconnection failed.</div>
            ) : (
                isWebSocketConnected ? (
                    <canvas ref={chartRef}/>
                ) : (
                    <div className="loading-animation">
                        <div className="loading-spinner"></div>
                        <div className="loading-text">Reconnecting</div>
                    </div>
                )
            )}
        </div>
    );

}

export default ChartComponent