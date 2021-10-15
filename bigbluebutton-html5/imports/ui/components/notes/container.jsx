import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Notes from './component';
import Service from './service';
import LayoutContext from '/imports/ui/components/layout/context';

const Container = ({ ...props }) => {
  const layoutContext = useContext(LayoutContext);
  const { layoutContextDispatch, layoutContextState } = layoutContext;
  const { input } = layoutContextState;
  const { cameraDock } = input;
  const { isResizing } = cameraDock;

  return <Notes {...{ layoutContextDispatch, isResizing, ...props }} />;
};

export default withTracker(() => {
  const hasPermission = Service.hasPermission();
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  return {
    hasPermission,
    isRTL,
  };
})(Container);
