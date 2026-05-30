export default function PhotoBoothSVG() {
  return (
    <svg viewBox="0 0 220 340" width="260" height="403" xmlns="http://www.w3.org/2000/svg" aria-label="Vintage photo booth illustration">
      <rect x="20" y="40" width="180" height="280" rx="6" fill="#5C4C3E" />
      <rect x="26" y="46" width="168" height="268" rx="4" fill="#4A3D31" />

      <rect x="10" y="28" width="200" height="22" rx="4" fill="#A9855F" />
      <rect x="16" y="28" width="188" height="4" rx="2" fill="#DCC39E" />

      <rect x="40" y="56" width="140" height="30" rx="3" fill="#FAF6EF" />
      <text x="115" y="75" textAnchor="middle" fontSize="10" fontFamily="serif" fill="#2C2620" fontWeight="600" letterSpacing="1.4">PHOTOBOOTH ❤️</text>

      <rect x="40" y="94" width="140" height="100" rx="4" fill="#252018" />
      <circle cx="110" cy="144" r="30" fill="#3D3830" />
      <circle cx="110" cy="144" r="24" fill="#252018" />
      <circle cx="110" cy="144" r="18" fill="#3D3830" />
      <circle cx="110" cy="144" r="12" fill="#252018" />
      <circle cx="110" cy="144" r="7" fill="#14110E" />
      <circle cx="104" cy="138" r="2.5" fill="#8B7A6A" opacity="0.85" />

      <rect x="148" y="104" width="20" height="14" rx="3" fill="#8B7A6A" />
      <rect x="150" y="106" width="16" height="10" rx="2" fill="#EDE8D8" />
      <rect x="148" y="104" width="20" height="14" rx="3" fill="white" className="booth-flash" />

      <rect x="40" y="204" width="140" height="96" rx="4" fill="#9A7F63" />

      <g style={{ overflow: 'hidden', clipPath: 'inset(0 50% 0 0)' }}>
        <rect x="40" y="204" width="70" height="96" fill="#B79C7E" className="curtain-left" style={{ transformOrigin: 'left center' }} />
        {[0,1,2,3].map(i => (
          <rect key={i} x={40 + i * 17} y="204" width="4" height="96" fill="#8F6F4E" opacity="0.52" className="curtain-left" style={{ transformOrigin: 'left center' }} />
        ))}
      </g>

      <g style={{ overflow: 'hidden', clipPath: 'inset(0 0 0 50%)' }}>
        <rect x="110" y="204" width="70" height="96" fill="#B79C7E" className="curtain-right" style={{ transformOrigin: 'right center' }} />
        {[0,1,2,3].map(i => (
          <rect key={i} x={110 + i * 17 + 13} y="204" width="4" height="96" fill="#8F6F4E" opacity="0.52" className="curtain-right" style={{ transformOrigin: 'right center' }} />
        ))}
      </g>

      <rect x="38" y="202" width="144" height="5" rx="2" fill="#A9855F" />
      <circle cx="38" cy="204" r="4" fill="#9C7B56" />
      <circle cx="182" cy="204" r="4" fill="#9C7B56" />

      <rect x="26" y="206" width="10" height="60" rx="2" fill="#4A3D31" />
      <circle cx="31" cy="220" r="3" fill="#8B7355" />
      <circle cx="31" cy="232" r="3" fill="#6B5A4A" />
      <rect x="27" y="245" width="8" height="14" rx="1" fill="#8B7355" />

      <rect x="95" y="308" width="30" height="6" rx="1" fill="#5C4C3E" />
      <rect x="108" y="308" width="4" height="6" rx="1" fill="#A9855F" />

      {[-60,-30,0,30,60].map((dx, i) => (
        <text key={i} x={110+dx} y="42" textAnchor="middle" fontSize="7" fill="#F0E6D4" opacity="0.85">✦</text>
      ))}

      <text x="110" y="296" textAnchor="middle" fontSize="6.5" fontFamily="serif" fill="#DCC39E" letterSpacing="1.5">With Love</text>
    </svg>
    
  );
}
