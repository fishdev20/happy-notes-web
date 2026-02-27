const NOTE_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#6366f1",
  "#a855f7",
  "#ec4899",
];

export const getRandomNoteColor = () => NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)];

export const getAllNoteColors = () => NOTE_COLORS;
