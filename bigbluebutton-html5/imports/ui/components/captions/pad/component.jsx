import React from 'react';
import PropTypes from 'prop-types';
import { Session } from 'meteor/session';
import { defineMessages, injectIntl } from 'react-intl';
import injectWbResizeEvent from '/imports/ui/components/presentation/resize-wrapper/component';
import Button from '/imports/ui/components/button/component';
import PadService from './service';
import CaptionsService from '/imports/ui/components/captions/service';
import { styles } from './styles';

const intlMessages = defineMessages({
  hide: {
    id: 'app.captions.pad.hide',
    description: 'Label for hiding closed captions pad',
  },
  tip: {
    id: 'app.captions.pad.tip',
    description: 'Label for tip on how to escape closed captions iframe',
  },
  takeOwnership: {
    id: 'app.captions.pad.ownership',
    description: 'Label for taking ownership of closed captions pad',
  },
});

const propTypes = {
  locale: PropTypes.string.isRequired,
  ownerId: PropTypes.string.isRequired,
  padId: PropTypes.string.isRequired,
  readOnlyPadId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

const Pad = (props) => {
  const {
    locale,
    intl,
    padId,
    readOnlyPadId,
    ownerId,
    name,
  } = props;

  const url = PadService.getPadURL(padId, readOnlyPadId, ownerId);

  return (
    <div className={styles.pad}>
      <header className={styles.header}>
        <div className={styles.title}>
          <Button
            onClick={() => { Session.set('openPanel', 'userlist'); }}
            aria-label={intl.formatMessage(intlMessages.hide)}
            label={name}
            icon="left_arrow"
            className={styles.hideBtn}
          />
        </div>
        {CaptionsService.canIOwnThisPad(ownerId)
          ? (
            <Button
              icon="pen_tool"
              size="sm"
              ghost
              color="dark"
              hideLabel
              onClick={() => { CaptionsService.takeOwnership(locale); }}
              aria-label={intl.formatMessage(intlMessages.takeOwnership)}
              label={intl.formatMessage(intlMessages.takeOwnership)}
            />
          ) : null
        }
      </header>
      <iframe
        title="etherpad"
        src={url}
        aria-describedby="padEscapeHint"
      />
      <span id="padEscapeHint" className={styles.hint} aria-hidden>
        {intl.formatMessage(intlMessages.tip)}
      </span>
    </div>
  );
};

Pad.propTypes = propTypes;

export default injectWbResizeEvent(injectIntl(Pad));
