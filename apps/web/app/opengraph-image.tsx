import { ImageResponse } from 'next/og';

export const alt = 'CyberScan security intelligence';
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
        background: '#05070b',
        fontFamily: 'Arial'
      }}
    >
      <div style={{ display: 'flex', color: '#38bdf8', fontSize: 28, letterSpacing: 7 }}>
        SECURITY INTELLIGENCE
      </div>
      <div style={{ display: 'flex', fontSize: 94, fontWeight: 800, letterSpacing: -4, marginTop: 24 }}>
        CYBER<span style={{ color: '#1687ff' }}>SCAN</span>
      </div>
      <div style={{ display: 'flex', color: '#a9bdd7', fontSize: 30, marginTop: 28 }}>
        Map the attack paths. Find the real risks.
      </div>
      <div style={{ display: 'flex', position: 'absolute', right: 90, bottom: 80, color: '#1687ff', fontSize: 28 }}>
        ANALYZE / MAP / SECURE
      </div>
    </div>,
    { ...size }
  );
}
