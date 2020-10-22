import React from 'react';

import { IconButton } from '../common';
import UserAvatar from '../UserAvatar';

const Footer = () => (
  <div id="footerBar" className="flex w-full">
    <div className="w-1/2 p-2 flex items-center">
      <IconButton
        color="secondary"
        icon="camera"
      />
      <IconButton
        color="secondary"
        icon="mic"
      />
      <IconButton
        color="secondary"
        icon="record"
      />
      <IconButton
        color="secondary"
        icon="full-screen"
        noMargin
      />
    </div>
    <div className="w-1/2 p-2 flex justify-end">
      <UserAvatar
        avatar="images/user_1.png"
      />
      <UserAvatar
        avatar="images/user_2.png"
      />
      <UserAvatar
        avatar="images/user_3.png"
      />
      <UserAvatar
        avatar="images/user_4.png"
      />
    </div>
  </div>
);

export default Footer;
