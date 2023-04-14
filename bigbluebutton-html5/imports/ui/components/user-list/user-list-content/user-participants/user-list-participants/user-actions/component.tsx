import React from 'react';
import { User } from '/imports/ui/Types/user';
import {LockSettings, UsersPolicies} from '/imports/ui/Types/meeting';
import { generateActionsPermissions } from './service';

interface UserActionsProps {
  user: User;
  currentUser: User;
  lockSettings: LockSettings;
  usersPolicies: UsersPolicies;
  isBreakout: boolean;
};

const UserActions: React.FC<UserActionsProps> = ({
  user,
  currentUser,
  lockSettings,
  usersPolicies,
  isBreakout,
  children,
}) => {
  const actionsnPermitions = generateActionsPermissions(
    user,
    currentUser,
    lockSettings,
    usersPolicies,
    isBreakout
  );

  return children;
};

export default UserActions;
