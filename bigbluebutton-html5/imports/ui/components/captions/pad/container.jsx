import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Session } from 'meteor/session';
import CaptionsService from '/imports/ui/components/captions/service';
import Pad from './component';
import Auth from '/imports/ui/services/auth';
import { NLayoutContext } from '../../layout/context/context';
import { ACTIONS, PANELS } from '../../layout/enums';


const PadContainer = (props) => {
  const newLayoutContext = useContext(NLayoutContext);
  const { newLayoutContextDispatch } = newLayoutContext;
  const {
    amIModerator,
    children,
  } = props;

  if (!amIModerator) {
    newLayoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
      value: false,
    });
    newLayoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
      value: PANELS.NONE,
    });
    return null;
  }

  return (
    <Pad {...{ newLayoutContextDispatch, ...props }}>
      {children}
    </Pad>
  );
};

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
    currentUserId: Auth.userID,
    amIModerator: CaptionsService.amIModerator(),
  };
})(PadContainer);
