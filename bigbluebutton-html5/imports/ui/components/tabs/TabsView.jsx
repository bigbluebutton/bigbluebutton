import React, { useState, Fragment } from 'react';

import Tab from './components/Tab';
import TabContentPpt from './components/TabContentPpt';
import TabContentPdf from './components/TabContentPdf';
import TabContentVideo from './components/TabContentVideo';
import TabContentWeb from './components/TabContentWeb';
import Icon from '/imports/ui/components/Icon';
import IconButton from '/imports/ui/components/common/IconButton';
import PresentationUploaderContainer from '/imports/ui/components/presentation/presentation-uploader/container';

const TabsView = (props) => {
  const [key, setKey] = useState(1);

  const handleTabClick = (tabIndex) => {
    setKey(tabIndex);
  };

  const getComponent = (newKey) => {
    switch (newKey) {
      case 1:
        return <TabContentPpt />;
      case 2:
        return <TabContentPdf />;
      case 3:
        return <TabContentVideo />;
      case 4:
        return <TabContentWeb />;
      default:
        return <TabContentPpt />;
    }
  };

  const { mountModal } = props;

  const handlePresentationClick = () => {
    Session.set('showUploadPresentationView', true);
    mountModal(<PresentationUploaderContainer />);
  };

  return (
    <Fragment>
      <aside className="primary-nav w-1/12">
        <div className="h-24 bg-green-900 rounded-lg text-white font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl justify-center items-center flex m-3">SeeIT</div>
        <ul className="flex flex-col justify-center items-center">
          <Tab
            index={1}
            icon="ppt"
            activeKey={key}
            tabArea="#Link1"
            onClick={() => handleTabClick(1)}
          />
          <Tab
            index={2}
            icon="pdf"
            activeKey={key}
            tabArea="#Link2"
            onClick={() => handleTabClick(2)}
          />
          <Tab
            index={3}
            icon="video"
            activeKey={key}
            tabArea="#Link3"
            onClick={() => handleTabClick(3)}
          />
          <Tab
            index={4}
            icon="www"
            activeKey={key}
            tabArea="#Link4"
            onClick={() => handleTabClick(4)}
          />
          <li className="w-full">
            <button type="button" onClick={handlePresentationClick} className="p-8 block justify-center flex">
              <Icon icon="plus" iconvh="min-w-20 min-h-20" />
            </button>
          </li>
        </ul>
      </aside>
      <aside className="secondary-nav w-3/12 bg-gray-100 flex flex-col">
        <div className="bg-gray-200 w-full px-2 py-4 flex justify-between items-center">
          <h2 className="p-2 text-xl font-medium">Documents</h2>
          <IconButton icon="times" transparent noMargin miscClass="p-2" />
        </div>
        {getComponent(key)}
      </aside>
    </Fragment>
  );
};

export default TabsView;
