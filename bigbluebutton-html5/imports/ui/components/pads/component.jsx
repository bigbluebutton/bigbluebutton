import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import PadContent from './content/container';
import Service from './service';
import { styles } from './styles';

const intlMessages = defineMessages({
  hint: {
    id: 'app.pads.hint',
    description: 'Label for hint on how to escape iframe',
  },
});

const propTypes = {
  externalId: PropTypes.string.isRequired,
  hasSession: PropTypes.bool.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  isResizing: PropTypes.bool.isRequired,
  isRTL: PropTypes.bool.isRequired,
};

const Pad = ({
  externalId,
  hasSession,
  intl,
  isResizing,
  isRTL,
}) => {
  const [padURL, setPadURL] = useState();

  useEffect(() => {
    Service.getPadId(externalId).then((response) => {
      setPadURL(Service.buildPadURL(response));
    });
  }, [isRTL, hasSession]);

  if (!hasSession) {
    return <PadContent externalId={externalId} />;
  }

  return (
    <div className={styles.pad}>
      <iframe
        title="pad"
        src={padURL}
        aria-describedby="padEscapeHint"
        style={{
          pointerEvents: isResizing ? 'none' : 'inherit',
        }}
      />
      <span
        id="padEscapeHint"
        className={styles.hint}
        aria-hidden
      >
        {intl.formatMessage(intlMessages.hint)}
      </span>
    </div>
  );
};

Pad.propTypes = propTypes;

export default injectIntl(Pad);
