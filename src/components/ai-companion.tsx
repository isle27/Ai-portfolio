import { useId } from 'react';

/** Articulates the supplied artwork itself, preserving the reference's exact design. */
export function AiCompanion() {
  const id = useId().replace(/:/g, '');
  const url = (part: string) => `url(#${id}-${part})`;
  const artwork = (
    <image href="/images/robot-reference.jpg" width="657" height="360" />
  );
  return (
    <svg
      className="ai-companion"
      viewBox="260 0 260 350"
      fill="none"
      role="img"
      aria-label="Baby-pink AI companion waving, turning its head, and looking up"
    >
      <defs>
        <filter id={`${id}-pink`} colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            result="tinted"
            values="0 0 1 0 0  .15 .55 .3 0 0  0 .65 .35 0 0  -100 -100 -100 0 297"
          />
          <feComposite in="tinted" in2="SourceAlpha" operator="in" />
        </filter>
        <clipPath id={`${id}-head`}>
          <path d="M318 99 324 64 324 58C307 57 315 35 328 38 343 40 338 58 330 59L331 77Q350 51 399 49L401 37C387 33 392 14 405 15 419 16 419 32 409 37L408 49Q449 49 472 69L478 55C467 49 475 32 485 34 500 36 498 53 485 56L482 100Q508 104 502 140L497 158Q494 174 479 177C466 195 438 199 398 198 348 199 324 188 318 170Q302 158 312 119Z" />
        </clipPath>
        <clipPath id={`${id}-body`}>
          <path d="M380 195H424V209Q445 209 452 217L442 273Q437 295 429 301L439 304Q429 325 407 326L381 322Q369 316 364 304L371 299Q348 286 345 261L339 211Q355 205 380 205Z" />
        </clipPath>
        <clipPath id={`${id}-wave`}>
          <path d="M345 210Q332 208 325 226L319 207 316 197 325 190Q332 184 326 181 322 179 315 185L312 182 311 168Q310 157 305 159 299 160 302 177L299 178 297 165Q295 157 290 160 286 163 292 179L289 181 285 171Q280 165 276 169 273 173 281 185L281 188 277 181Q272 174 269 179 267 183 276 195L282 209Q283 239 295 252 306 265 322 255L346 242Z" />
        </clipPath>
        <clipPath id={`${id}-rest`}>
          <path d="M453 211Q469 207 479 225L488 241Q499 250 494 266L481 300 480 311 472 324Q467 332 462 330L453 326 446 318 451 307 459 301 460 290 463 266Q461 257 466 247L453 235Q446 228 453 211Z" />
        </clipPath>
      </defs>
      <ellipse
        className="bot-shadow"
        cx="400"
        cy="339"
        rx="49"
        ry="7"
        fill="#ad8c98"
        opacity=".15"
      />
      <g filter={url('pink')} className="bot-idle">
        <g clipPath={url('body')}>{artwork}</g>
        <g className="bot-rest-arm">
          <g clipPath={url('rest')}>{artwork}</g>
        </g>
        <g className="bot-wave">
          <g clipPath={url('wave')}>{artwork}</g>
        </g>
        <g className="bot-head">
          <g clipPath={url('head')}>{artwork}</g>
        </g>
      </g>
    </svg>
  );
}
