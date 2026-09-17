import { ImageResponse } from 'next/og';

export const alt = 'Armelis security intelligence';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px',
        color: '#f8fbff',
        background: '#040711',
        fontFamily: 'Arial'
      }}
    >
      <div style={{ display: 'flex', color: '#00e5ff', fontSize: 28, letterSpacing: 7 }}>
        SECURITY INTELLIGENCE
      </div>
      <div style={{ display: 'flex', fontSize: 94, fontWeight: 800, letterSpacing: -4, marginTop: 24 }}>
        ARME<span style={{ color: '#00e5ff' }}>[LIS]</span>
      </div>
      <div style={{ display: 'flex', color: '#8ba2bb', fontSize: 30, marginTop: 28 }}>
        See every hop from entry point to crown jewel. Break the chain.
      </div>
      <div style={{ display: 'flex', position: 'absolute', right: 90, bottom: 80, color: '#00e5ff', fontSize: 28 }}>
        ANALYZE / MAP / SECURE
      </div>
    </div>,
    { ...size }
  );
}
