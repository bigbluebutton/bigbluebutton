import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Service from '/imports/ui/components/captions/service';
import WriterMenu from './component';
import { layoutDispatch } from '../../layout/context';

const WriterMenuContainer = (props) => {
  const layoutContextDispatch = layoutDispatch();

  return <WriterMenu {...{ layoutContextDispatch, ...props }} />;
};

export default withTracker(({ setIsOpen }) => ({
  closeModal: () => setIsOpen(false),
  availableLocales: Service.getAvailableLocales(),
}))(WriterMenuContainer);
