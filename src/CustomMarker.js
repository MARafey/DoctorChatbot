import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHSquare } from '@fortawesome/free-solid-svg-icons';
import {Marker, Popup} from "react-leaflet";

export function CustomMarker({ position }) {
  return (
    <Marker position={position}>
      <Popup>
        <FontAwesomeIcon icon={faHSquare} /> Hospital nearby
      </Popup>
    </Marker>
  );
}