import { withModalMounter } from '/imports/ui/components/modal/service';
import { createContainer } from 'meteor/react-meteor-data';
import React from 'react';
import OpenSettingsListItem from './component';

const OpenSettingsListItemContainer = props => <OpenSettingsListItem {...props} />;

export default createContainer(() => ({
  withModalMounter: withModalMounter(),
}), OpenSettingsListItemContainer);
