import React from 'react';
import PropTypes from 'prop-types';
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
  const linkPatt = /(https?:\/\/.*[ ]$)/g;
  const externalLinks = safeMatch(linkPatt, currentSlide?.content?.replace(/[\r\n]/g, '  '), false);
  if (!externalLinks) return null;

  const lnkParts = externalLinks[0]?.split('  ')?.filter(s => !s?.includes(' ')).join('');
  const actions = [];
  
  const splitLink = lnkParts?.split('https://');
  splitLink.forEach((l) => {
    if (isUrlValid(`https://${l}`)) {
      actions.push({
        label: l,
        onClick: () => startWatching(`https://${l}`),
      });
    }
  });

  if (actions?.length === 0) return null;

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
        getcontentanchorel: null,
        fullwidth: 'true',
        anchorOrigin: { vertical: 'top', horizontal: isRTL ? 'right' : 'left' },
        transformOrigin: { vertical: 'bottom', horizontal: isRTL ? 'right' : 'left' },
      }}
    />
  );
};

export default SmartMediaShare;

SmartMediaShare.propTypes = {
  currentSlide: PropTypes.shape({
    content: PropTypes.string.isRequired,
  }),
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  isMobile: PropTypes.bool.isRequired,
  isRTL: PropTypes.bool.isRequired,
};

SmartMediaShare.defaultProps = {
  currentSlide: undefined,
};
