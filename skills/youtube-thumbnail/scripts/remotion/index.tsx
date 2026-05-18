import { registerRoot } from 'remotion';
import { Composition } from 'remotion';
import { YTThumbnail, ComparisonGrid } from './YTThumbnail';
import type { YTThumbnailProps, ComparisonGridProps } from './YTThumbnail';

export const RemotionRoot: React.FC = () => {
 return (
 <>
 <Composition
 id="YTThumbnail"
 component={YTThumbnail}
 durationInFrames={1}
 fps={1}
 width={1920}
 height={1080}
 defaultProps={{
 backgroundSrc: 'bg.png',
 hookText: 'BASICALLY\nCHEATING',
 accentColor: '#FF6B35',
 textSide: 'left' as const,
 vignette: true,
 accentGlow: true,
 } satisfies YTThumbnailProps}
 />
 <Composition
 id="ComparisonGrid"
 component={ComparisonGrid}
 durationInFrames={1}
 fps={1}
 width={1920}
 height={1080}
 defaultProps={{
 thumbnails: ['a.png', 'b.png', 'c.png', 'd.png'],
 labels: ['A', 'B', 'C', 'D'],
 } satisfies ComparisonGridProps}
 />
 </>
 );
};

registerRoot(RemotionRoot);
