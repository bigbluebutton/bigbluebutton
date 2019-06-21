import React, { PureComponent } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Session } from 'meteor/session';
import CaptionsService from '/imports/ui/components/captions/service';
import PadService from './service';
import Pad from './component';

class PadContainer extends PureComponent {
  render() {
    const { children } = this.props;
    return (
      <Pad {...this.props}>
        {children}
      </Pad>
    );
  }
}

export default withTracker(() => {
  const locale = Session.get('captionsLocale');
  const caption = CaptionsService.getCaptions(locale);
  const {
    padId,
    ownerId,
    readOnlyPadId,
  } = caption;

  const { name } = caption ? caption.locale : '';

  return {
    locale,
    name,
    ownerId,
    padId,
    readOnlyPadId,
    currentUserId: PadService.getCurrentUser().userId,
    amIModerator: CaptionsService.amIModerator(),
  };
})(PadContainer);
