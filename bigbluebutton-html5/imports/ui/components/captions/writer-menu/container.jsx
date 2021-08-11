import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { withModalMounter } from '/imports/ui/components/modal/service';
import CaptionsService from '/imports/ui/components/captions/service';
import WriterMenu from './component';
import LayoutContext from '../../layout/context';

const WriterMenuContainer = (props) => {
  const layoutContext = useContext(LayoutContext);
  const { layoutContextDispatch } = layoutContext;
  return <WriterMenu {...{ layoutContextDispatch, ...props }} />;
};

export default withModalMounter(withTracker(({ mountModal }) => ({
  closeModal: () => mountModal(null),
  allLocales: CaptionsService.getAvailableLocales(),
  takeOwnership: (locale) => CaptionsService.takeOwnership(locale),
}))(WriterMenuContainer));
