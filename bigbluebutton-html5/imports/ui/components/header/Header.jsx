import React from 'react';
import PropTypes from 'prop-types';

import { Button } from '../common';
import EndMeetingConfirmationContainer from '/imports/ui/components/end-meeting-confirmation/container';

const Header = ({
  mountModal,
  amIModerator,
  isBreakoutRoom,
  isMeteorConnected,
}) => {
  const allowedToEndMeeting = amIModerator && !isBreakoutRoom;
  return (
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
        {allowedToEndMeeting && isMeteorConnected
          ? (
            <Button
              size="md"
              color="secondary"
              variant="outlined"
              fontWeight="semibold"
              onClick={() => mountModal(<EndMeetingConfirmationContainer />)}
            >
            END MEETING
            </Button>
          )
          : null
        }
      </div>
    </div>
  );
};


Header.propTypes = {
  mountModal: PropTypes.func.isRequired,
  amIModerator: PropTypes.bool,
  isBreakoutRoom: PropTypes.bool,
  isMeteorConnected: PropTypes.bool.isRequired,
};

Header.defaultProps = {
  amIModerator: false,
  isBreakoutRoom: false,
};

export default Header;
