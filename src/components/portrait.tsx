import Image from 'next/image';
import { AiCompanion } from './ai-companion';

export function Portrait() {
  return (
    <figure className="portrait-composition hero-portrait">
      <div className="portrait-frame">
        <Image
          src="/images/elsa-portrait.jpg"
          alt="Elsa Wubie, AI engineer"
          width={1170}
          height={1462}
          priority
          sizes="(max-width: 600px) 82vw, (max-width: 1100px) 42vw, 430px"
        />
      </div>
      <div className="portrait-companion">
        <AiCompanion />
        <span>A little AI. A lot of possibility.</span>
      </div>
      <figcaption>
        ELSA WUBIE <span>/ THE HUMAN BEHIND THE AI</span>
      </figcaption>
    </figure>
  );
}
