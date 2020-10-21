import React, { useState } from 'react';

import Tab from './components/Tab';
import TabContentPpt from './components/TabContentPpt';
import TabContentPdf from './components/TabContentPdf';
import TabContentVideo from './components/TabContentVideo';
import TabContentWeb from './components/TabContentWeb';


const Tabs = () => {
  const [key, setKey] = useState(1);
  return (
    <>
      <aside className="primary-nav w-1/12">
        <div className="h-24 bg-green-900 rounded-lg text-white font-bold text-3xl justify-center items-center flex m-3">SeeIT</div>

        <ul className="flex flex-col justify-center items-center">
          <Tab
            index={1}
            icon="ppt"
            activeKey={key}
            tabArea="#Link1"
            onClickEvent={(e) => {
              e.preventDefault();
              setKey(1);
            }}
          />
          <Tab
            index={2}
            icon="pdf"
            activeKey={key}
            tabArea="#Link2"
            onClickEvent={(e) => {
              e.preventDefault();
              setKey(2);
            }}
          />
          <Tab
            index={3}
            icon="video"
            activeKey={key}
            tabArea="#Link3"
            onClickEvent={(e) => {
              e.preventDefault();
              setKey(3);
            }}
          />
          <Tab
            index={4}
            icon="www"
            activeKey={key}
            tabArea="#Link3"
            onClickEvent={(e) => {
              e.preventDefault();
              setKey(4);
            }}
          />
          <li className="w-full">
            <a href="/#" className="p-8 block justify-center flex">
              <img src="images/plus.svg" className="fill-current" alt="" />
            </a>
          </li>
        </ul>
      </aside>

      <aside className="secondary-nav w-3/12 bg-gray-100 flex flex-col">
        <div className="bg-gray-200 w-full px-2 py-4 flex justify-between items-center">
          <h2 className="p-2 text-xl font-medium">Documents</h2>
          <button type="button" className="bg-transparent p-2">
            <img src="images/times.svg" className="fill-current" alt="" />
          </button>
        </div>

        <TabContentPpt
          activeKey={key}
          contentKey={1}
        />

        <TabContentPdf
          activeKey={key}
          contentKey={2}
        />
        <TabContentVideo
          activeKey={key}
          contentKey={3}
        />
        <TabContentWeb
          activeKey={key}
          contentKey={4}
        />
      </aside>
    </>
  );
};

export default Tabs;
