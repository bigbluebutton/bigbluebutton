import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import ActivityReportButton from './component';
import ActivityReportService from '../service';

const activityReportContainer = (props) => <ActivityReportButton {...props} />;

export default withTracker(() => ({
  isModerator: ActivityReportService.isModerator(),
  activityReportAccessToken: ActivityReportService.getActivityReportAccessToken(),
}))(activityReportContainer);
