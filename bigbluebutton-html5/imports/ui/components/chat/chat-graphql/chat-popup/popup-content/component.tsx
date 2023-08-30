import React from 'react';
import { PopupContentBox, PopupContentHeader, PopupContentBody, CloseButton } from './styles';
import { defineMessages, useIntl } from "react-intl";

interface PopupContentProps {
  message: string;
  closePopup?: () => void;
}

const intlMessages = defineMessages({
  closePopup: {
    id: 'app.chat.closePopup',
    description: 'close popup button label'
  },
});

const PopupContent: React.FC<PopupContentProps> = ({ message, closePopup }) => {
  const intl = useIntl();
  const [showPopup, setShowPopup] = React.useState(true);
  if (!showPopup) return null;
  return (
    <PopupContentBox>
      <PopupContentHeader>
        <CloseButton
          size="sm"
          label={intl.formatMessage(intlMessages.closePopup)}
          hideLabel
          icon="close"
          onClick={() => {
            setShowPopup(false);
            if (closePopup) closePopup();
          }}
          data-test="chatOptionsMenu"
        />
      </PopupContentHeader>
      <PopupContentBody dangerouslySetInnerHTML={{__html: message}} />
    </PopupContentBox>
  );
};

export default PopupContent;
