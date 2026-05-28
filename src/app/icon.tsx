import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size    = { width: 32,  height: 32  };
export const contentType = 'image/png';

export default function Icon() {
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
          borderRadius:   '7px',
          position:       'relative',
          overflow:       'hidden',
        }}
      >
        {/* Tonal edge overlay */}
        <div
          style={{
            position:   'absolute',
            inset:       0,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0.14) 100%)',
            borderRadius: '7px',
          }}
        />
        {/* 叡 — wisdom / sagacity — 16 strokes, N1 */}
        <span
          style={{
            fontFamily:  'serif',
            fontSize:    '21px',
            fontWeight:  700,
            color:       'rgba(255,255,255,0.95)',
            lineHeight:  1,
            marginTop:   '1px',
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
