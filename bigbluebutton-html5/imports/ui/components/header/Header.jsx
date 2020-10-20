import React from 'react';

const Header = () => (
  <div id="topBar" className="flex w-full">
    <div className="w-5/12 p-2 flex items-center">
      <div className="w-auto pr-5">
        <img src="images/group-8.svg" alt="/#" />
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
      <img src="images/company_logo.png" className="w-24" alt="" />
    </div>
    <div className="w-5/12 p-2 flex items-center justify-end">
      <button type="button" className="bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded-md">END MEETING</button>
    </div>
  </div>
);

export default Header;
