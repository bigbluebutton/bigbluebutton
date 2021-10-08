import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import Button from '/imports/ui/components/button/component';
import { styles } from './styles';

const intlMessages = defineMessages({
  closePresentationLabel: {
    id: 'app.presentation.hide',
    description: 'Hide presentation label',
  },
});

const ClosePresentationComponent = ({
  intl, toggleSwapLayout, layoutContextDispatch, isIphone,
}) => (
  <Button
    color="muted"
    icon="minus"
    size="sm"
    data-test="hidePresentationButton"
    onClick={() => toggleSwapLayout(layoutContextDispatch)}
    label={intl.formatMessage(intlMessages.closePresentationLabel)}
    aria-label={intl.formatMessage(intlMessages.closePresentationLabel)}
    hideLabel
    className={isIphone ? styles.button : styles.buttonWithMargin}
  />
);

export default injectIntl(ClosePresentationComponent);
