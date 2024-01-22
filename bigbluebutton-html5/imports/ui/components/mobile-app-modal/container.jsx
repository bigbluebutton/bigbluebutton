import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import MobileAppModalGraphqlContainer from './mobile-app-modal-graphql/component';

import MobileAppModal from './component';

const MobileAppModalContainer = (props) => <MobileAppModal {...props} />;

withTracker(() => {})(MobileAppModalContainer);

export default MobileAppModalGraphqlContainer;
