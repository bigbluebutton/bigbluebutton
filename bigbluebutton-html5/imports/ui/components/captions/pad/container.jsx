import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Session } from 'meteor/session';
import CaptionsService from '/imports/ui/components/captions/service';
import Pad from './component';
import Auth from '/imports/ui/services/auth';
import LayoutContext from '../../layout/context';
import { ACTIONS, PANELS } from '../../layout/enums';

const PadContainer = (props) => {
  const layoutContext = useContext(LayoutContext);
  const { layoutContextDispatch, layoutContextState } = layoutContext;
  const { input } = layoutContextState;
  const { cameraDock } = input;
  const { isResizing } = cameraDock;

  const {
    amIModerator,
    children,
  } = props;

  if (!amIModerator) {
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
      value: false,
    });
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
      value: PANELS.NONE,
    });
    return null;
  }

  return (
    <Pad {...{ layoutContextDispatch, isResizing, ...props }}>
      {children}
    </Pad>
  );
};

export default withTracker(() => {
  const locale = Session.get('captionsLocale');
  const caption = CaptionsService.getCaptions(locale);
  const {
    name,
    ownerId,
  } = caption;

  return {
    locale,
    name,
    ownerId,
    currentUserId: Auth.userID,
    amIModerator: CaptionsService.amIModerator(),
  };
})(PadContainer);
