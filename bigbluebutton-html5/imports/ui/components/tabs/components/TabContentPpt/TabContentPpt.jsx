import React from 'react';
import PropTypes from 'prop-types';

import TabPositionButtonGroup from '../TabPositionButtonGroup';
import Slide from '../Slide';

const TabContentPpt = ({ activeKey, contentKey }) => {
  const contentShow = activeKey === 1 ? 'block' : 'hidden';

  return (
    <div className={`w-full py-3 flex flex-col overflow-y-scroll ${contentShow}`} id={`link${contentKey}`}>
      <span className="rounded-md mx-4 shadow-sm mb-3">
        <button type="button" className="inline-flex items-center w-full rounded-md p-4 bg-white text-sm leading-5 font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-50 active:text-gray-800 transition ease-in-out duration-150 font-bold text-lg" id="options-menu" aria-haspopup="true" aria-expanded="true">
          <img src="images/ppt.svg" className="w-1/12" alt="" />
          <span className="w-10/12 text-left pl-4">PitchDeck ver2.1</span>
          <svg className="-mr-1 ml-2 h-5 w-5" viewBox="0 0 20 20" fill="blue">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </span>
      <TabPositionButtonGroup />

      <ul>
        <Slide name="Slide 1" image="images/slide-1.png" />
        <Slide name="Slide 2" image="images/slide-2.png" />
        <Slide name="Slide 3" image="images/r-side.png" />
        <Slide name="Slide 4" image="images/l-side.png" />
      </ul>
    </div>

  );
};

TabContentPpt.defaultProps = {
  activeKey: 0,
  contentKey: 1,
};

TabContentPpt.propTypes = {
  activeKey: PropTypes.number,
  contentKey: PropTypes.number,
};

export default TabContentPpt;
