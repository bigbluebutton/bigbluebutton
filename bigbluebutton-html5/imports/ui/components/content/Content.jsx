import React from 'react';
import { IconButton } from '../common';

const Content = () => (
  <div id="mainContent" className="flex flex-auto">
    <div className="w-1/2 py-20 bg-gray-100 m-2 rounded-lg relative flex items-center">
      <div className="text-right mx-3 mt-3 absolute top-0 right-0">
        <IconButton
          size="sm"
          icon="minimize"
        />
        <IconButton
          size="sm"
          icon="full-width"
        />
        <IconButton
          size="sm"
          icon="full-window"
        />
      </div>
      <img src="images/l-side.png" alt="" />
      <div className="text-right mx-3 mb-3 absolute bottom-0 right-0">
        <IconButton
          size="sm"
          icon="bi-dash"
        />
        <IconButton
          size="sm"
          icon="bi-plus"
          noMargin
        />
      </div>
    </div>
    <div className="w-1/2 py-20 bg-gray-100 m-2 rounded-lg relative flex items-center">
      <div className="text-right mx-3 mt-3 absolute top-0 right-0">
        <IconButton
          size="sm"
          icon="minimize"
        />
        <IconButton
          size="sm"
          icon="full-width"
        />
        <IconButton
          size="sm"
          icon="full-window"
        />
      </div>
      <img src="images/r-side.png" alt="" />
      <div className="text-right mx-3 mb-3 absolute bottom-0 right-0">
        <IconButton
          size="sm"
          icon="bi-dash"
        />
        <IconButton
          size="sm"
          icon="bi-plus"
          noMargin
        />
      </div>
    </div>
  </div>
);

export default Content;
