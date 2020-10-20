import React from 'react';

const Content = () => (
  <div id="mainContent" className="flex flex-auto">
    <div className="w-1/2 py-20 bg-gray-100 m-2 rounded-lg relative flex items-center">
      <div className="w-full">
        <div className="w-1/2">
          <div className="mx-3 mt-3 absolute top-0 left-0">
            <button type="button" className="bg-green-900 mr-2 hover:bg-green-800 text-white font-bold p-3 rounded-md inline-flex items-center">
              <img src="images/edit.svg" className="fill-current w-4 h-4" alt="" />
            </button>
            <button type="button" className="bg-green-900 mr-2 hover:bg-green-800 text-white font-bold p-3 rounded-md inline-flex items-center">
              <img src="images/undo.svg" className="fill-current w-4 h-4" alt="" />
            </button>
            <button type="button" className="bg-green-900 mr-2 hover:bg-green-800 text-white font-bold p-3 rounded-md inline-flex items-center">
              <img src="images/delete.svg" className="fill-current w-4 h-4" alt="" />
            </button>
            <button type="button" className="bg-green-900 mr-2 hover:bg-green-800 text-white font-bold p-3 rounded-md inline-flex items-center">
              <img src="images/whiteboard.svg" className="fill-current w-4 h-4" alt="" />
            </button>
          </div>
        </div>
        <div className="w-1/2">
          <div className="text-right mx-3 mt-3 absolute top-0 right-0">
            <button type="button" className="bg-white mr-2 hover:bg-gray-200 text-gray-800 font-bold p-3 rounded-md inline-flex items-center">
              <img src="images/minimize.svg" className="fill-current w-4 h-4" alt="" />
            </button>
            <button type="button" className="bg-white mr-2 hover:bg-gray-200 text-gray-800 font-bold p-3 rounded-md inline-flex items-center">
              <img src="images/full-width.svg" className="fill-current w-4 h-4" alt="" />
            </button>
            <button type="button" className="bg-white hover:bg-gray-200 text-gray-800 font-bold p-3 rounded-md inline-flex items-center">
              <img src="images/full-window.svg" className="fill-current w-4 h-4" alt="" />
            </button>
          </div>
        </div>
      </div>
      <img src="images/l-side.png" alt="" />
      <div className="text-right mx-3 mb-3 absolute bottom-0 right-0">
        <button type="button" className="bg-white mr-2 hover:bg-gray-200 text-gray-800 font-bold p-3 rounded-md inline-flex items-center">
          <svg className="fill-current w-4 h-4 bi bi-dash" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M3.5 8a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 0 1H4a.5.5 0 0 1-.5-.5z" />
          </svg>
        </button>
        <button type="button" className="bg-white hover:bg-gray-200 text-gray-800 font-bold p-3 rounded-md inline-flex items-center">
          <svg className="fill-current w-4 h-4 bi bi-plus" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M8 3.5a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5H4a.5.5 0 0 1 0-1h3.5V4a.5.5 0 0 1 .5-.5z" />
            <path fillRule="evenodd" d="M7.5 8a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1H8.5V12a.5.5 0 0 1-1 0V8z" />
          </svg>
        </button>
      </div>
    </div>
    <div className="w-1/2 py-20 bg-gray-100 m-2 rounded-lg relative flex items-center">
      <div className="w-full">
        <div className="w-1/2">
          <div className="mx-3 mt-3 absolute top-0 left-0">
            <button type="button" className="bg-green-900 mr-2 hover:bg-green-800 text-white font-bold p-3 rounded-md inline-flex items-center">
              <img src="images/edit.svg" className="fill-current w-4 h-4" alt="" />
            </button>
            <button type="button" className="bg-green-900 mr-2 hover:bg-green-800 text-white font-bold p-3 rounded-md inline-flex items-center">
              <img src="images/undo.svg" className="fill-current w-4 h-4" alt="" />
            </button>
            <button type="button" className="bg-green-900 mr-2 hover:bg-green-800 text-white font-bold p-3 rounded-md inline-flex items-center">
              <img src="images/delete.svg" className="fill-current w-4 h-4" alt="" />
            </button>
            <button type="button" className="bg-green-900 mr-2 hover:bg-green-800 text-white font-bold p-3 rounded-md inline-flex items-center">
              <img src="images/whiteboard.svg" className="fill-current w-4 h-4" alt="" />
            </button>
          </div>
        </div>
        <div className="w-1/2">
          <div className="text-right mx-3 mt-3 absolute top-0 right-0">
            <button type="button" className="bg-white mr-2 hover:bg-gray-200 text-gray-800 font-bold p-3 rounded-md inline-flex items-center">
              <img src="images/minimize.svg" className="fill-current w-4 h-4" alt="" />
            </button>
            <button type="button" className="bg-white mr-2 hover:bg-gray-200 text-gray-800 font-bold p-3 rounded-md inline-flex items-center">
              <img src="images/full-width.svg" className="fill-current w-4 h-4" alt="" />
            </button>
            <button type="button" className="bg-white hover:bg-gray-200 text-gray-800 font-bold p-3 rounded-md inline-flex items-center">
              <img src="images/full-window.svg" className="fill-current w-4 h-4" alt="" />
            </button>
          </div>
        </div>
      </div>
      <img src="images/r-side.png" alt="" />
      <div className="text-right mx-3 mb-3 absolute bottom-0 right-0">
        <button type="button" className="bg-white mr-2 hover:bg-gray-200 text-gray-800 font-bold p-3 rounded-md inline-flex items-center">
          <svg className="fill-current w-4 h-4 bi bi-dash" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M3.5 8a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 0 1H4a.5.5 0 0 1-.5-.5z" />
          </svg>
        </button>
        <button type="button" className="bg-white hover:bg-gray-200 text-gray-800 font-bold p-3 rounded-md inline-flex items-center">
          <svg className="fill-current w-4 h-4 bi bi-plus" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M8 3.5a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5H4a.5.5 0 0 1 0-1h3.5V4a.5.5 0 0 1 .5-.5z" />
            <path fillRule="evenodd" d="M7.5 8a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1H8.5V12a.5.5 0 0 1-1 0V8z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
);

export default Content;
