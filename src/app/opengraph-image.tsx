import { ImageResponse } from 'next/og';
export const alt = 'Elsa Wubie — AI Engineer. Intelligence, with intention.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        background: '#fbfaf7',
        color: '#393832',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '75px',
        justifyContent: 'space-between',
      }}
    >
      <div
        style={{
          display: 'flex',
          fontSize: 22,
          letterSpacing: 5,
          color: '#78604c',
        }}
      >
        ELSA WUBIE / AI ENGINEER
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          fontSize: 92,
          fontFamily: 'serif',
          fontWeight: 400,
          letterSpacing: -3,
          lineHeight: 1.1,
        }}
      >
        <span>Intelligence,</span>
        <span style={{ color: '#78604c', fontStyle: 'italic' }}>
          with intention.
        </span>
      </div>
      <div style={{ display: 'flex', fontSize: 24, color: '#77716a' }}>
        Thoughtful systems. Useful intelligence.
      </div>
    </div>,
    size,
  );
}
