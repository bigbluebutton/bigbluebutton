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
    const talkingIndicators = talkingIndicatorList();
    const hasUserVoices = talkingIndicators && talkingIndicators.length > 0;
    const shouldAdd = !hasUserVoices || !isEqual(talkingIndicators, result);
    if (shouldAdd) {
      const a = {
        ...talkingIndicatorList(),
        result,
      };
      talkingIndicatorList(a);
    }
  };

  const useTalkingIndicatorList = (fn: ((c: Partial<UserVoice>) => Partial<UserVoice>)): [
    Partial<UserVoice>[],
    (result: Partial<UserVoice>[]) => void,
  ] => {
    const gatheredTalkingIndicator = useReactiveVar(talkingIndicatorList);
    const talkingIndicatorData = Object.values(gatheredTalkingIndicator).filter((i) => Array.isArray(i)).flat();
    return [talkingIndicatorData.map(fn), setTalkingIndicatorList];
  };

  return [useTalkingIndicatorList, setTalkingIndicatorList];
};

const [useTalkingIndicatorList, setTalkingIndicatorList] = createTalkingIndicatorListDataGathering();

export { useTalkingIndicatorList, setTalkingIndicatorList };
