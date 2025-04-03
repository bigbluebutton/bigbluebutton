import { useCallback } from 'react';
import { useMutation } from '@apollo/client';
import useMeeting from './useMeeting';
import { SWAP_SCREENSHARE } from '../graphql/mutations/userMutations';

const fallbackValue: boolean = false;

const usePresentationSwap = (): [boolean, (v: boolean) => void] => {
  const {
    data,
  } = useMeeting((m) => ({
    componentsFlags: m.componentsFlags,
  }));

  const [swapScreenshare] = useMutation(SWAP_SCREENSHARE);

  const setPresentationSwap = useCallback((value: boolean) => {
    swapScreenshare({
      variables: {
        screenshareAsContent: value,
      },
    });
  }, [swapScreenshare]);

  return [
    (
      data?.componentsFlags?.hasScreenshareAsContent
      || data?.componentsFlags?.hasCameraAsContent
    )
    || fallbackValue,
    setPresentationSwap];
};

export default usePresentationSwap;
