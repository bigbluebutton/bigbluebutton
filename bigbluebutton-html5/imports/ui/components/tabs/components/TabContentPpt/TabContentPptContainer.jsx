import React, { useState } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Service from '../../service';
import PresentationService from '/imports/ui/components/presentation/presentation-uploader/service';
import TabContentPpt from './TabContentPpt';

const TabContentPptContainer = (props) => {
  const options = [];
  const allOptionPages = [];
  let Slides = null;

  const [selectedValue, setSelectedValue] = useState(null);

  const handleChange = (e) => {
    setSelectedValue(e.value);
  };

  const { presentations } = props;

  presentations.forEach((element) => {
    options.push({
      value: element.id,
      label: element.filename,
    });
    allOptionPages[element.id] = element.pages.sort((a, b) => a.num - b.num);
  });

  const NoOptionMessage = 'No Presentations';

  Slides = allOptionPages[selectedValue];

  return (
    <TabContentPpt
      {...props}
      options={options}
      selectedOption={selectedValue}
      Slides={Slides}
      NoOptionMessage={NoOptionMessage}
      onChange={e => handleChange(e)}
    />
  );
};

export default withTracker(({ fileType }) => ({
  amIPresenter: Service.amIPresenter(),
  amIModerator: Service.amIModerator(),
  handleTakePresenter: Service.takePresenterRole,
  isMeteorConnected: Meteor.status().connected,
  presentations: PresentationService.getPresentationsByFileType(fileType),
}))(TabContentPptContainer);
