import React, { useEffect, useState } from 'react';

interface TimeWindow {
    startTime: number;
    endTime: number;
    packetSize: number;
}

const PacketsGraphic = () => {
    const [timeWindows, setTimeWindows] = useState<TimeWindow[]>([]);

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8080/ws'); // Replace with your WebSocket URL

        socket.onmessage = (event) => {
            console.log(event.data)

        };

        return () => {
            socket.close();
        };
    }, []);


    return (
        <div>
        </div>
    );
};

export default PacketsGraphic;