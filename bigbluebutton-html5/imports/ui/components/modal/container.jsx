import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { getModal } from './service';

export default withTracker(() => ({ modalComponent: getModal() }))(({ modalComponent }) => modalComponent);
