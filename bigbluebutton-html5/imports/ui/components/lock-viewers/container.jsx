import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { injectIntl, defineMessages } from 'react-intl';
import { withModalMounter } from '/imports/ui/components/modal/service';
import LockViewersComponent from './component';

const LockViewersContainer = props => <LockViewersComponent {...props} />;

export default withModalMounter(withTracker(({ mountModal }) => {
    return ({
      closeModal () {
        mountModal(null);
      }
    });
  })(LockViewersContainer));