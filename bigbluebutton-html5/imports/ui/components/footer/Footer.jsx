import React from 'react';
import { IconButton } from '../common';
import UserAvatar from '../UserAvatar ';

const Footer = () => (
  <div id="footerBar" className="flex w-full">
    <div className="w-1/2 p-2 flex items-center">
      <IconButton
        colorVariant="secondary"
        icon="camera"
      />
      <IconButton
        colorVariant="secondary"
        icon="mic"
      />
      <IconButton
        colorVariant="secondary"
        icon="record"
      />
      <IconButton
        colorVariant="secondary"
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
