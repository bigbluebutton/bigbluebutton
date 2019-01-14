import React from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { meetingIsBreakout } from '/imports/ui/components/app/service';
import Timer from './component';
import Service from './service';

const propTypes = {
    currentUser: PropTypes.shape({}).isRequired,
    increaseTime: PropTypes.func.isRequired,
    formatTimeInterval: PropTypes.func.isRequired,
};

const TimerContainer = props => <Timer {...props} />;

TimerContainer.propTypes = propTypes;

export default withTracker(() => ({
    currentUser: Service.getCurrentUser(),
    increaseTime: Service.increaseTime,
    formatTimeInterval: Service.formatTimeInterval
}))(TimerContainer);
