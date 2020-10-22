import React from 'react';
import PropTypes from 'prop-types';

import Icon from '/imports/ui/components/Icon';

const Tab = ({
  index,
  icon,
  activeKey,
  onClick,
}) => {
  let tabClass = 'w-full';

  if (index === activeKey) {
    tabClass += ' bg-gray-100 border-l-8 border-blue-600';
  } else {
    tabClass += ' border-b-2 border-gray-200';
  }

  return (
    <li className={tabClass} onClick={onClick} aria-hidden="true">
      <a href="/#" className="p-8 block justify-center flex">
        <Icon icon={icon} />
      </a>
    </li>
  );
};

Tab.defaultProps = {
  icon: '',
  activeKey: 0,
};

Tab.propTypes = {
  index: PropTypes.number.isRequired,
  icon: PropTypes.string,
  activeKey: PropTypes.number,
  onClick: PropTypes.func.isRequired,
};

export default Tab;
