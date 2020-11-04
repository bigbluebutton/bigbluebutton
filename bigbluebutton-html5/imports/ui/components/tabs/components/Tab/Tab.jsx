import React from 'react';
import Icon from '/imports/ui/components/Icon';

const Tab = ({
  index,
  icon,
  activeKey,
  tabArea,
  onClick,
}) => {
  let tabClass = 'w-full';
  const iconMinVh = 'min-w-20 min-h-20';
  if (index === activeKey) {
    tabClass += ' bg-gray-100 border-l-8 border-blue-600';
  } else {
    tabClass += ' border-b-2 border-gray-200';
  }

  return (
    <li className={tabClass} onClick={onClick} aria-hidden="true">
      <a href={tabArea} className="p-8 block justify-center flex">
        <Icon icon={icon} iconvh={iconMinVh} />
      </a>
    </li>
  );
};

export default Tab;
