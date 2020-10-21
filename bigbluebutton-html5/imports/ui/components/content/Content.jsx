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
        >
          <svg className="fill-current w-4 h-4 bi bi-dash" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M3.5 8a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 0 1H4a.5.5 0 0 1-.5-.5z" />
          </svg>
        </IconButton>
        <IconButton
          size="sm"
          noMargin
        >
          <svg className="fill-current w-4 h-4 bi bi-plus" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M8 3.5a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5H4a.5.5 0 0 1 0-1h3.5V4a.5.5 0 0 1 .5-.5z" />
            <path fillRule="evenodd" d="M7.5 8a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1H8.5V12a.5.5 0 0 1-1 0V8z" />
          </svg>
        </IconButton>
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
        >
          <svg className="fill-current w-4 h-4 bi bi-dash" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M3.5 8a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 0 1H4a.5.5 0 0 1-.5-.5z" />
          </svg>
        </IconButton>
        <IconButton
          size="sm"
          noMargin
        >
          <svg className="fill-current w-4 h-4 bi bi-plus" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M8 3.5a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5H4a.5.5 0 0 1 0-1h3.5V4a.5.5 0 0 1 .5-.5z" />
            <path fillRule="evenodd" d="M7.5 8a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1H8.5V12a.5.5 0 0 1-1 0V8z" />
          </svg>
        </IconButton>
      </div>
    </div>
  </div>
);

export default Content;
