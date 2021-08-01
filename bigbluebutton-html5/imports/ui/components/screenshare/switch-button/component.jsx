import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import Button from '/imports/ui/components/button/component';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { styles } from './styles';

const intlMessages = defineMessages({
  switchButtonShrink: {
    id: 'app.switchButton.shrinkLabel',
    description: 'shrink label',
  },
  switchButtonExpand: {
    id: 'app.switchButton.expandLabel',
    description: 'expand label',
  },
});

const propTypes = {
  intl: PropTypes.object.isRequired,
  dark: PropTypes.bool,
  bottom: PropTypes.bool,
  className: PropTypes.string,
  handleSwitch: PropTypes.func,
  switched: PropTypes.bool,
};

const defaultProps = {
  dark: false,
  bottom: false,
  className: '',
  handleSwitch: () => {},
  switched: false,
};

const SwitchButtonComponent = (props) => {
  const {
    intl,
    dark,
    bottom,
    className,
    handleSwitch,
    switched,
  } = props;
  const formattedLabel = intl.formatMessage(switched
    ? intlMessages.switchButtonShrink
    : intlMessages.switchButtonExpand);

  const wrapperClassName = cx({
    [styles.wrapper]: true,
    [styles.dark]: dark,
    [styles.light]: !dark,
    [styles.top]: !bottom,
    [styles.bottom]: bottom,
  });

  return (
    <div className={wrapperClassName}>
      <Button
        color="default"
        icon={switched ? 'screenshare-close-fullscreen' : 'screenshare-fullscreen'}
        size="sm"
        onClick={handleSwitch}
        label={formattedLabel}
        hideLabel
        className={cx(styles.button, styles.switchButton, className)}
        data-test="switchButton"
      />
    </div>
  );
};

SwitchButtonComponent.propTypes = propTypes;
SwitchButtonComponent.defaultProps = defaultProps;

export default injectIntl(SwitchButtonComponent);
