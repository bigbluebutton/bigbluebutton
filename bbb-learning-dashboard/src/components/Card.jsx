import React from 'react';

function Card(props) {
  const {
    number, name, children, iconClass, cardClass,
  } = props;

  let icons;

  try {
    React.Children.only(children);
    icons = (
      <div className={`p-2 text-orange-500 rounded-full ${iconClass}`}>
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
              <div className={`flex justify-center transform translate-x-${offset} border-2 border-white p-2 text-orange-500 rounded-full z-${index * 10} ${iconClass}`}>
                { child }
              </div>
            );
          })
        }
      </div>
    );
  }

  return (
    <div className={`flex items-start justify-between p-3 bg-white rounded shadow border-l-4 border-white ${cardClass}`}>
      <div className="w-70">
        <p className="text-lg font-semibold text-gray-700">
          { number }
        </p>
        <p className="mb-2 text-sm font-medium text-gray-600">
          { name }
        </p>
      </div>
<<<<<<< HEAD
      {icons}
=======
      <div className={`p-3 mr-4 rounded-full ${iconClass || 'text-orange-500'}`}>
        { children }
      </div>
>>>>>>> upstream/v2.4.x-release
    </div>
  );
}

export default Card;
