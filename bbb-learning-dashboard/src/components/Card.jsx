import React from 'react';

function Card(props) {
  const {
    number, name, children, iconClass, cardClass,
  } = props;

  return (
    <div className={`flex items-center justify-between p-4 bg-white rounded-md shadow border-l-8 ${cardClass}`}>
      <div className="w-70">
        <p className="text-lg font-semibold text-gray-700">
          { number }
        </p>
        <p className="mb-2 text-sm font-medium text-gray-600">
          { name }
        </p>
      </div>
      <div className={`p-3 mr-4 rounded-full ${iconClass || 'text-orange-500'}`}>
        { children }
      </div>
    </div>
  );
}

export default Card;
