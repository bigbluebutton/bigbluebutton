import React, { useState, Fragment } from 'react';

import Tab from './components/Tab';
import TabContentPpt from './components/TabContentPpt';
import TabContentPdf from './components/TabContentPdf';
import TabContentVideo from './components/TabContentVideo';
import TabContentWeb from './components/TabContentWeb';
import Icon from '/imports/ui/components/Icon';
import IconButton from '/imports/ui/components/common/IconButton';

const Tabs = () => {
  const [key, setKey] = useState(1);

  const handleTabClick = (tabIndex) => {
    setKey(tabIndex);
  };

  return (
    <Fragment>
      <aside className="primary-nav w-1/12">
        <div className="h-24 bg-green-900 rounded-lg text-white font-bold text-3xl justify-center items-center flex m-3">SeeIT</div>

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
            <a href="/#" className="p-8 block justify-center flex">
              <Icon icon="plus" />
            </a>
          </li>
        </ul>
      </aside>

      <aside className="secondary-nav w-3/12 bg-gray-100 flex flex-col">
        <div className="bg-gray-200 w-full px-2 py-4 flex justify-between items-center">
          <h2 className="p-2 text-xl font-medium">Documents</h2>
          <IconButton icon="times" transparent noMargin miscClass="p-2" />
        </div>

        {key === 1 && <TabContentPpt />}

        {key === 2 && <TabContentPdf />}

        {key === 3 && <TabContentVideo />}

        {key === 4 && <TabContentWeb />}

      </aside>
    </Fragment>
  );
};

export default Tabs;
