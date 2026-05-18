import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';

/**
 * YouTube Thumbnail Composition — Remotion renderStill()
 *
 * Renders pixel-perfect text overlays on top of a Nano Banana-generated background.
 * Text, logos, and branding are handled here — NOT by the AI image generator.
 */

export interface YTThumbnailProps {
 /** Path to Nano Banana background image (in public/ or staticFile) */
 backgroundSrc: string;
 /** Hook text — max 3 words, uppercase recommended */
 hookText: string;
 /** Optional sub-text (smaller, accent color) */
 subText?: string;
 /** Accent color hex (e.g. "#FF6B35") */
 accentColor: string;
 /** Text position: left or right side */
 textSide: 'left' | 'right';
 /** Optional logo path */
 logoSrc?: string;
 /** Show vignette overlay */
 vignette?: boolean;
 /** Show gradient glow from accent color */
 accentGlow?: boolean;
 /** Font family override */
 fontFamily?: string;
}

export const YTThumbnail: React.FC<YTThumbnailProps> = ({
 backgroundSrc,
 hookText,
 subText,
 accentColor,
 textSide = 'left',
 logoSrc,
 vignette = true,
 accentGlow = true,
 fontFamily = 'Inter, Helvetica, Arial, sans-serif',
}) => {
 const isLeft = textSide === 'left';

 return (
 <AbsoluteFill style={{ backgroundColor: '#0A0B12' }}>
 {/* Layer 1: Nano Banana AI Background */}
 <Img
 src={backgroundSrc.startsWith('http') ? backgroundSrc : staticFile(backgroundSrc)}
 style={{
 width: '100%',
 height: '100%',
 objectFit: 'cover',
 }}
 />

 {/* Layer 2: Accent Glow (optional) */}
 {accentGlow && (
 <div
 style={{
 position: 'absolute',
 top: 0,
 left: 0,
 right: 0,
 bottom: 0,
 background: `radial-gradient(ellipse at ${isLeft ? '25% 40%' : '75% 40%'}, ${accentColor}30 0%, transparent 60%)`,
 }}
 />
 )}

 {/* Layer 3: Text Container */}
 <div
 style={{
 position: 'absolute',
 [isLeft ? 'left' : 'right']: 60,
 top: 60,
 maxWidth: '55%',
 display: 'flex',
 flexDirection: 'column',
 alignItems: isLeft ? 'flex-start' : 'flex-end',
 textAlign: isLeft ? 'left' : 'right',
 }}
 >
 {/* Hook Text — bold, large, stroke */}
 <div
 style={{
 fontSize: 96,
 fontWeight: 900,
 fontFamily,
 color: '#FFFFFF',
 lineHeight: 1.05,
 WebkitTextStroke: '3px rgba(0,0,0,0.9)',
 textShadow: `
 4px 4px 0 rgba(0,0,0,0.8),
 -2px -2px 0 rgba(0,0,0,0.4),
 0 0 40px ${accentColor}60
 `,
 letterSpacing: '-0.02em',
 textTransform: 'uppercase',
 }}
 >
 {hookText}
 </div>

 {/* Sub Text (optional) */}
 {subText && (
 <div
 style={{
 fontSize: 42,
 fontWeight: 700,
 fontFamily,
 color: accentColor,
 marginTop: 12,
 textShadow: '2px 2px 0 rgba(0,0,0,0.8)',
 letterSpacing: '0.02em',
 }}
 >
 {subText}
 </div>
 )}
 </div>

 {/* Layer 4: Logo (optional, top corner opposite to text) */}
 {logoSrc && (
 <Img
 src={logoSrc.startsWith('http') ? logoSrc : staticFile(logoSrc)}
 style={{
 position: 'absolute',
 top: 30,
 [isLeft ? 'right' : 'left']: 30,
 width: 80,
 height: 'auto',
 filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.6))',
 }}
 />
 )}

 {/* Layer 5: Vignette (optional) */}
 {vignette && (
 <div
 style={{
 position: 'absolute',
 top: 0,
 left: 0,
 right: 0,
 bottom: 0,
 background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)',
 pointerEvents: 'none',
 }}
 />
 )}

 {/* Safety: Bottom-right clear zone indicator (YouTube timestamp) */}
 {/* No elements placed here — YouTube covers ~120x30px bottom-right */}
 </AbsoluteFill>
 );
};

/**
 * Comparison Grid — 2x2 layout of 4 thumbnail variants
 * Also rendered via renderStill() — no PIL needed
 */
export interface ComparisonGridProps {
 thumbnails: string[]; // 4 image paths
 labels?: string[]; // ["A", "B", "C", "D"]
}

export const ComparisonGrid: React.FC<ComparisonGridProps> = ({
 thumbnails,
 labels = ['A', 'B', 'C', 'D'],
}) => {
 const gap = 8;
 const cellW = (1920 - gap) / 2;
 const cellH = (1080 - gap) / 2;

 return (
 <AbsoluteFill style={{ backgroundColor: '#141414' }}>
 {thumbnails.slice(0, 4).map((src, i) => {
 const col = i % 2;
 const row = Math.floor(i / 2);
 return (
 <div
 key={i}
 style={{
 position: 'absolute',
 left: col * (cellW + gap),
 top: row * (cellH + gap),
 width: cellW,
 height: cellH,
 }}
 >
 <Img
 src={src.startsWith('http') ? src : staticFile(src)}
 style={{ width: '100%', height: '100%', objectFit: 'cover' }}
 />
 {/* Label badge */}
 <div
 style={{
 position: 'absolute',
 top: 16,
 left: 16,
 backgroundColor: 'rgba(0,0,0,0.75)',
 color: '#FFFFFF',
 fontSize: 28,
 fontWeight: 800,
 fontFamily: 'Inter, Helvetica, sans-serif',
 padding: '8px 16px',
 borderRadius: 8,
 }}
 >
 {labels[i] || String.fromCharCode(65 + i)}
 </div>
 </div>
 );
 })}
 </AbsoluteFill>
 );
};
