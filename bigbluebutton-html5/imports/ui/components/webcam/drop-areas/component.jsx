import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import Styled from './styles';

const intlMessages = defineMessages({
  dropZoneLabel: {
    id: 'app.video.dropZoneLabel',
    description: 'message showing where the user can drop cameraDock',
  },
});

const DropArea = ({ id, style, intl }) => (
  <>
    <Styled.DropZoneArea
      id={id}
      style={
        {
          ...style,
          zIndex: style.zIndex + 1,
        }
      }
    />
    <Styled.DropZoneBg
      style={
        {
          ...style,
          zIndex: style.zIndex,
        }
      }
    >
      {intl.formatMessage(intlMessages.dropZoneLabel)}
    </Styled.DropZoneBg>
  </>
);

export default injectIntl(DropArea);
