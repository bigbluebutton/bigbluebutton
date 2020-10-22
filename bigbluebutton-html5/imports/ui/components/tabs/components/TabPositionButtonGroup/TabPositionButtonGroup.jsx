import React, { useState } from 'react';

import Icon from '/imports/ui/components/Icon';

const TabPositionButtonGroup = () => {
  const [position, setPosition] = useState('full');

  const handleButtonClick = (newPosition) => {
    setPosition(newPosition);
  };

  return (
    <span className="rounded-md mx-4 bg-white py-2 px-3 flex justify-between mb-3">
      <button
        type="button"
        className="bg-transparent"
        selected={position === 'full'}
        onClick={() => handleButtonClick('full')}
      >
        <Icon icon="active-full" className="h-12 w-24 p-1 bg-gray-100 rounded" />
      </button>
      <button
        type="button"
        className="bg-transparent"
        selected={position === 'left'}
        onClick={() => handleButtonClick('left')}
      >
        <Icon icon="active-left" className="h-12 w-24 p-1 bg-gray-100 rounded" />
      </button>

      <button
        type="button"
        className="bg-transparent"
        selected={position === 'right'}
        onClick={() => handleButtonClick('right')}
      >
        <Icon icon="active-right" className="h-12 w-24 p-1 bg-gray-100 rounded" />
      </button>
    </span>
  );
};

export default TabPositionButtonGroup;
