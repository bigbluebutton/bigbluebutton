import React from 'react';
import PropTypes from 'prop-types';
import { styles } from './styles.scss';
import Icon from '/imports/ui/components/icon/component';

const propTypes = {
  icon: PropTypes.elementType.isRequired,
};

const WarningIcon = (props) => {
  const { icon } = props;
  return (
    <div className={styles.warningThumbnail}>
      <Icon iconName={icon} />
    </div>
  );
};

WarningIcon.propTypes = propTypes;

export default WarningIcon;
