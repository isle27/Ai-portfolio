import Image from 'next/image';

export function ProjectArt({
  index = 0,
  image,
  title,
  fitToWidth = false,
}: {
  index?: number;
  image?: string;
  title?: string;
  fitToWidth?: boolean;
}) {
  if (image && /^(https:\/\/|data:image\/(?:webp|jpeg|png);base64,|\/(?![\\/]))/i.test(image)) {
    const alt = title ? title + ' cover' : 'Project cover';
    if (fitToWidth) {
      // Card images can come from uploads or URLs without width and height metadata.
      // eslint-disable-next-line @next/next/no-img-element
      return <img className="project-card-image" src={image} alt={alt} loading="lazy" decoding="async" />;
    }

    return (
      <div className="project-art">
        <Image src={image} alt={alt} fill unoptimized className="project-cover" />
      </div>
    );
  }
  const n = index % 4;
  const id = 'project-study-' + n;
  return (
    <div className={'project-art art-' + n} aria-hidden="true">
      <span className="art-code">
        {
          [
            'Atlas / Knowledge systems',
            'Signal / Evaluation',
            'Relay / Agent workflows',
            'Fieldnotes / Semantic space',
          ][n]
        }
      </span>
      <svg viewBox="0 0 600 360" fill="none">
        <defs>
          <linearGradient
            id={id + 'sheet'}
            x1="150"
            y1="100"
            x2="420"
            y2="290"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#faf8f4" />
            <stop offset="1" stopColor="var(--art-shade)" />
          </linearGradient>
        </defs>
        {n === 0 ? (
          <g transform="translate(0 -10)">
            {[0, 1, 2, 3].map((i) => (
              <g key={i} transform={'translate(0 ' + i * 30 + ')'}>
                <path
                  d="M160 125L300 55L440 125L300 195Z"
                  fill={'url(#' + id + 'sheet)'}
                  stroke="var(--art-line)"
                  strokeWidth=".8"
                />
                <path
                  d="M160 125V132L300 202L440 132V125M300 195V202"
                  stroke="var(--art-line)"
                  strokeWidth=".65"
                />
                <path
                  d="M225 125L300 88L375 125L300 163Z"
                  stroke="var(--art-line)"
                  strokeOpacity=".65"
                  strokeWidth=".65"
                />
              </g>
            ))}
          </g>
        ) : n === 1 ? (
          <>
            <path
              d="M105 90V275H495M105 215H495M105 155H495M105 95H495"
              stroke="var(--art-line)"
              strokeOpacity=".5"
              strokeWidth=".6"
            />
            <path
              d="M105 260C155 260 170 222 215 232S275 178 320 182S385 128 425 132S465 95 495 82V275H105Z"
              fill="var(--art-shade)"
              fillOpacity=".75"
            />
            <path
              d="M105 260C155 260 170 222 215 232S275 178 320 182S385 128 425 132S465 95 495 82"
              stroke="var(--art-ink)"
              strokeWidth="1.2"
            />
            <path
              d="M105 266C160 255 175 260 220 245S280 220 320 223S390 180 430 187S465 153 495 145"
              stroke="var(--art-ink)"
              strokeWidth=".8"
              strokeDasharray="3 6"
              strokeOpacity=".5"
            />
            <circle cx="425" cy="132" r="4" fill="var(--art-ink)" />
            <circle
              cx="425"
              cy="132"
              r="13"
              stroke="var(--art-ink)"
              strokeOpacity=".5"
              strokeWidth=".6"
            />
          </>
        ) : n === 2 ? (
          <>
            <path
              d="M150 180C150 100 300 100 300 180S450 260 450 180M150 180C150 260 300 260 300 180S450 100 450 180"
              stroke="var(--art-line)"
              strokeWidth=".9"
            />
            {[
              [150, 180],
              [300, 100],
              [300, 180],
              [300, 260],
              [450, 180],
            ].map(([x, y], i) => (
              <g key={i}>
                <circle
                  cx={x}
                  cy={y}
                  r={i === 2 ? 34 : 20}
                  fill={'url(#' + id + 'sheet)'}
                  stroke="var(--art-line)"
                  strokeWidth=".8"
                />
                <circle
                  cx={x}
                  cy={y}
                  r={i === 2 ? 5 : 2.5}
                  fill="var(--art-ink)"
                  opacity=".9"
                />
              </g>
            ))}
            <path
              d="M300 120V146M300 214V240"
              stroke="var(--art-line)"
              strokeWidth=".8"
            />
          </>
        ) : (
          <>
            {[
              [220, 135],
              [365, 175],
              [270, 250],
            ].map(([cx, cy], c) => (
              <g key={c}>
                <ellipse
                  cx={cx}
                  cy={cy}
                  rx="80"
                  ry="52"
                  stroke="var(--art-line)"
                  strokeWidth=".6"
                  strokeDasharray="2 5"
                />
                {Array.from({ length: 23 }, (_, i) => {
                  const a = i * 2.39996,
                    r = 8 * Math.sqrt(i);
                  return (
                    <circle
                      key={i}
                      cx={Number((cx + Math.cos(a) * r * 1.5).toFixed(3))}
                      cy={Number((cy + Math.sin(a) * r).toFixed(3))}
                      r={i % 7 === 0 ? 3 : 1.6}
                      fill="var(--art-ink)"
                      opacity={0.5 + (i % 4) * 0.13}
                    />
                  );
                })}
              </g>
            ))}
          </>
        )}
      </svg>
      <span className="art-index">System study</span>
    </div>
  );
}
