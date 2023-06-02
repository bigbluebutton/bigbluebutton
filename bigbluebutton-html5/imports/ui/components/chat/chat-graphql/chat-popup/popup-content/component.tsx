import React from 'react';
import { PopupContentBox, PopupContentHeader, PopupContentBody, CloseButton } from './styles';
import Button from '/imports/ui/components/common/button/component';
interface PopupContentProps {
  message: string;
  closePopup?: () => void;
}

const PopupContent: React.FC<PopupContentProps> = ({ message, closePopup }) => {
  const [showPopup, setShowPopup] = React.useState(true);
  if (!showPopup) return null;
  return (
    <PopupContentBox>
      <PopupContentHeader>
        <CloseButton
          size="sm"
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