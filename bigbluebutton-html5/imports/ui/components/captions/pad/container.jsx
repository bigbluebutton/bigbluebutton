import React, { PureComponent } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Session } from 'meteor/session';
import Pad from './component';
import CaptionsService from '/imports/ui/components/captions/service';

class PadContainer extends PureComponent {
  render() {
    return (
      <Pad {...this.props}>
        {this.props.children}
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
    amIModerator: CaptionsService.amIModerator(),
  };
})(PadContainer);
