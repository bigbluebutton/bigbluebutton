import React from 'react';
import { injectIntl } from 'react-intl';
import UserInfo from './component';

const UserInfoContainer = props => <UserInfo {...props} />;

export default injectIntl(UserInfoContainer);
