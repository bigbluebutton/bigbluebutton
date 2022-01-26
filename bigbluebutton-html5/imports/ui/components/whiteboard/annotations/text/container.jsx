import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import TextShapeService from './service';
import TextDrawComponent from './component';
import WhiteboardService from '/imports/ui/components/whiteboard/service';
import { UsersContext } from '/imports/ui/components/components-data/users-context/context';
import Auth from '/imports/ui/services/auth';

const TextDrawContainer = (props) => {
  const { isMultiUser, activeTextShapeId, annotation } = props;

  const usingUsersContext = useContext(UsersContext);
  const { users } = usingUsersContext;
  const currentUser = users[Auth.meetingID][Auth.userID];
  const userIsPresenter = currentUser.presenter;

  let isActive = false;

  if ((userIsPresenter || isMultiUser) && activeTextShapeId === annotation.id) {
    isActive = true;
  }

  return <TextDrawComponent isActive={isActive} {...props} />;
};

export default withTracker((params) => {
  const { whiteboardId } = params;
  const isMultiUser = WhiteboardService.isMultiUserActive(whiteboardId);
  const activeTextShapeId = TextShapeService.activeTextShapeId();

  return {
    setTextShapeValue: TextShapeService.setTextShapeValue,
    resetTextShapeActiveId: TextShapeService.resetTextShapeActiveId,
    isMultiUser,
    activeTextShapeId,
  };
})(TextDrawContainer);
