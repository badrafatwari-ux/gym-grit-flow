import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.10460bdf96a4a10bdd76663a7117235',
  appName: 'Gym Habit Builder',
  webDir: 'dist',
  server: {
    url: 'https://10460bd4-f96a-4a10-bdd7-6663a7117235.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  android: {
    backgroundColor: '#0f0f0f',
  },
  ios: {
    backgroundColor: '#0f0f0f',
  },
};

export default config;
