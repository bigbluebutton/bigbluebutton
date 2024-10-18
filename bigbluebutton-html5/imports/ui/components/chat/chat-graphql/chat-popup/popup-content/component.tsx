import React from 'react';
import {
  defineMessages, useIntl,
} from 'react-intl';
import ReactMarkdown from 'react-markdown';
import {
  PopupContentBox, PopupContentHeader, CloseButton,
} from './styles';

interface PopupContentProps {
  message: string;
  closePopup: () => void;
}

const intlMessages = defineMessages({
  closePopup: {
    id: 'app.chat.closePopup',
    description: 'close popup button label',
  },
});

const PopupContent: React.FC<PopupContentProps> = ({ message, closePopup }) => {
  const intl = useIntl();
  const [showPopup, setShowPopup] = React.useState(true);
  if (!showPopup) return null;
  return (
    <PopupContentBox data-test="welcomeMessage">
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
          data-test="closePopup"
        />
      </PopupContentHeader>
      <ReactMarkdown
        linkTarget="_blank"
      >
        {message}
      </ReactMarkdown>
    </PopupContentBox>
  );
};

export default PopupContent;
