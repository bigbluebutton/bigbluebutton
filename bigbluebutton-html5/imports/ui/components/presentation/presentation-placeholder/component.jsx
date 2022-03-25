import React, { useEffect } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import Styled from './styles';
import { ACTIONS } from '/imports/ui/components/layout/enums';

const intlMessages = defineMessages({
  presentationPlaceholderText: {
    id: 'app.presentation.placeholder',
    description: 'Presentation placeholder text',
  },
});

const PresentationPlaceholder = ({
  fullscreenContext,
  intl,
  setPresentationRef,
  top,
  left,
  right,
  height,
  width,
  zIndex,
  layoutContextDispatch,
}) => {
  useEffect(() => {
    layoutContextDispatch({
      type: ACTIONS.SET_PRESENTATION_NUM_CURRENT_SLIDE,
      value: 0,
    });
    return () => {
      layoutContextDispatch({
        type: ACTIONS.SET_PRESENTATION_NUM_CURRENT_SLIDE,
        value: 1,
      });
    }
  }, []);

  return <Styled.Placeholder
    ref={(ref) => setPresentationRef(ref)}
    data-test="presentationPlaceholder"
    style={{
      top,
      left,
      right,
      width,
      height,
      zIndex: fullscreenContext ? zIndex : undefined,
      display: width ? 'flex' : 'none',
    }}
  >
    <span>
      {intl.formatMessage(intlMessages.presentationPlaceholderText)}
    </span>
  </Styled.Placeholder>
};

export default injectIntl(PresentationPlaceholder);
