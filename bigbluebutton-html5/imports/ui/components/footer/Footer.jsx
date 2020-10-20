import React from 'react';

const Footer = () => (
  <div id="footerBar" className="flex w-full">
    <div className="w-1/2 p-2 flex items-center">
      <button type="button" className="bg-gray-100 mr-3 h-auto hover:bg-gray-300 font-bold p-5 rounded-lg inline-flex items-center">
        <img src="images/camera.svg" className="fill-current w-6 h-6" alt="" />
      </button>
      <button type="button" className="bg-gray-100 mr-3 hover:bg-gray-300 font-bold p-5 rounded-lg inline-flex items-center">
        <img src="images/mic.svg" className="fill-current w-6 h-6" alt="" />
      </button>
      <button type="button" className="bg-gray-100 mr-3 hover:bg-gray-300 font-bold p-5 rounded-lg inline-flex items-center">
        <img src="images/record.svg" className="fill-current w-6 h-6" alt="" />
      </button>
      <button type="button" className="bg-gray-100 hover:bg-gray-300 font-bold p-5 rounded-lg inline-flex items-center">
        <img src="images/full-screen.svg" className="fill-current w-6 h-6" alt="" />
      </button>
    </div>
    <div className="w-1/2 p-2 flex justify-end">
      <div className="w-1/6 mr-4">
        <img src="images/user_1.png" className="fill-current" alt="" />
      </div>
      <div className="w-1/6 mr-4">
        <img src="images/user_2.png" className="fill-current" alt="" />
      </div>
      <div className="w-1/6 mr-4">
        <img src="images/user_3.png" className="fill-current" alt="" />
      </div>
      <div className="w-1/6">
        <img src="images/user_4.png" className="fill-current" alt="" />
      </div>
    </div>
  </div>
);

export default Footer;
