import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { Customer } from '../types';

interface Props {
  customer: Customer;
  isSelected: boolean;
  orderIndex?: number; // position in current route
  onClick: () => void;
}

function getMarkerIcon(customer: Customer, isSelected: boolean, orderIndex?: number): L.DivIcon {
  const bg = isSelected ? '#FF6B35' : '#1e293b';
  const border = isSelected ? '#FF6B35' : '#64748b';
  const twIcon = customer.timeWindow === 'morning' ? '\u{1F305}' :
                 customer.timeWindow === 'afternoon' ? '\u{1F319}' : '';
  const rushIcon = customer.isRushOrder ? '\u{1F198}' : '';
  const label = orderIndex !== undefined ? `${orderIndex + 1}` : customer.id;

  return L.divIcon({
    className: '',
    html: `<div style="
      background:${bg}; border:2px solid ${border}; border-radius:50%;
      width:36px; height:36px; display:flex; align-items:center; justify-content:center;
      color:#e2e8f0; font-family:monospace; font-weight:700; font-size:14px;
      position:relative; cursor:pointer;
    ">${label}${twIcon || rushIcon ? `<span style="position:absolute;top:-8px;right:-8px;font-size:12px">${twIcon}${rushIcon}</span>` : ''}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

export default function CustomerMarker({ customer, isSelected, orderIndex, onClick }: Props) {
  return (
    <Marker
      position={[customer.lat, customer.lon]}
      icon={getMarkerIcon(customer, isSelected, orderIndex)}
      eventHandlers={{ click: onClick }}
    >
      <Popup>
        <div className="font-mono text-sm">
          <strong>{customer.id}: {customer.name}</strong>
          {customer.demand > 0 && <div>Demand: {customer.demand} units</div>}
          {customer.timeWindow !== 'none' && <div>TW: {customer.timeWindow}</div>}
        </div>
      </Popup>
    </Marker>
  );
}
