import React, {useEffect, useState, useRef} from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import {CustomMarker} from "./CustomMarker";

function LocationMarker() {
  const [position, setPosition] = useState(null);
  const map = useMap();

  useEffect(() => {
    map.locate().on("locationfound", function (e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    });
  }, [map]);

  return position === null ? null : (
    <Marker position={position}>
      <Popup>You are here</Popup>
    </Marker>
  );
}

export function App() {
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const { transcript, resetTranscript } = useSpeechRecognition();
  const synth = useRef(window.speechSynthesis);
  // const [hospitalLocations, setHospitalLocations] = useState([
  //   [51.505, -0.09],
  //   [51.51, -0.1],
  // ]);

  useEffect(() => {
    if (transcript) {
      setChatInput(transcript);
    }
  }, [transcript]);

  const handleChatSubmit = () => {
    if (chatInput.trim() === "") return;

    axios.post('http://localhost:5000/api/chat', { message: chatInput })
      .then(response => {
        const newChat = { user: chatInput, model: response.data.response };
        setChatHistory([...chatHistory, newChat]);
        setChatInput("");
        resetTranscript();
      })
      .catch(error => {
        console.error('There was an error!', error);
      });
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    if (!isListening) {
      SpeechRecognition.startListening({ continuous: true });
    } else {
      SpeechRecognition.stopListening();
    }
  };

  const speakResponse = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    synth.current.speak(utterance);
  };

  const exportChat = () => {
    let chatText = "";
    chatHistory.forEach((chat, index) => {
      chatText += `User: ${chat.user}\n`;
      chatText += `Model: ${chat.model}\n\n`;
    });

    const blob = new Blob([chatText], { type: "text/plain;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = "chat_history.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="app-container">
      <div className="navbar">
        <h2>Chat</h2>
        <div className="chat-history-container">
          <div className="chat-history">
            {chatHistory.map((chat, index) => (
              <div key={index} >
                <div className={`chat-message user-message`}>
                  {chat.user}
                </div>
                <div className={`chat-message model-message`}>
                  {chat.model}
                  <button className="speak-button" onClick={() => speakResponse(chat.model)}>
                    🔊
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <textarea
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Type your message here..."
        />
        <div className="button-container">
          <button onClick={toggleListening}>
            {isListening ? 'Stop Listening' : 'Start Listening'}
          </button>
          <button onClick={handleChatSubmit}>Send</button>
          <button onClick={exportChat}>Export Chat</button>
        </div>
      </div>
      <div className="map-container">
        <MapContainer
          center={[51.505, -0.09]}
          zoom={13}
          style={{ height: '100vh', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker />
          {/*{hospitalLocations.map((position, index) => (*/}
          {/*  <CustomMarker key={index} position={position} />*/}
          {/*))}*/}
        </MapContainer>
      </div>
    </div>
  );
}