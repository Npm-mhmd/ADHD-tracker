// The four behavioral dimensions Attune tracks. This is the app's core
// vocabulary, so every surface — quick-log buttons, the trend chart, stat
// tiles, and intensity meters — derives its colors and labels from here.

export const CATEGORIES = [
  {
    key: 'Focus',
    label: 'Focus',
    description: 'Attention & engagement',
    token: 'focus',
    hex: '#2A60D6',
  },
  {
    key: 'Physical Energy',
    label: 'Physical Energy',
    description: 'Movement & restlessness',
    token: 'energy',
    hex: '#0A7A55',
  },
  {
    key: 'Impulsivity',
    label: 'Impulsivity',
    description: 'Self-regulation',
    token: 'impulse',
    hex: '#B65C08',
  },
  {
    key: 'Stress',
    label: 'Stress',
    description: 'Emotional load',
    token: 'stress',
    hex: '#C2384F',
  },
];

export const CATEGORY_BY_KEY = Object.fromEntries(
  CATEGORIES.map((category) => [category.key, category])
);

// Tailwind utility groups keyed by token, so JSX can pick a consistent
// treatment without string-building class names (which Tailwind can't scan).
export const CATEGORY_STYLES = {
  focus: {
    solid: 'bg-focus text-white',
    soft: 'bg-focus-soft text-focus-softText',
    dot: 'bg-focus',
    text: 'text-focus',
  },
  energy: {
    solid: 'bg-energy text-white',
    soft: 'bg-energy-soft text-energy-softText',
    dot: 'bg-energy',
    text: 'text-energy',
  },
  impulse: {
    solid: 'bg-impulse text-white',
    soft: 'bg-impulse-soft text-impulse-softText',
    dot: 'bg-impulse',
    text: 'text-impulse',
  },
  stress: {
    solid: 'bg-stress text-white',
    soft: 'bg-stress-soft text-stress-softText',
    dot: 'bg-stress',
    text: 'text-stress',
  },
};

export const styleFor = (categoryKey) => {
  const category = CATEGORY_BY_KEY[categoryKey];
  return category ? CATEGORY_STYLES[category.token] : CATEGORY_STYLES.focus;
};
