import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { withModalMounter } from '/imports/ui/components/modal/service';
import CaptionsService from '/imports/ui/components/captions/service';
import WriterMenu from './component';
import NewLayoutContext from '../../layout/context/context';

const WriterMenuContainer = (props) => {
  const { newLayoutContextState, ...rest } = props;
  return <WriterMenu {...rest} />;
};

export default withModalMounter(withTracker(({ mountModal }) => ({
  closeModal: () => mountModal(null),
  allLocales: CaptionsService.getAvailableLocales(),
  takeOwnership: locale => CaptionsService.takeOwnership(locale),
}))(NewLayoutContext.withConsumer(WriterMenuContainer)));
