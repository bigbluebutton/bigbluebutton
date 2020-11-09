import React, { useState } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Service from './service';
import { withModalMounter } from '/imports/ui/components/modal/service';
import ExternalVideoService from '/imports/ui/components/external-video-player/service';
import PresentationService from '../presentation/presentation-uploader/service';
import PresentationUploaderContainer from '/imports/ui/components/presentation/presentation-uploader/container';
import { UPLOAD_FILE_TYPES } from '/imports/api/presentations/constants';

import TabsView from './TabsView';

const TABS = [
  {
    id: 0,
    fileType: UPLOAD_FILE_TYPES.PPT,
    icon: 'ppt',
  },
  {
    id: 1,
    fileType: UPLOAD_FILE_TYPES.PDF,
    icon: 'pdf',
  },
  {
    id: 2,
    fileType: UPLOAD_FILE_TYPES.PDF,
    icon: 'video',
  },
  {
    id: 3,
    fileType: UPLOAD_FILE_TYPES.PDF,
    icon: 'www',
  },
];


const TabsContainer = ({ mountModal, ...props }) => {
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);

  const SELECTED_OPTION_BY_TYPE = {
    [UPLOAD_FILE_TYPES.PPT]: null,
    [UPLOAD_FILE_TYPES.PDF]: null,
  };

  const handleTabClick = (value) => {
    setTabIndex(value);
  };

  const handleSelectedOption = (e, fileType) => {
    setSelectedOption(SELECTED_OPTION_BY_TYPE[fileType] = e.value);
  };

  const handlePresentationClick = () => {
    Session.set('showUploadPresentationView', true);
    mountModal(<PresentationUploaderContainer />);
  };

  return (
    <TabsView
      {...props}
      selectedIndex={tabIndex}
      tabsCollection={TABS}
      onTabClick={handleTabClick}
      onPresentationClick={handlePresentationClick}
      selectedOption={selectedOption}
      onSelectoption={handleSelectedOption}
    />
  );
};

export default withModalMounter(withTracker(() => ({
  amIPresenter: Service.amIPresenter(),
  amIModerator: Service.amIModerator(),
  allowExternalVideo: Meteor.settings.public.externalVideoPlayer.enabled,
  handleTakePresenter: Service.takePresenterRole,
  isSharingVideo: Service.isSharingVideo(),
  stopExternalVideoShare: ExternalVideoService.stopWatching,
  isMeteorConnected: Meteor.status().connected,
  presentations: PresentationService.getPresentations(),
}))(TabsContainer));
