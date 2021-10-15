import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Service from '/imports/ui/components/captions/service';
import Captions from './component';
import Auth from '/imports/ui/services/auth';
import LayoutContext from '/imports/ui/components/layout/context';
import { ACTIONS, PANELS } from '/imports/ui/components/layout/enums';

const Container = (props) => {
  const layoutContext = useContext(LayoutContext);
  const { layoutContextDispatch, layoutContextState } = layoutContext;
  const { input } = layoutContextState;
  const { cameraDock } = input;
  const { isResizing } = cameraDock;

  const { amIModerator } = props;

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

  return <Captions {...{ layoutContextDispatch, isResizing, ...props }} />;
};

export default withTracker(() => {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
  const {
    locale,
    name,
    ownerId,
    dictating,
  } = Service.getCaptions();

  return {
    locale,
    name,
    ownerId,
    dictation: Service.canIDictateThisPad(ownerId),
    dictating,
    currentUserId: Auth.userID,
    isRTL,
    hasPermission: Service.hasPermission(),
    amIModerator: Service.amIModerator(),
  };
})(Container);
