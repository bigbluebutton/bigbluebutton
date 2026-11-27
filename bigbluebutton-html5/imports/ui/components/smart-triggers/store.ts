import { makeVar } from '@apollo/client';
import { SmartTriggersState } from './types';

const smartTriggersState = makeVar<SmartTriggersState>({ rules: {} });

export default smartTriggersState;
