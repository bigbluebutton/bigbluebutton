import React from 'react';
import { injectIntl } from 'react-intl';
import ActivityCheck from './component';

const ActivityCheckContainer = props => <ActivityCheck {...props} />;

export default injectIntl(ActivityCheckContainer);
