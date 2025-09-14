import React, { useEffect, useRef, useState } from 'react';
import { SearchIcon } from './Icons';

// 動態載入 Google Maps Script 的輔助函式
const loadGoogleMapsScript = (apiKey, callback) => {
  const existingScript = document.getElementById('googleMapsApi');
  if (!existingScript) {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.id = 'googleMapsApi';
    
    // 加入 async 和 defer 屬性以優化效能
    script.async = true;
    script.defer = true;

    document.body.appendChild(script);
    script.onload = () => {
      if (callback) callback();
    };
  }
  if (existingScript && callback) callback();
};

export default function LocationSearchInput({ value, onChange, onPlaceSelected }) {
  const inputRef = useRef(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(window.google ? true : false);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey) {
      console.error("Google Maps API Key 未設定！請檢查您的 .env 檔案。");
      return;
    }
    loadGoogleMapsScript(apiKey, () => {
      setIsScriptLoaded(true);
    });
  }, [apiKey]);

  useEffect(() => {
    if (isScriptLoaded && inputRef.current && window.google) {
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['establishment', 'geocode'],
        componentRestrictions: { country: 'tw' }, // 優先顯示台灣的結果
        fields: ['name', 'formatted_address', 'geometry.location']
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          onPlaceSelected({
            name: place.name,
            address: place.formatted_address,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          });
        }
      });
    }
  }, [isScriptLoaded, onPlaceSelected]);

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <SearchIcon className="w-5 h-5 text-gray-400" />
      </div>
      <input
        ref={inputRef}
        id="location"
        type="text"
        value={value}
        onChange={onChange}
        className="w-full p-3 pl-10 border border-gray-300 rounded-lg text-base"
        placeholder="輸入地址或地點名稱進行搜尋..."
        autoComplete="off"
        disabled={!isScriptLoaded}
      />
    </div>
  );
}

