import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Styled from './styles';

const intlMessages = defineMessages({
  dropZoneLabel: {
    id: 'app.video.dropZoneLabel',
    description: 'message showing where the user can drop cameraDock',
  },
});

interface DropAreaProps {
  id: string;
  dataTest: string;
  style: Record<string, unknown>;
}

const DropArea: React.FC<DropAreaProps> = ({
  id,
  dataTest,
  style,
}) => {
  const intl = useIntl();
  return (
    <>
      <Styled.DropZoneArea
        id={id}
        data-test={dataTest}
        style={
          {
            ...style,
            zIndex: (style.zIndex as number) + 1,
          }
        }
      />
      <Styled.DropZoneBg
        style={
          {
            ...style,
            zIndex: (style.zIndex as number),
          }
        }
      >
        {intl.formatMessage(intlMessages.dropZoneLabel)}
      </Styled.DropZoneBg>
    </>
  );
};

export default DropArea;
