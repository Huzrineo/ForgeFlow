export interface AppSettings {
  // Appearance
  theme: 'vscode' | 'raycast' | 'github' | 'nord';
  isDarkMode: boolean;
  accentColor: string;
  uiDensity: 'compact' | 'default' | 'spacious';
  fontSize: number;
  
  // Behavior
  smoothAnimations: boolean;
  reduceMotion: boolean;
  autoSave: boolean;
  autoSaveInterval: number; // in seconds
  
  // Notifications
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  
  // Advanced
  debugMode: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
}

export const defaultSettings: AppSettings = {
  theme: 'vscode',
  isDarkMode: true,
  accentColor: 'oklch(0.65 0.2 250)', // Blue
  uiDensity: 'default',
  fontSize: 14,
  smoothAnimations: true,
  reduceMotion: false,
  autoSave: true,
  autoSaveInterval: 30,
  notificationsEnabled: true,
  soundEnabled: false,
  debugMode: false,
  logLevel: 'info',
};

export const accentColors = [
  { name: 'Blue', color: 'oklch(0.65 0.2 250)' },
  { name: 'Purple', color: 'oklch(0.6 0.2 300)' },
  { name: 'Pink', color: 'oklch(0.6 0.2 340)' },
  { name: 'Red', color: 'oklch(0.55 0.22 25)' },
  { name: 'Orange', color: 'oklch(0.65 0.2 50)' },
  { name: 'Yellow', color: 'oklch(0.7 0.18 80)' },
  { name: 'Green', color: 'oklch(0.6 0.18 145)' },
  { name: 'Teal', color: 'oklch(0.6 0.18 180)' },
] as const;

export const themes = [
  { id: 'vscode', name: 'VS Code Dark', preview: 'linear-gradient(135deg, #1e1e1e 0%, #252526 100%)' },
  { id: 'raycast', name: 'Raycast', preview: 'linear-gradient(135deg, #1c1c1e 0%, #28282a 100%)' },
  { id: 'github', name: 'GitHub Dark', preview: 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)' },
  { id: 'nord', name: 'Nord', preview: 'linear-gradient(135deg, #2e3440 0%, #3b4252 100%)' },
] as const;
