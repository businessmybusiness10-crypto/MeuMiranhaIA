/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const romanticPalette = {
  // Legacy aliases
  text: '#fff6fb',
  tint: '#ff3b81',

  // Core surfaces
  background: '#0d0714',
  foreground: '#fff6fb',

  // Cards / elevated surfaces
  card: '#1a1022',
  cardForeground: '#fff6fb',

  // Primary action color
  primary: '#ff3b81',
  primaryForeground: '#160812',

  // Secondary surfaces
  secondary: '#29152f',
  secondaryForeground: '#ffeaf3',

  // Muted surfaces and text
  muted: '#22152b',
  mutedForeground: '#c7a9c1',

  // Accent highlights
  accent: '#8b4dff',
  accentForeground: '#fff7ff',

  destructive: '#ff5f7d',
  destructiveForeground: '#ffffff',

  border: '#3c2346',
  input: '#26152f',

  // Product-specific atmosphere tokens
  ink: '#0a0610',
  surface: '#171020',
  surfaceStrong: '#24142e',
  pinkSoft: '#ff8bb5',
  violetSoft: '#b78bff',
  redGlow: '#ff426f',
  gold: '#ffd18a',
  green: '#8ee5bb',
  blue: '#89c8ff',
  whatsapp: '#25d366',
  white: '#ffffff',
  overlay: 'rgba(10, 6, 16, 0.88)',
  glass: 'rgba(39, 20, 50, 0.82)',
  glassBright: 'rgba(255, 255, 255, 0.08)',
};

const colors = {
  light: romanticPalette,
  dark: romanticPalette,
  radius: 22,
};

export default colors;
