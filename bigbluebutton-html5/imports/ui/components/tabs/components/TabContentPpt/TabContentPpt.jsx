import React from 'react';
import PropTypes from 'prop-types';

const TabContentPpt = ({ activeKey, contentKey }) => {
  const contentShow = activeKey ? 'block' : 'hidden';

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
      <span className="rounded-md mx-4 bg-white py-2 px-3 flex justify-between mb-3">
        <button type="button" className="bg-transparent">
          <img src="images/active-full.svg" className="h-12 w-24 p-1 bg-gray-100 rounded" alt="" />
        </button>
        <button type="button" className="bg-transparent">
          <img src="images/active-left.svg" className="h-12 w-24 p-1 bg-gray-100 rounded border border-blue-500" alt="" />
        </button>
        <button type="button" className="bg-transparent">
          <img src="images/active-right.svg" className="h-12 w-24 p-1 bg-gray-100 rounded" alt="" />
        </button>
      </span>

      <ul>
        <li className="p-3">
          <a href="/#">
                        Slide 1
            <img src="images/slide-1.png" alt="" />
          </a>
        </li>
        <li className="p-3">
          <a href="/#">
                        Slide 2
            <img src="images/slide-2.png" alt="" />
          </a>
        </li>
        <li className="bg-gray-300 p-3">
          <a href="/#">
                        Slide 3
            <img src="images/r-side.png" alt="" />
          </a>
        </li>
        <li className="p-3">
          <a href="/#">
                        Slide 4
            <img src="images/l-side.png" alt="" />
          </a>
        </li>
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
