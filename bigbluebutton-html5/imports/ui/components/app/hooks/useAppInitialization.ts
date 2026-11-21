import { useEffect } from 'react';
import AppService from '/imports/ui/components/app/service';
import Session from '/imports/ui/services/storage/in-memory';
import browserInfo from '/imports/utils/browserInfo';
import deviceInfo from '/imports/utils/deviceInfo';

const useAppInitialization = () => {
  useEffect(() => {
    const { browserName } = browserInfo;
    const { osName = '' } = deviceInfo;

    Session.setItem('videoPreviewFirstOpen', true);

    const body = document.getElementsByTagName('body')[0];

    if (browserName) {
      body.classList.add(`browser-${browserName.split(' ').pop()?.toLowerCase()}`);
    }

    body.classList.add(`os-${osName.split(' ').shift()?.toLowerCase()}`);

    window.ondragover = (e) => { e.preventDefault(); };
    window.ondrop = (e) => { e.preventDefault(); };

    AppService.initializeEmojiData();

    return () => {
      window.onbeforeunload = null;
    };
  }, []);
};

export default useAppInitialization;
