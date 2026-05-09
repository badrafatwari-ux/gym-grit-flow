import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.gymhabitbuilder',
  appName: 'Gym Habit Builder',
  webDir: 'dist/client',
  bundledWebRuntime: false,
  android: {
    backgroundColor: '#0f0f0f',
  },
  ios: {
    backgroundColor: '#0f0f0f',
  },
};

export default config;
