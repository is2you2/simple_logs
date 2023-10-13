import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.pjcone.simplelogs',
  appName: 'Simple logs',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  }
};

export default config;
