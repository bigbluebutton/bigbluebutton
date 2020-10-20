import React from 'react';

const AppView = () => (
  <div id="main" className="flex h-screen">
    <aside className="primary-nav w-1/12">
      <div className="h-24 bg-green-900 rounded-lg text-white font-bold text-3xl justify-center items-center flex m-3">SeeIT</div>
      <ul className="flex flex-col justify-center items-center">
        <li className="bg-gray-100 border-l-8 border-blue-600 w-full">
          <a href="/#" className="p-8 block justify-center flex">
            <img src="assets/images/ppt.svg" className="fill-current" alt="" />
          </a>
        </li>
        <li className="w-full border-b-2 border-gray-200">
          <a href="/#" className="p-8 block justify-center flex">
            <img src="assets/images/pdf.svg" className="fill-current" alt="" />
          </a>
        </li>
        <li className="w-full border-b-2 border-gray-200">
          <a href="/#" className="p-8 block justify-center flex">
            <img src="assets/images/video.svg" className="fill-current" alt="" />
          </a>
        </li>
        <li className="w-full border-b-2 border-gray-200">
          <a href="/#" className="p-8 block justify-center flex">
            <img src="assets/images/www.svg" className="fill-current" alt="" />
          </a>
        </li>
        <li className="w-full">
          <a href="/#" className="p-8 block justify-center flex">
            <img src="assets/images/plus.svg" className="fill-current" alt="" />
          </a>
        </li>
      </ul>
    </aside>
    <aside className="secondary-nav w-3/12 bg-gray-100 flex flex-col">
      <div className="bg-gray-200 w-full px-2 py-4 flex justify-between items-center">
        <h2 className="p-2 text-xl font-medium">Documents</h2>
        <button type="button" className="bg-transparent p-2">
          <img src="assets/images/times.svg" className="fill-current" alt="" />
        </button>
      </div>
      <div className="w-full py-3 flex flex-col overflow-y-scroll">
        <span className="rounded-md mx-4 shadow-sm mb-3">
          <button type="button" className="inline-flex items-center w-full rounded-md p-4 bg-white text-sm leading-5 font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-50 active:text-gray-800 transition ease-in-out duration-150 font-bold text-lg" id="options-menu" aria-haspopup="true" aria-expanded="true">
            <img src="assets/images/ppt.svg" className="w-1/12" alt="" />
            <span className="w-10/12 text-left pl-4">PitchDeck ver2.1</span>
            <svg className="-mr-1 ml-2 h-5 w-5" viewBox="0 0 20 20" fill="blue">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </span>
        <span className="rounded-md mx-4 bg-white py-2 px-3 flex justify-between mb-3">
          <button type="button" className="bg-transparent">
            <img src="assets/images/active-full.svg" className="h-12 w-24 p-1 bg-gray-100 rounded" alt="" />
          </button>
          <button type="button" className="bg-transparent">
            <img src="assets/images/active-left.svg" className="h-12 w-24 p-1 bg-gray-100 rounded border border-blue-500" alt="" />
          </button>
          <button type="button" className="bg-transparent">
            <img src="assets/images/active-right.svg" className="h-12 w-24 p-1 bg-gray-100 rounded" alt="" />
          </button>
        </span>
        <ul>
          <li className="p-3">
            <a href="/#">
              Slide 1
              <img src="assets/images/slide-1.png" alt="" />
            </a>
          </li>
          <li className="p-3">
            <a href="/#">
              Slide 2
              <img src="assets/images/slide-2.png" alt="" />
            </a>
          </li>
          <li className="bg-gray-300 p-3">
            <a href="/#">
              Slide 3
              <img src="assets/images/r-side.png" alt="" />
            </a>
          </li>
          <li className="p-3">
            <a href="/#">
              Slide 4
              <img src="assets/images/l-side.png" alt="" />
            </a>
          </li>
        </ul>
      </div>
    </aside>

    <section className="main-container w-11/12 py-2 px-5 flex items-center justify-between flex-col">
      <div id="topBar" className="flex w-full">
        <div className="w-5/12 p-2 flex items-center">
          <div className="w-auto pr-5">
            <img src="assets/images/group-8.svg" alt="/#" />
          </div>
          <div className="w-11/12">
            <h3 className="font-bold text-lg">Board Meeting Memo 3</h3>
            <p>
              Acme Demo Corp powered by
              {' '}
              <span className="font-bold text-blue-600">SeeIT Solutions</span>
            </p>
          </div>
        </div>
        <div className="w-2/12 p-2 flex justify-center">
          <img src="assets/images/company_logo.png" className="w-24" alt="" />
        </div>
        <div className="w-5/12 p-2 flex items-center justify-end">
          <button type="button" className="bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded-md">END MEETING</button>
        </div>
      </div>

      <div id="mainContent" className="flex flex-auto">
        <div className="w-1/2 py-20 bg-gray-100 m-2 rounded-lg relative flex items-center">
          <div className="w-full">
            <div className="w-1/2">
              <div className="mx-3 mt-3 absolute top-0 left-0">
                <button type="button" className="bg-green-900 mr-2 hover:bg-green-800 text-white font-bold p-3 rounded-md inline-flex items-center">
                  <img src="assets/images/edit.svg" className="fill-current w-4 h-4" alt="" />
                </button>
                <button type="button" className="bg-green-900 mr-2 hover:bg-green-800 text-white font-bold p-3 rounded-md inline-flex items-center">
                  <img src="assets/images/undo.svg" className="fill-current w-4 h-4" alt="" />
                </button>
                <button type="button" className="bg-green-900 mr-2 hover:bg-green-800 text-white font-bold p-3 rounded-md inline-flex items-center">
                  <img src="assets/images/delete.svg" className="fill-current w-4 h-4" alt="" />
                </button>
                <button type="button" className="bg-green-900 mr-2 hover:bg-green-800 text-white font-bold p-3 rounded-md inline-flex items-center">
                  <img src="assets/images/whiteboard.svg" className="fill-current w-4 h-4" alt="" />
                </button>
              </div>
            </div>
            <div className="w-1/2">
              <div className="text-right mx-3 mt-3 absolute top-0 right-0">
                <button type="button" className="bg-white mr-2 hover:bg-gray-200 text-gray-800 font-bold p-3 rounded-md inline-flex items-center">
                  <img src="assets/images/minimize.svg" className="fill-current w-4 h-4" alt="" />
                </button>
                <button type="button" className="bg-white mr-2 hover:bg-gray-200 text-gray-800 font-bold p-3 rounded-md inline-flex items-center">
                  <img src="assets/images/full-width.svg" className="fill-current w-4 h-4" alt="" />
                </button>
                <button type="button" className="bg-white hover:bg-gray-200 text-gray-800 font-bold p-3 rounded-md inline-flex items-center">
                  <img src="assets/images/full-window.svg" className="fill-current w-4 h-4" alt="" />
                </button>
              </div>
            </div>
          </div>
          <img src="assets/images/l-side.png" alt="" />
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
                  <img src="assets/images/edit.svg" className="fill-current w-4 h-4" alt="" />
                </button>
                <button type="button" className="bg-green-900 mr-2 hover:bg-green-800 text-white font-bold p-3 rounded-md inline-flex items-center">
                  <img src="assets/images/undo.svg" className="fill-current w-4 h-4" alt="" />
                </button>
                <button type="button" className="bg-green-900 mr-2 hover:bg-green-800 text-white font-bold p-3 rounded-md inline-flex items-center">
                  <img src="assets/images/delete.svg" className="fill-current w-4 h-4" alt="" />
                </button>
                <button type="button" className="bg-green-900 mr-2 hover:bg-green-800 text-white font-bold p-3 rounded-md inline-flex items-center">
                  <img src="assets/images/whiteboard.svg" className="fill-current w-4 h-4" alt="" />
                </button>
              </div>
            </div>
            <div className="w-1/2">
              <div className="text-right mx-3 mt-3 absolute top-0 right-0">
                <button type="button" className="bg-white mr-2 hover:bg-gray-200 text-gray-800 font-bold p-3 rounded-md inline-flex items-center">
                  <img src="assets/images/minimize.svg" className="fill-current w-4 h-4" alt="" />
                </button>
                <button type="button" className="bg-white mr-2 hover:bg-gray-200 text-gray-800 font-bold p-3 rounded-md inline-flex items-center">
                  <img src="assets/images/full-width.svg" className="fill-current w-4 h-4" alt="" />
                </button>
                <button type="button" className="bg-white hover:bg-gray-200 text-gray-800 font-bold p-3 rounded-md inline-flex items-center">
                  <img src="assets/images/full-window.svg" className="fill-current w-4 h-4" alt="" />
                </button>
              </div>
            </div>
          </div>
          <img src="assets/images/r-side.png" alt="" />
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

      <div id="footerBar" className="flex w-full">
        <div className="w-1/2 p-2 flex items-center">
          <button type="button" className="bg-gray-100 mr-3 h-auto hover:bg-gray-300 font-bold p-5 rounded-lg inline-flex items-center">
            <img src="assets/images/camera.svg" className="fill-current w-6 h-6" alt="" />
          </button>
          <button type="button" className="bg-gray-100 mr-3 hover:bg-gray-300 font-bold p-5 rounded-lg inline-flex items-center">
            <img src="assets/images/mic.svg" className="fill-current w-6 h-6" alt="" />
          </button>
          <button type="button" className="bg-gray-100 mr-3 hover:bg-gray-300 font-bold p-5 rounded-lg inline-flex items-center">
            <img src="assets/images/record.svg" className="fill-current w-6 h-6" alt="" />
          </button>
          <button type="button" className="bg-gray-100 hover:bg-gray-300 font-bold p-5 rounded-lg inline-flex items-center">
            <img src="assets/images/full-screen.svg" className="fill-current w-6 h-6" alt="" />
          </button>
        </div>
        <div className="w-1/2 p-2 flex justify-end">
          <div className="w-1/6 mr-4">
            <img src="assets/images/user_1.png" className="fill-current" alt="" />
          </div>
          <div className="w-1/6 mr-4">
            <img src="assets/images/user_2.png" className="fill-current" alt="" />
          </div>
          <div className="w-1/6 mr-4">
            <img src="assets/images/user_3.png" className="fill-current" alt="" />
          </div>
          <div className="w-1/6">
            <img src="assets/images/user_4.png" className="fill-current" alt="" />
          </div>
        </div>
      </div>
    </section>
  </div>
);

export default AppView;
