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
  /** the dock position the zone drops to; the CSS layout places the zone by it */
  id: string;
  dataTest: string;
}

const DropArea: React.FC<DropAreaProps> = ({
  id,
  dataTest,
}) => {
  const intl = useIntl();
  return (
    <>
      <Styled.DropZoneArea
        id={id}
        data-test={dataTest}
        data-layout-region="drop-zone"
        data-zone={id}
      />
      <Styled.DropZoneBg
        data-layout-region="drop-zone-bg"
        data-zone={id}
      >
        {intl.formatMessage(intlMessages.dropZoneLabel)}
      </Styled.DropZoneBg>
    </>
  );
};

export default DropArea;
