import React from 'react';
import cx from 'classnames';
import Button from '/imports/ui/components/button/component';
import _ from 'lodash';
import { styles } from './styles';

const DEBOUNCE_TIMEOUT = 5000;
const DEBOUNCE_OPTIONS = {
  leading: true,
  trailing: false,
};

const ReloadButtonComponent = ({
  handleReload,
  label,
}) => (
  <div className={cx(styles.wrapper, styles.top)}>
    <Button
      className={cx(styles.button, styles.reloadButton)}
      color="primary"
      icon="refresh"
      onClick={_.debounce(handleReload, DEBOUNCE_TIMEOUT, DEBOUNCE_OPTIONS)}
      label={label}
      hideLabel
    />
  </div>
);

export default ReloadButtonComponent;
