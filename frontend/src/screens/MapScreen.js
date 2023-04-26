import axios from 'axios';
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  LoadScript,
  GoogleMap,
  StandaloneSearchBox,
  Marker,
} from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import { Store } from '../Store';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';
const defaultLocation = { lat: 45.516, lng: -73.56 };
const libs = ['places'];

/*
 * MapScreen component for displaying Google Maps
 * and selecting location for shipping address
 */
export default function MapScreen() {
  // Using context to access state and dispatch functions
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;

  // Using useNavigate hook for navigation and useState hook for state management
  const navigate = useNavigate();
  const [googleApiKey, setGoogleApiKey] = useState('');
  const [center, setCenter] = useState(defaultLocation);
  const [location, setLocation] = useState(center);

  // Using useRef hook for accessing DOM elements
  const mapRef = useRef(null);
  const placeRef = useRef(null);
  const markerRef = useRef(null);

  // Function to get current user location
  const getUserCurrentLocation = () => {
    // Checking if geolocation is supported by the browser
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser');
    } else {
      // Retrieving user's current position
      navigator.geolocation.getCurrentPosition((position) => {
        // Updating state variables for center and location
        setCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });
    }
  };

  // Fetching Google API key and setting current location on component mount
  useEffect(() => {
    const fetch = async () => {
      // Retrieving Google API key using authentication token
      const { data } = await axios('http://localhost:4000/api/keys/google', {
        headers: { Authorization: `BEARER ${userInfo.token}` },
      });
      // Setting Google API key and user's current location
      setGoogleApiKey(data.key);
      getUserCurrentLocation();
    };

    fetch();
    // Dispatching action to update global state for setting full box on
    ctxDispatch({
      type: 'SET_FULLBOX_ON',
    });
  }, [ctxDispatch]);

  // Event handlers for Google Maps and Places API
  const onLoad = (map) => {
    // Updating map reference
    mapRef.current = map;
  };
  const onIdle = () => {
    // Updating location state variable based on map center
    setLocation({
      lat: mapRef.current.center.lat(),
      lng: mapRef.current.center.lng(),
    });
  };
  const onLoadPlaces = (place) => {
    // Updating place reference
    placeRef.current = place;
  };
  const onPlacesChanged = () => {
    // Updating center and location state variables based on selected place
    const place = placeRef.current.getPlaces()[0].geometry.location;
    setCenter({ lat: place.lat(), lng: place.lng() });
    setLocation({ lat: place.lat(), lng: place.lng() });
  };
  const onMarkerLoad = (marker) => {
    // Updating marker reference
    markerRef.current = marker;
  };
  const onConfirm = () => {
    // Retrieving selected place details and dispatching action to update global state for saving shipping address
    const places = placeRef.current.getPlaces() || [{}];
    ctxDispatch({
      type: 'SAVE_SHIPPING_ADDRESS_MAP_LOCATION',
      payload: {
        lat: location.lat,
        lng: location.lng,
        address: places[0].formatted_address,
        name: places[0].name,
        vicinity: places[0].vicinity,
        googleAddressId: places[0].id,
      },
    });
    // Displaying success message and navigating to shipping page
    toast.success('Location selected successfully.');
    navigate('/shipping');
  };

  return (
    <div className="full-box">
      <LoadScript libraries={libs} googleMapsApiKey={googleApiKey}>
        <GoogleMap
          id="smaple-map"
          mapContainerStyle={{ height: '100%', width: '100%' }}
          center={center}
          zoom={15}
          onLoad={onLoad}
          onIdle={onIdle}
        >
          <StandaloneSearchBox
            onLoad={onLoadPlaces}
            onPlacesChanged={onPlacesChanged}
          >
            <div className="map-input-box">
              <input type="text" placeholder="Enter your address"></input>
              <Button type="button" onClick={onConfirm}>
                Confirm
              </Button>
            </div>
          </StandaloneSearchBox>
          <Marker position={location} onLoad={onMarkerLoad}></Marker>
        </GoogleMap>
      </LoadScript>
    </div>
  );
}
