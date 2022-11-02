import React from 'react';
import { defineMessages } from 'react-intl';
import { safeMatch } from '/imports/utils/string-utils';
import { isUrlValid, startWatching } from '/imports/ui/components/external-video-player/service';
import BBBMenu from '/imports/ui/components/common/menu/component';
import Styled from './styles';

const intlMessages = defineMessages({
  externalVideo: {
    id: 'app.smartMediaShare.externalVideo',
  },
});

export const SmartMediaShare = (props) => {
  const {
    currentSlide, intl, isMobile, isRTL,
  } = props;
  const linkPatt = /(https?:\/\/[^\s]+)/gm;
  const externalLinks = safeMatch(linkPatt, currentSlide?.content, false);
  if (!externalLinks) return null;

  const actions = [];

  externalLinks.forEach((lnk) => {
    if (isUrlValid(lnk)) {
      actions.push({
        label: lnk,
        onClick: () => startWatching(lnk),
      });
    }
  });

  const customStyles = { top: '-1rem' };

  return (
    <BBBMenu
      customStyles={!isMobile ? customStyles : null}
      trigger={(
        <Styled.QuickVideoButton
          role="button"
          label={intl.formatMessage(intlMessages.externalVideo)}
          color="light"
          circle
          icon="external-video"
          size="md"
          onClick={() => null}
          hideLabel
        />
      )}
      actions={actions}
      opts={{
        id: 'external-video-dropdown-menu',
        keepMounted: true,
        transitionDuration: 0,
        elevation: 3,
        getContentAnchorEl: null,
        fullwidth: 'true',
        anchorOrigin: { vertical: 'top', horizontal: isRTL ? 'right' : 'left' },
        transformOrigin: { vertical: 'bottom', horizontal: isRTL ? 'right' : 'left' },
      }}
    />
  );
};

export default SmartMediaShare;
