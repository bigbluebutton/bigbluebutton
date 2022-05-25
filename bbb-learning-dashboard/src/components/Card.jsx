import React from 'react';

function Card(props) {
  const {
    number, name, children, iconClass, cardClass,
  } = props;

  let icons;

  try {
    React.Children.only(children);
    icons = (
      <div className={`p-2 rounded-full ${iconClass || 'text-orange-500'}`}>
        { children }
      </div>
    );
  } catch (e) {
    icons = (
      <div className="flex">
        {
          React.Children.map(children, (child, index) => {
            let offset = 4 / (index + 1);
            offset = index === (React.Children.count(children) - 1) ? 0 : offset;

            return (
              <div className={`flex justify-center transform translate-x-${offset} border-2 border-white p-2 rounded-full z-${index * 10} ${iconClass || 'text-orange-500'}`}>
                { child }
              </div>
            );
          })
        }
      </div>
    );
  }

  return (
    <div
      className={
        'flex items-start justify-between p-3 bg-white rounded shadow border-l-4'
        + ` ${cardClass}`
      }
    >
      <div className="w-70">
        <p className="text-lg font-semibold text-gray-700">
          { number }
        </p>
        <p className="mb-2 text-sm font-medium text-gray-600">
          { name }
        </p>
      </div>
      {icons}
    </div>
  );
}

export default Card;
