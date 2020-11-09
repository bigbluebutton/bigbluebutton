import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Service from '../../service';
import PresentationService from '/imports/ui/components/presentation/presentation-uploader/service';
import TabContent from './TabContent';

const TabContentContainer = (props) => {
  const options = [];

  const allOptionPages = [];

  let Pages = null;

  const {
    presentations, fileType, onSelectoption, selectedOption,
  } = props;

  presentations.forEach((element) => {
    options.push({
      value: element.id,
      label: element.filename,
    });

    allOptionPages[element.id] = element.pages.sort((a, b) => a.num - b.num);
  });

  Pages = allOptionPages[selectedOption];

  const NoOptionMessage = (fileType === 'PDF') ? 'No Documents' : 'No Presentations';

  const SlideType = (fileType === 'PDF') ? 'Page' : 'Slide';


  return (
    <TabContent
      {...props}
      options={options}
      selectedOption={selectedOption}
      Pages={Pages}
      NoOptionMessage={NoOptionMessage}
      SlideType={SlideType}
      onChange={e => onSelectoption(e, fileType)}
    />
  );
};

export default withTracker(({ fileType }) => ({
  amIPresenter: Service.amIPresenter(),
  amIModerator: Service.amIModerator(),
  handleTakePresenter: Service.takePresenterRole,
  isMeteorConnected: Meteor.status().connected,
  presentations: PresentationService.getPresentationsByFileType(fileType),
}))(TabContentContainer);
