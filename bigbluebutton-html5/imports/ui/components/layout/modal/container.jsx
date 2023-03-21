import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import SettingsService from '/imports/ui/services/settings';
import LayoutModalComponent from './component';

import {
  updateSettings,
  isPresenter,
} from '/imports/ui/components/settings/service';

const LayoutModalContainer = (props) => {
  return <LayoutModalComponent {...props} />};

export default withTracker(({ amIModerator }) => ({
  application: SettingsService.application,
  updateSettings,
  isPresenter: isPresenter(),
  isModerator: amIModerator,
  showToggleLabel: false,
}))(LayoutModalContainer);
