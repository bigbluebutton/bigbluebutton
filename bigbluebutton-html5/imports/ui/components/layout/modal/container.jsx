import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { withModalMounter } from '/imports/ui/components/common/modal/service';
import SettingsService from '/imports/ui/services/settings';
import LayoutModalComponent from './component';

import {
  updateSettings,
  isPresenter,
} from '/imports/ui/components/settings/service';

const LayoutModalContainer = (props) => <LayoutModalComponent {...props} />;

export default withModalMounter(withTracker(({ mountModal, amIModerator }) => ({
  closeModal: () => mountModal(null),
  application: SettingsService.application,
  updateSettings,
  isPresenter: isPresenter(),
  isModerator: amIModerator,
  showToggleLabel: false,
}))(LayoutModalContainer));
