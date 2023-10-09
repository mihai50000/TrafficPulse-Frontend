import React, {useState} from 'react';
import './settings.css'
import Filters from "./domain/Filters";
import { formatISO, subMinutes } from 'date-fns';
import PacketWindow from "./domain/PacketWindow";

interface AppSettingsProps {
    socket : WebSocket | null
    setData: React.Dispatch<React.SetStateAction<PacketWindow[]>>;
}

const AppSettings: React.FC<AppSettingsProps> = ({ socket , setData}) => {
    const fiveMinutesAgo = subMinutes(new Date(), 5);
    const defaultStartDateString = formatISO(fiveMinutesAgo, { representation: 'complete' });
    const defaultEndDateString = formatISO(new Date(), { representation: 'complete' });

    const [startDateString, setStartDateString] = useState<string>(defaultStartDateString);
    const [isLiveWindow, setIsLiveWindow] = useState(true);
    const [endDateString, setEndDateString] = useState(defaultEndDateString);
    const [protocols, setProtocols] = useState<string[]>([]);
    const [newProtocol, setNewProtocol] = useState('');
    const [sources, setSources] = useState<string[]>([]);
    const [newSource, setNewSource] = useState('');
    const [destinations, setDestinations] = useState<string[]>([]);
    const [newDestination, setNewDestination] = useState('');

    console.log("Render with: \nprotocols: " + protocols)

    const handleNewProtocolChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNewProtocol(event.target.value);
    };

    const handleNewSourceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNewSource(event.target.value);
    };

    const handleNewDestinationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNewDestination(event.target.value);
    };

    const handleAddProtocol = () => {
        if (newProtocol.trim() !== '') {
            console.log("Set new protocol: " + newProtocol)

            setProtocols((prevProtocols) => [...prevProtocols, newProtocol]);
            console.log("protocols: " + protocols)
            setNewProtocol('');
        }
    };

    const handleAddSource = () => {
        if (newSource.trim() !== '') {
            console.log("Set new source: " + newSource)

            setSources((prevSources) => [...prevSources, newSource]);
            console.log("sources: " + sources)
            setNewSource('');
        }
    };

    const handleAddDestination = () => {
        if (newDestination.trim() !== '') {
            console.log("Set new destination: " + newDestination)

            setDestinations((prevDestinations) => [...prevDestinations, newDestination]);
            console.log("destinations: " + destinations)
            setNewDestination('');
        }
    };

    const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setStartDateString(event.target.value);
    };

    const handleIsLiveWindowChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsLiveWindow(event.target.checked);
    };

    const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEndDateString(event.target.value);
    };

    const handleRemoveProtocol = (index: number) => {
        const updatedProtocols = protocols.filter((_, i) => i !== index);
        setProtocols(updatedProtocols);
    };

    const handleRemoveSrc = (index: number) => {
        const updatedSources = sources.filter((_, i) => i !== index);
        setSources(updatedSources);
    };

    const handleRemoveDst = (index: number) => {
        const updatedDestinations = destinations.filter((_, i) => i !== index);
        setDestinations(updatedDestinations);
    };

    const handleSubmit = () => {
        if (socket) {
            const filters : Filters = {
                StartTime : startDateString,
                EndTime : isLiveWindow ? null : endDateString,
                SourceIps : sources,
                DestinationIps : destinations,
                Protocols : protocols
            }

            const message = JSON.stringify(filters);
            socket.send(message);
            setData([])
            console.log("New filters: " + message)
        }
    };

    return (
        <div className="app-settings-overlay">
            <div className="app-settings-container">
                <div className="settings-form">
                    <div className="set-dates-container">
                        <div>
                            <label htmlFor="startDate">Start Date:</label>
                            <input
                                type="datetime-local"
                                id="startDate"
                                value={startDateString}
                                onChange={handleStartDateChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="isLiveWindow">Live Window:</label>
                            <input
                                type="checkbox"
                                id="isLiveWindow"
                                checked={isLiveWindow}
                                onChange={handleIsLiveWindowChange}
                            />
                        </div>
                        {!isLiveWindow && (
                            <div>
                                <label htmlFor="endDate">End Date:</label>
                                <input
                                    type="datetime-local"
                                    id="endDate"
                                    value={endDateString}
                                    onChange={handleEndDateChange}
                                />
                            </div>
                        )}
                    </div>
                    <div className="lists-container">
                        <div className="protocols-container">
                            <ul className="settings-items-list">
                                {protocols.map((protocol, index) => (
                                    <li key={index} className="settings-item" onClick={() => handleRemoveProtocol(index)}>
                                        {protocol}
                                    </li>
                                ))}
                            </ul>
                            <div className="add-item">
                                <input
                                    type="text"
                                    value={newProtocol}
                                    onChange={handleNewProtocolChange}
                                    placeholder="Enter a protocol"
                                />
                                <button onClick={handleAddProtocol}>+</button>
                            </div>
                        </div>
                        <div className="allowed-src-container">
                            <ul className="settings-items-list">
                                {sources.map((source, index) => (
                                    <li key={index} className="settings-item" onClick={() => handleRemoveSrc(index)}>
                                        {source}
                                    </li>
                                ))}
                            </ul>
                            <div className="add-item">
                                <input
                                    type="text"
                                    value={newSource}
                                    onChange={handleNewSourceChange}
                                    placeholder="Enter a source ip"
                                />
                                <button onClick={handleAddSource}>+</button>
                            </div>
                        </div>
                        <div className="allowed-dst-container">
                            <ul className="settings-items-list">
                                {destinations.map((destination, index) => (
                                    <li key={index} className="settings-item" onClick={() => handleRemoveDst(index)}>
                                        {destination}
                                    </li>
                                ))}
                            </ul>
                            <div className="add-item">
                                <input
                                    type="text"
                                    value={newDestination}
                                    onChange={handleNewDestinationChange}
                                    placeholder="Enter a destination ip"
                                />
                                <button onClick={handleAddDestination}>+</button>
                            </div>
                        </div>
                    </div>
                    <button type="button" className="save-button" onClick={handleSubmit}>Save</button>
                    <p className="ps">Leave list empty if you don't want filters to be applied to that field</p>
                </div>
            </div>
        </div>
    );
};

export default AppSettings;