import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { withModalMounter } from '../modal/service';

import AppView from './AppView';

const AppContainer = ({ props }) => <AppView {...props} />;

export default withModalMounter(withTracker(() => ({}))(AppContainer));
