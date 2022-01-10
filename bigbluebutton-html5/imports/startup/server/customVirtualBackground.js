import { Meteor } from 'meteor/meteor';
import { createHash } from 'crypto';
import {
  readFileSync,
  readdirSync,
  realpathSync,
  existsSync,
  statSync,
  copyFileSync,
  writeFileSync,
  chmodSync,
  rmSync,
} from 'fs';
import Logger from './logger';

const DEFAULT_VIRTUAL_BACKGROUNDS = Meteor.settings.public.virtualBackgrounds.fileNames;
const meteorRoot = realpathSync(`${process.cwd()}/../`);
const env = Meteor.isDevelopment ? 'development' : 'production';
const CUSTOM_BACKGROUND_DIR = process.env.BBB_HTML5_CUSTOM_VIRTUAL_BACKGROUNDS
  || '/var/www/bigbluebutton/client/images/virtual-backgrounds';
const virtualBackgroundDir = (env === 'development')
  ? realpathSync(`${meteorRoot}'/../../../../public/resources/images/virtual-backgrounds/`)
  : realpathSync(`${meteorRoot}/../programs/web.browser/app/resources/images/virtual-backgrounds/`);

function cleanProgramJson() {
  const programJsonPath = realpathSync(`${meteorRoot}/../programs/web.browser/program.json`);

  if (existsSync(programJsonPath)) {
    try {
      Logger.debug('Cleaning program.json...');
      const { mode } = statSync(programJsonPath);
      chmodSync(programJsonPath, 0o700);
      const programJsonData = readFileSync(programJsonPath);
      const programJson = JSON.parse(programJsonData);
      programJson.manifest = programJson.manifest.filter((config) => !config.custom);
      writeFileSync(programJsonPath, JSON.stringify(programJson));
      chmodSync(programJsonPath, mode);
      Logger.debug('program.json cleaned!');
    } catch (error) {
      Logger.debug('Failed to clean program.json!');
    }
  }
}

function cleanNonDefaultVirtualBackgrounds() {
  if (!existsSync(virtualBackgroundDir)) return;
  Logger.debug('Removing non-default virtual backgrounds...');

  readdirSync(virtualBackgroundDir, { withFileTypes: true })
    .forEach((entry) => {
      try {
        if (entry.isDirectory()) return;
        if ([...DEFAULT_VIRTUAL_BACKGROUNDS, 'architecture.jpg', 'brickwall.jpg'].indexOf(entry.name) === -1) {
          rmSync(`${virtualBackgroundDir}/${entry.name}`);
          rmSync(`${virtualBackgroundDir}/thumbnails/${entry.name}`, { force: true });
        }
      } catch (error) {
        Logger.error('Error on remove non-default virtual background.',
          { logCode: 'custom_virtual_background_cleaning', extraInfo: { error } });
      }
    });

  if (env === 'production') cleanProgramJson();
  Logger.debug('Non-default virtual backgrounds removed!');
}

function updateProgramJson(configs) {
  if (configs.length > 0) {
    const programJsonPath = realpathSync(`${meteorRoot}/../programs/web.browser/program.json`);

    if (existsSync(programJsonPath)) {
      const { mode } = statSync(programJsonPath);
      chmodSync(programJsonPath, 0o700);
      const programJsonData = readFileSync(programJsonPath);
      const programJson = JSON.parse(programJsonData);

      configs.forEach((config) => {
        if (!config) return;
        programJson.manifest = [
          ...programJson.manifest,
          ...config,
        ];
      });

      writeFileSync(programJsonPath, JSON.stringify(programJson));
      chmodSync(programJsonPath, mode);
    }
  }
}

function addCustomVirtualBackgrounds() {
  if (existsSync(CUSTOM_BACKGROUND_DIR)) {
    const files = readdirSync(CUSTOM_BACKGROUND_DIR, { withFileTypes: true })
      .filter((file) => !file.isDirectory())
      .slice(0, 10);

    if (files.length === 10) {
      Logger.info('Maximum background number reached. Skipping others...');
    }

    if (files.length > 0) {
      const configs = files.map((file) => {
        try {
          const bgPath = `${CUSTOM_BACKGROUND_DIR}/${file.name}`;
          copyFileSync(bgPath, `${virtualBackgroundDir}/${file.name}`);

          const thumbPath = `${CUSTOM_BACKGROUND_DIR}/thumbnails/${file.name}`;
          copyFileSync(thumbPath, `${virtualBackgroundDir}/thumbnails/${file.name}`);

          Meteor.settings.public.virtualBackgrounds.fileNames.push(file.name);

          if (env === 'production') {
            const bgData = readFileSync(`${virtualBackgroundDir}/${file.name}`, 'utf-8');
            const bgStats = statSync(`${virtualBackgroundDir}/${file.name}`);
            const bgHash = createHash('sha256')
              .update(bgData)
              .digest('hex');

            const thumbData = readFileSync(`${virtualBackgroundDir}/thumbnails/${file.name}`, 'utf-8');
            const thumbStats = statSync(`${virtualBackgroundDir}/thumbnails/${file.name}`);
            const thumbHash = createHash('sha256')
              .update(thumbData)
              .digest('hex');

            return [
              {
                custom: true,
                path: `app/resources/images/virtual-backgrounds/thumbnails/${file.name}`,
                where: 'client',
                type: 'asset',
                cacheable: false,
                url: `/resources/images/virtual-backgrounds/thumbnails/${file.name}`,
                size: thumbStats.size,
                hash: thumbHash,
                sri: null,
              },
              {
                custom: true,
                path: `app/resources/images/virtual-backgrounds/${file.name}`,
                where: 'client',
                type: 'asset',
                cacheable: false,
                url: `/resources/images/virtual-backgrounds/${file.name}`,
                size: bgStats.size,
                hash: bgHash,
                sri: null,
              },
            ];
          }
          return null;
        } catch (error) {
          Logger.error('Error on add custom virtual background.',
            { logCode: 'custom_virtual_background_add', extraInfo: { error } });
          rmSync(`${virtualBackgroundDir}/${file.name}`, { force: true });
          rmSync(`${virtualBackgroundDir}/thumbnails/${file.name}`, { force: true });
          Logger.warn(`Files of ${file.name} were removed.`);
          const fileIndex = Meteor.settings.public.virtualBackgrounds.fileNames.indexOf(file.name);
          if (fileIndex !== -1) {
            Meteor.settings.public.virtualBackgrounds.fileNames.splice(fileIndex, 1);
          }
          return null;
        }
      });

      if (env === 'production') updateProgramJson(configs);
      Logger.info('Custom virtual backgrounds updated!');
    } else {
      Logger.info('No custom virtual background found!');
    }
  } else {
    Logger.info('Custom virtual background directory does not exist!');
  }
}

cleanNonDefaultVirtualBackgrounds();
addCustomVirtualBackgrounds();
