
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

export const SmartLinkShare = (props) => {
  const {
    currentSlide, intl, isMobile, isRTL, userIsPresenter
  } = props;
  const linkPatt = /(https?:\/\/[^\s]+)/gm;
  const externalLinks = currentSlide && safeMatch(linkPatt, currentSlide?.content?.replace(/[\n]/g, ''), false);
  if (!externalLinks) return null;

  const actions = [];
  externalLinks.forEach((lnk) => {
    const splitLink = lnk.split('https://');
    splitLink.forEach((l) => {
        if (l === '' || isUrlValid(`https://${l}`)) return;
        actions.push({
          label: l,
          onClick: () => window.open(`https://${l}`, '_blank'),
          iconRight: 'popout_window',
        });

    })
  });

  if (actions?.length === 0) return null;

  const customStyles = { top: '-1rem' };
  const wrapperStyles = {
    position: 'absolute',
    backgroundColor: 'transparent',
    top: '-3px',
  };

  if (isRTL) {
    wrapperStyles.left = userIsPresenter ? '17.25rem' : '3rem';
  } else {
    wrapperStyles.right = userIsPresenter ? '17.75rem' : '3rem';
  }

  return (
    <div style={wrapperStyles}>
        <BBBMenu
            customStyles={!isMobile ? customStyles : null}
            trigger={(
                <Styled.QuickLinkButton
                  role="button"
                  label={'Links'}
                  color="light"
                  icon="external-video"
                  circle
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
    </div>
  );
};

export default SmartLinkShare;
