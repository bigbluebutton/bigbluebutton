import config from 'config';
import { AppSettings } from './type';

// Re-export config as typed config for TypeScript support
export default config as typeof config & {
  expressServer: AppSettings['expressServer'];
  hocuspocusServer: AppSettings['hocuspocusServer'];
  commandExecution: AppSettings['commandExecution'];
  bbbWeb: AppSettings['bbbWeb'];
  log: AppSettings['log'];
  redis: AppSettings['redis'];
  rateLimit: AppSettings['rateLimit'];
  postgres: AppSettings['postgres'];
};
