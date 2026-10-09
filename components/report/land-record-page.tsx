import { useId } from 'react'
import { PAGE, SIGNATURE_BOX, STAMP_BOX, VALUE_X, fields } from '@/lib/report-data'

const GRAIN = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.35  0 0 0 0 0.28  0 0 0 0 0.18  0 0 0 0.22 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`

const INK = '#2b2a31'

export function LandRecordPage() {
  const ringId = useId()

  return (
    <div
      className="relative overflow-hidden bg-[#f3eee0] font-serif"
      style={{ width: PAGE.width, height: PAGE.height, color: INK }}
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ backgroundImage: GRAIN, backgroundSize: '220px 220px' }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 40%, transparent 60%, rgba(120,95,50,0.12) 100%)',
        }}
      />

      <div className="absolute inset-x-10 top-6 text-center">
        <p className="text-[10px] tracking-[0.22em] uppercase">
          Revenue &amp; Land Records Department
        </p>
        <p className="mt-2 text-[21px] font-bold tracking-wide">RECORD OF RIGHTS — EXTRACT</p>
        <p className="mt-1 text-[10px] italic">
          Village Form VII-XII · Issued under the Land Revenue Code
        </p>
      </div>
      <div aria-hidden className="absolute inset-x-10 top-[98px] h-[3px] border-y" style={{ borderColor: INK }} />

      <div className="absolute inset-x-10 top-[110px] flex justify-between font-mono text-[10.5px]">
        <span>Ref. No. LR/HVL/2026/118832</span>
        <span>Issued: 14 Mar 2026</span>
      </div>

      <p className="absolute top-[146px] left-10 text-[10.5px] font-bold tracking-[0.18em]">
        PARTICULARS OF LAND
      </p>
      <div aria-hidden className="absolute inset-x-10 top-[175px] h-px" style={{ background: INK, opacity: 0.7 }} />

      {fields.map((field) => {
        const rowTop = field.box.y - 8
        const isArea = field.id === 'area'
        return (
          <div key={field.id}>
            <p
              className="absolute left-10 text-[12px]"
              style={{ top: rowTop, lineHeight: '44px', width: VALUE_X - 50 }}
            >
              {field.label}
            </p>
            <div
              aria-hidden
              className="absolute inset-x-10 h-px"
              style={{ top: rowTop + 44, background: INK, opacity: 0.25 }}
            />
            <div
              className="absolute font-mono text-[15px] whitespace-nowrap"
              style={{
                left: field.box.x,
                top: field.box.y,
                width: field.box.w,
                height: field.box.h,
                lineHeight: `${field.box.h}px`,
                paddingInline: 6,
              }}
            >
              {isArea ? (
                <>
                  <span
                    aria-hidden
                    className="absolute -inset-x-0.5 inset-y-0.5"
                    style={{ background: '#f8f5ea', boxShadow: '0 0 0 1px rgba(255,255,255,0.5)' }}
                  />
                  <span
                    className="relative font-medium"
                    style={{ color: '#111', top: 2 }}
                  >
                    {field.extracted}
                  </span>
                </>
              ) : (
                field.extracted
              )}
            </div>
          </div>
        )
      })}

      <div className="absolute inset-x-10 top-[590px]">
        <p className="text-[10.5px] font-bold tracking-[0.18em]">REMARKS</p>
        <p className="mt-2 text-[11px] leading-[17px]">
          Entry certified from the village record on the basis of mutation entry No. 4471. Any change
          in the particulars above must be effected through a fresh mutation entry, duly certified by
          the Circle Officer.
        </p>
      </div>

      <div aria-hidden className="absolute inset-x-10 top-[664px] h-px" style={{ background: INK, opacity: 0.4 }} />

      <div
        className="absolute"
        style={{ left: SIGNATURE_BOX.x, top: SIGNATURE_BOX.y, width: SIGNATURE_BOX.w, height: SIGNATURE_BOX.h }}
      >
        <svg width="176" height="48" viewBox="0 0 176 48" fill="none" aria-hidden>
          <path
            d="M6 34 C 14 6, 26 6, 24 30 S 40 42, 50 18 S 70 8, 66 32 C 82 14, 96 28, 112 24 S 140 20, 170 22"
            stroke="#1d2a58"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.9"
          />
          <path d="M60 40 C 90 36, 120 38, 150 35" stroke="#1d2a58" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
        </svg>
        <p className="mt-1 text-[10px] italic">Talathi, Kharadi Saja</p>
        <p className="text-[9px] opacity-70">(Village Accountant)</p>
      </div>

      <div
        className="absolute"
        style={{
          left: STAMP_BOX.x,
          top: STAMP_BOX.y,
          width: STAMP_BOX.w,
          height: STAMP_BOX.h,
          background: '#f8f5ea',
        }}
      >
        <svg width={STAMP_BOX.w} height={STAMP_BOX.h} viewBox="0 0 168 138" fill="none" aria-hidden>
          <defs>
            <path id={ringId} d="M 84,69 m -40,0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0" />
          </defs>
          <circle cx="88" cy="72" r="56" stroke="#3646a0" strokeWidth="1.6" opacity="0.3" />
          <circle cx="84" cy="69" r="56" stroke="#2d3f9a" strokeWidth="2.4" opacity="0.85" />
          <circle cx="84" cy="69" r="50" stroke="#2d3f9a" strokeWidth="0.8" opacity="0.8" />
          <circle cx="84" cy="69" r="26" stroke="#2d3f9a" strokeWidth="0.8" opacity="0.8" />
          <text fontSize="8" fill="#2d3f9a" letterSpacing="1.8" opacity="0.9" fontFamily="serif">
            <textPath href={`#${ringId}`} startOffset="0">
              REVENUE OFFICE · HAVELI · PUNE ·
            </textPath>
          </text>
          <text x="84" y="66" textAnchor="middle" fontSize="8" fill="#2d3f9a" fontFamily="serif" fontWeight="bold">
            TALATHI
          </text>
          <text x="84" y="77" textAnchor="middle" fontSize="8" fill="#2d3f9a" fontFamily="serif" fontWeight="bold">
            SEAL
          </text>
        </svg>
      </div>

      <p className="absolute bottom-3 left-10 font-mono text-[9px] opacity-70">
        Computer generated extract · Page 1 of 1
      </p>
    </div>
  )
}
