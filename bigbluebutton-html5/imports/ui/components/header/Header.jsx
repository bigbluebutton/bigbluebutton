import React from 'react';
import { Button } from '../common';

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
      <Button
        size="md"
        color="secondary"
        variant="outlined"
        fontWeight="semibold"
      >
        END MEETING
      </Button>
    </div>
  </div>
);

export default Header;
