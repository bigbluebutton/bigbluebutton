import React from 'react';


const Tabs = () => (
  <aside className="primary-nav w-1/12">
    <div className="h-24 bg-green-900 rounded-lg text-white font-bold text-3xl justify-center items-center flex m-3">SeeIT</div>
    <ul className="flex flex-col justify-center items-center">
      <li className="bg-gray-100 border-l-8 border-blue-600 w-full">
        <a href="/#" className="p-8 block justify-center flex">
          <img src="images/ppt.svg" className="fill-current" alt="" />
        </a>
      </li>
      <li className="w-full border-b-2 border-gray-200">
        <a href="/#" className="p-8 block justify-center flex">
          <img src="images/pdf.svg" className="fill-current" alt="" />
        </a>
      </li>
      <li className="w-full border-b-2 border-gray-200">
        <a href="/#" className="p-8 block justify-center flex">
          <img src="images/video.svg" className="fill-current" alt="" />
        </a>
      </li>
      <li className="w-full border-b-2 border-gray-200">
        <a href="/#" className="p-8 block justify-center flex">
          <img src="images/www.svg" className="fill-current" alt="" />
        </a>
      </li>
      <li className="w-full">
        <a href="/#" className="p-8 block justify-center flex">
          <img src="images/plus.svg" className="fill-current" alt="" />
        </a>
      </li>
    </ul>
  </aside>
);

export default Tabs;
