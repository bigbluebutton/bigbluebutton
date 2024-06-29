import { GeneralHookManagerProps } from '../../../types';
import { GraphqlDataHookSubscriptionResponse } from '/imports/ui/Types/hook';
import { User } from '/imports/ui/Types/user';

export interface CurrentUserProps extends GeneralHookManagerProps {
    currentUser: GraphqlDataHookSubscriptionResponse<Partial<User>>
}
