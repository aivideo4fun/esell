import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'in.catchbuddy.app',
  appName: 'CatchBuddy',
  webDir: 'public',
  server: {
    url: 'https://catchbuddy.in',
    cleartext: false
  }
};

export default config;