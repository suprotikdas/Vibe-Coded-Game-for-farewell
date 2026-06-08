export interface CozyRoom {
  title: string;
  category: "cozy" | "magic" | "tech" | "creative" | "gourmet";
  description: string;
  emoji: string;
  glowingIcon: string;
  ambientColor: string; // Tailwind glow color class
}

export interface WindowState {
  buildingIndex: number;
  colIndex: number;
  rowIndex: number;
  windowId: string;
  isLit: boolean;
  room: CozyRoom;
}

export interface BuildingData {
  buildingIndex: number;
  name: string;
  cols: number;
  rows: number;
  heightClass: string; // height styling
  widthClass: string; // width styling
  colorClass: string; // dark base building color
  roofStyle: "flat" | "spire" | "sloped" | "dome" | "antenna";
}

export interface PlaneStyle {
  id: string;
  name: string;
  description: string;
  speed: number; // in seconds
  iconName: string;
  trailColor: string; // particle tail theme
  trailType: "sparkle" | "smoke" | "rainbow" | "stellar";
}

export interface SkyTheme {
  id: string;
  name: string;
  tagline: string;
  backgroundClass: string; // CSS bg gradient classes
  cloudColorClass: string; // Cloud color classes
  starCount: number;
  themeGlow: string; // glow color
}
