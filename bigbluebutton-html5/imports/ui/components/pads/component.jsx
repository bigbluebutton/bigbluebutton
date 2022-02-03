import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import PadContent from './content/container';
import Service from './service';
import Styled from './styles';

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
    <Styled.Pad>
      <Styled.IFrame
        title="pad"
        src={padURL}
        aria-describedby="padEscapeHint"
        style={{
          pointerEvents: isResizing ? 'none' : 'inherit',
        }}
      />
      <Styled.Hint
        id="padEscapeHint"
        aria-hidden
      >
        {intl.formatMessage(intlMessages.hint)}
      </Styled.Hint>
    </Styled.Pad>
  );
};

Pad.propTypes = propTypes;

export default injectIntl(Pad);
