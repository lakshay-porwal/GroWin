export const getThemeClasses = (theme: 'light' | 'dark') => {
  const isDark = theme === 'dark';
  
  return {
    // Backgrounds
    backgroundMain: isDark ? 'bg-gray-950' : 'bg-gray-50',
    backgroundCard: isDark ? 'bg-gray-900' : 'bg-white',
    backgroundSecondary: isDark ? 'bg-gray-800' : 'bg-gray-100',
    backgroundHeader: isDark ? 'bg-gray-900 border-b border-gray-800' : 'bg-white border-b border-gray-200',
    
    // Texts
    textMain: isDark ? 'text-white' : 'text-gray-900',
    textSecondary: isDark ? 'text-gray-400' : 'text-gray-500',
    textMuted: isDark ? 'text-gray-500' : 'text-gray-400',
    
    // Borders
    borderMain: isDark ? 'border-gray-800' : 'border-gray-200',
    borderSecondary: isDark ? 'border-gray-700' : 'border-gray-300',
    
    // Emerald specific
    bgEmeraldTint: isDark ? 'bg-emerald-500/20' : 'bg-emerald-100',
    textEmerald: isDark ? 'text-emerald-400' : 'text-emerald-600',
    borderEmeraldTint: isDark ? 'border-emerald-500/30' : 'border-emerald-200',
    
    // Inputs
    inputBackground: isDark ? 'bg-gray-800' : 'bg-gray-100',
    inputText: isDark ? 'text-white' : 'text-gray-900',
  };
};
