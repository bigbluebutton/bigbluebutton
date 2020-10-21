import React from 'react';
import PropTypes from 'prop-types';

const Tab = ({
  index,
  icon,
  activeKey,
  tabArea,
  onClickEvent,
}) => {
  let tabClass = 'w-full';

  if (index === activeKey) {
    tabClass += 'bg-gray-100 border-l-8 border-blue-600';
  } else {
    tabClass += 'border-b-2 border-gray-200';
  }

  return (
    <li className={tabClass} onClick={onClickEvent} aria-hidden="true">
      <a href={tabArea} className="p-8 block justify-center flex">
        <img src={`images/${icon}.svg`} className="fill-current" alt="" />
      </a>
    </li>
  );
};

Tab.defaultProps = {
  icon: '',
  tabArea: '/#',
  activeKey: 0,
};

Tab.propTypes = {
  index: PropTypes.number.isRequired,
  icon: PropTypes.string,
  activeKey: PropTypes.number,
  tabArea: PropTypes.string,
  onClickEvent: PropTypes.func.isRequired,
};

export default Tab;
