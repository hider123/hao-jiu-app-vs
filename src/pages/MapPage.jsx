import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useDatabase } from '../contexts/DatabaseContext';
import { useNavigate } from 'react-router-dom';

// --- 1. 將我們的美化樣式直接定義在這裡 ---
const customPopupStyles = `
  .leaflet-popup-content-wrapper {
    background-color: #ffffff;
    border-radius: 12px !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  .leaflet-popup-content {
    margin: 1rem !important;
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  }
  .leaflet-popup-tip {
      background: #ffffff !important;
      box-shadow: none !important;
  }
`;

export default function MapPage() {
  const { events, loading } = useDatabase();
  const navigate = useNavigate();

  const eventsWithCoords = events.filter(event => 
    event.eventType === 'in-person' && event.lat && event.lng
  );

  const position = [22.62, 120.3];
  const zoomLevel = 13;

  if (loading) {
    return <div className="p-8 text-center">正在載入地圖與活動資料...</div>;
  }

  return (
    // MapContainer 需要設定一個具體的高度才能顯示
    <div style={{ height: 'calc(100vh - 4rem)', width: '100%' }}>
      {/* --- 2. 在元件中插入 <style> 標籤 --- */}
      <style>{customPopupStyles}</style>

      <MapContainer center={position} zoom={zoomLevel} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {eventsWithCoords.map(event => (
          <Marker key={event.id} position={[event.lat, event.lng]}>
            <Popup>
              <div className="font-sans">
                <h3 className="font-bold">{event.title}</h3>
                <p>{event.location}</p>
                <button 
                  onClick={() => navigate(`/event/${event.id}`)}
                  className="mt-2 w-full text-center text-blue-600 font-semibold hover:underline"
                >
                  查看詳情
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

