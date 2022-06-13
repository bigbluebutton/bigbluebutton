import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import injectWbResizeEvent from '/imports/ui/components/presentation/resize-wrapper/component';
import Button from '/imports/ui/components/common/button/component';
import PadContainer from '/imports/ui/components/pads/container';
import Service from '/imports/ui/components/captions/service';
import Styled from './styles';
import { PANELS, ACTIONS } from '/imports/ui/components/layout/enums';
import browserInfo from '/imports/utils/browserInfo';
import Header from '/imports/ui/components/common/control-header/component';

const intlMessages = defineMessages({
  hide: {
    id: 'app.captions.hide',
    description: 'Label for hiding closed captions',
  },
  takeOwnership: {
    id: 'app.captions.ownership',
    description: 'Label for taking ownership of closed captions',
  },
  takeOwnershipTooltip: {
    id: 'app.captions.ownershipTooltip',
    description: 'Text for button for taking ownership of closed captions',
  },
  dictationStart: {
    id: 'app.captions.dictationStart',
    description: 'Label for starting speech recognition',
  },
  dictationStop: {
    id: 'app.captions.dictationStop',
    description: 'Label for stoping speech recognition',
  },
  dictationOnDesc: {
    id: 'app.captions.dictationOnDesc',
    description: 'Aria description for button that turns on speech recognition',
  },
  dictationOffDesc: {
    id: 'app.captions.dictationOffDesc',
    description: 'Aria description for button that turns off speech recognition',
  },
});

const propTypes = {
  locale: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  ownerId: PropTypes.string.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  dictation: PropTypes.bool.isRequired,
  dictating: PropTypes.bool.isRequired,
  isRTL: PropTypes.bool.isRequired,
  hasPermission: PropTypes.bool.isRequired,
  layoutContextDispatch: PropTypes.func.isRequired,
  isResizing: PropTypes.bool.isRequired,
};

const Captions = ({
  locale,
  intl,
  ownerId,
  name,
  dictation,
  dictating,
  isRTL,
  hasPermission,
  layoutContextDispatch,
  isResizing,
}) => {
  const { isChrome } = browserInfo;

  return (
    <Styled.Captions isChrome={isChrome}>
      <Header
        leftButtonProps={{
          onClick: () => {
            layoutContextDispatch({
              type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
              value: false,
            });
            layoutContextDispatch({
              type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
              value: PANELS.NONE,
            });
          },
          'aria-label': intl.formatMessage(intlMessages.hide),
          label: name,
        }}
        customRightButton={Service.amICaptionsOwner(ownerId) ? (
          <span>
            <Button
              onClick={dictating
                ? () => Service.stopDictation(locale)
                : () => Service.startDictation(locale)}
              label={dictating
                ? intl.formatMessage(intlMessages.dictationStop)
                : intl.formatMessage(intlMessages.dictationStart)}
              aria-describedby="dictationBtnDesc"
              color={dictating ? 'danger' : 'primary'}
              disabled={!dictation}
            />
            <div id="dictationBtnDesc" hidden>
              {dictating
                ? intl.formatMessage(intlMessages.dictationOffDesc)
                : intl.formatMessage(intlMessages.dictationOnDesc)}
            </div>
          </span>
        ) : (
          <Button
            color="primary"
            tooltipLabel={intl.formatMessage(intlMessages.takeOwnershipTooltip, { 0: name })}
            onClick={() => Service.updateCaptionsOwner(locale, name)}
            aria-label={intl.formatMessage(intlMessages.takeOwnership)}
            label={intl.formatMessage(intlMessages.takeOwnership)}
          />
        )}
      />
      <PadContainer
        externalId={locale}
        hasPermission={hasPermission}
        isResizing={isResizing}
        isRTL={isRTL}
      />
    </Styled.Captions>
  );
};

Captions.propTypes = propTypes;

export default injectWbResizeEvent(injectIntl(Captions));
