import { Marker } from 'react-map-gl/maplibre';
import type { Customer } from '../types';

interface Props {
  customer: Customer;
  isSelected: boolean;
  orderIndex?: number; // position in current route
  onClick: () => void;
}

export default function CustomerMarker({ customer, isSelected, orderIndex, onClick }: Props) {
  const bg = isSelected ? '#FF6B35' : '#1e293b';
  const border = isSelected ? '#FF6B35' : '#64748b';
  const twIcon = customer.timeWindow === 'morning' ? '\u{1F305}' :
                 customer.timeWindow === 'afternoon' ? '\u{1F319}' : '';
  const rushIcon = customer.isRushOrder ? '\u{1F198}' : '';
  const label = orderIndex !== undefined ? `${orderIndex + 1}` : customer.id;

  return (
    <Marker
      longitude={customer.lon}
      latitude={customer.lat}
      anchor="center"
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClick();
      }}
    >
      <div
        style={{
          background: bg,
          border: `2px solid ${border}`,
          borderRadius: '50%',
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#e2e8f0',
          fontFamily: 'monospace',
          fontWeight: 700,
          fontSize: 14,
          position: 'relative',
          cursor: 'pointer',
        }}
      >
        {label}
        {(twIcon || rushIcon) && (
          <span style={{ position: 'absolute', top: -10, right: -10, fontSize: 16 }}>
            {twIcon}{rushIcon}
          </span>
        )}
      </div>
    </Marker>
  );
}
