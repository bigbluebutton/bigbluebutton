import React from 'react';
import PropTypes from 'prop-types';
import { styles } from '../styles';

const propTypes = {
    second: PropTypes.number,
    minute: PropTypes.number
};

const defaultProps = {
    second: 0,
    minute: 0
};

const Clock = props => (
    <div className={styles.time}>
        {props.formatTimeInterval(props.minute)}:{props.formatTimeInterval(props.second)}
    </div>
);

Clock.propTypes = propTypes;
Clock.defaultProps = defaultProps;

export default Clock;
