import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import QuestionsListItem from './component';
import Service from '/imports/ui/components/questions/service';
import { layoutDispatch, layoutSelectInput } from '../../layout/context';

const QuestionsListItemContainer = (props) => {
  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const layoutContextDispatch = layoutDispatch();
  const { sidebarContentPanel } = sidebarContent;

  return (
    <QuestionsListItem
      {...{
        sidebarContentPanel,
        layoutContextDispatch,
        ...props,
      }}
    />
  );
};

export default withTracker(() => ({
  questions: Service.getUnreadQuestions(),
  isEnabled: Service.isEnabled(),
}))(QuestionsListItemContainer);
