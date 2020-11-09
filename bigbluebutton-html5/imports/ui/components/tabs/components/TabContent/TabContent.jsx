import React, { Fragment } from 'react';
import Select from 'react-select';
import TabPositionButtonGroup from '../TabPositionButtonGroup';
import Slide from '../Slide';

const TabContent = ({
  options, selectedOption, Pages, NoOptionMessage, onChange, SlideType,
}) => (
  <Fragment>
    <div className="w-full py-3 flex flex-col" id="#Link2">
      <TabPositionButtonGroup />
      <div className="rounded-md mx-4 shadow-sm mb-3">
        <Select
          className="font-semibold"
          options={options}
          value={options.find(obj => obj.value === selectedOption)}
          noOptionsMessage={() => NoOptionMessage}
          onChange={e => onChange(e)}
        />
      </div>
    </div>
    <div className="overflow-y-scroll">
      {
          Pages ? (
            <ul>
              {
                Pages.map(({ id, thumbUri }, k) => (
                  <Slide key={id} name={`${SlideType} ${k + 1}`} image={thumbUri} />
                ))
              }
            </ul>
          ) : null
      }
    </div>
  </Fragment>
);
export default TabContent;
