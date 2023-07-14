import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import SettingsService from '/imports/ui/services/settings';
import LayoutModalComponent from './component';

import {
  updateSettings,
  isPresenter,
} from '/imports/ui/components/settings/service';

const LayoutModalContainer = (props) => {
  const { intl, setIsOpen,onRequestClose, isOpen, isModerator, isPresenter,
          application, updateSettings, } = props;
  return <LayoutModalComponent {...{ 
      intl, setIsOpen, isModerator, isPresenter,
      application, updateSettings, onRequestClose, isOpen,
   }} />};

export default withTracker(({ amIModerator }) => ({
  application: SettingsService.application,
  updateSettings,
  isPresenter: isPresenter(),
  isModerator: amIModerator,
}))(LayoutModalContainer);
