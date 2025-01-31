import { IntlShape } from 'react-intl';
import { User } from '/imports/ui/Types/user';
import { LockSettings } from '/imports/ui/Types/meeting';
import { UserListItemAdditionalInformationInterface } from 'bigbluebutton-html-plugin-sdk';

export interface UserNameWithSubsProps {
  intl: IntlShape;
  subjectUser: User;
  lockSettings: LockSettings;
  userItemsFromPlugin: UserListItemAdditionalInformationInterface[]
}
