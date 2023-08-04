import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Questions from './component';
import Service from './service';
import { layoutSelectInput, layoutDispatch } from '../layout/context';

const QuestionsContainer = ({ children, ...props }) => {
  const cameraDock = layoutSelectInput((i) => i.cameraDock);
  const { isResizing } = cameraDock;
  return (
    <Questions {...{ layoutContextDispatch: layoutDispatch(), isResizing, ...props }}>
      {children}
    </Questions>
  );
};

export default withTracker(() => {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
  return {
    isRTL,
    isModeratorOrPresenter: Service.isModerator() || Service.isPresenter(),
    isEnabled: Service.isEnabled(),
    publicQuestions: Service.getPublicQuestions(),
    privateQuestions: Service.getPrivateQuestions(),
    autoApproveQuestions: Service.getAutoApproveQuestions(),
  };
})(QuestionsContainer);
