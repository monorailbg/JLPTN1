import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size    = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width:          '100%',
          height:         '100%',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          background:     'radial-gradient(circle at 40% 30%, #c94030 0%, #8c2218 100%)',
          borderRadius:   '38px',
          position:       'relative',
          overflow:       'hidden',
        }}
      >
        {/* Tonal layers for depth without glass */}
        <div
          style={{
            position:     'absolute',
            inset:        0,
            background:   'linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(0,0,0,0.18) 100%)',
            borderRadius: '38px',
          }}
        />
        {/* Fine highlight border */}
        <div
          style={{
            position:     'absolute',
            inset:        '2px',
            border:       '1.5px solid rgba(255,255,255,0.10)',
            borderRadius: '36px',
          }}
        />
        {/* 叡 — wisdom / sagacity */}
        <span
          style={{
            fontFamily:  'serif',
            fontSize:    '116px',
            fontWeight:  700,
            color:       'rgba(255,255,255,0.96)',
            lineHeight:  1,
            marginTop:   '6px',
            position:    'relative',
          }}
        >
          叡
        </span>
      </div>
    ),
    { ...size },
  );
}
