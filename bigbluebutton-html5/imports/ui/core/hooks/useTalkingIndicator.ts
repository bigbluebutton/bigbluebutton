import { UserVoice } from '/imports/ui/Types/userVoice';
import { makeVar, useReactiveVar } from '@apollo/client';
import { isEqual } from 'radash';

const createTalkingIndicatorListDataGathering = (): [
  (fn: (c: Partial<UserVoice>) => Partial<UserVoice>) => [
    Partial<UserVoice>[],
    (result: Partial<UserVoice>[]) => void,
  ],
  (result: Partial<UserVoice>[]) => void,
] => {
  const talkingIndicatorList = makeVar<Partial<UserVoice>[]>([]);

  const setTalkingIndicatorList = (result: Partial<UserVoice>[]): void => {
    if (isEqual(talkingIndicatorList(), result)) return;

    talkingIndicatorList(result);
  };

  const useTalkingIndicatorList = (fn: ((c: Partial<UserVoice>) => Partial<UserVoice>)): [
    Partial<UserVoice>[],
    (result: Partial<UserVoice>[]) => void,
  ] => {
    const talkingIndicatorData = useReactiveVar(talkingIndicatorList);
    return [talkingIndicatorData.map(fn), setTalkingIndicatorList];
  };

  return [useTalkingIndicatorList, setTalkingIndicatorList];
};

const [useTalkingIndicatorList, setTalkingIndicatorList] = createTalkingIndicatorListDataGathering();

export { useTalkingIndicatorList, setTalkingIndicatorList };
