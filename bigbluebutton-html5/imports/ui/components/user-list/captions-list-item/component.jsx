import React from 'react';
import PropTypes from 'prop-types';
import Icon from '/imports/ui/components/common/icon/component';
import CaptionsService from '/imports/ui/components/captions/service';
import { defineMessages, injectIntl } from 'react-intl';
import Styled from './styles';
import { PANELS, ACTIONS } from '/imports/ui/components/layout/enums';

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  locale: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  tabIndex: PropTypes.number.isRequired,
};

const intlMessages = defineMessages({
  captionLabel: {
    id: 'app.captions.label',
    description: 'used for captions button aria label',
  },
});

const CaptionsListItem = (props) => {
  const {
    intl,
    locale,
    name,
    tabIndex,
    sidebarContentPanel,
    layoutContextDispatch,
  } = props;

  const handleClickToggleCaptions = () => {
    if (sidebarContentPanel !== PANELS.CAPTIONS) {
      CaptionsService.setCaptionsLocale(locale);
      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
        value: true,
      });
      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
        value: PANELS.CAPTIONS,
      });
    } else {
      const captionsLocale = CaptionsService.getCaptionsLocale();
      if (captionsLocale !== locale) {
        CaptionsService.setCaptionsLocale(locale);
      } else {
        layoutContextDispatch({
          type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
          value: false,
        });
        layoutContextDispatch({
          type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
          value: PANELS.NONE,
        });
      }
    }
  };

  return (
    <Styled.ListItem
      role="button"
      tabIndex={tabIndex}
      id={locale}
      onClick={handleClickToggleCaptions}
      aria-label={`${name} ${intl.formatMessage(intlMessages.captionLabel)}`}
      onKeyPress={() => {}}
    >
      <Icon iconName="closed_caption" />
      <span aria-hidden>{name}</span>
    </Styled.ListItem>
  );
};

CaptionsListItem.propTypes = propTypes;

export default injectIntl(CaptionsListItem);
