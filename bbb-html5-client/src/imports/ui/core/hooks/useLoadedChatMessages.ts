import { isEqual } from 'radash';
import { makeVar, useReactiveVar } from '@apollo/client';
import { Message } from '/imports/ui/Types/message';

interface LoadedChatMessages {
  [pageNumber: number]: Partial<Message>[];
}

const createLoadedPageGathering = (): [
  (fn: (c: Partial<Message>) => Partial<Message>) => [
    Partial<Message>[],
    (pageNumber: number, result: Partial<Message>[]) => void,
  ],
  (pageNumber: number, result: Partial<Message>[]) => void,
] => {
  const loadedPages = makeVar<LoadedChatMessages>({});

  const pagesGathering = (pageNumber: number, result: Partial<Message>[]): void => {
    const pageMessages = loadedPages()[pageNumber];
    const hasMessages = pageMessages && pageMessages.length > 0;
    const shouldAdd = !hasMessages || !isEqual(pageMessages, result);
    if (shouldAdd) {
      const a = {
        ...loadedPages(),
        [pageNumber]: result,
      };
      loadedPages(a);
    }
  };

  const useResultPage = (fn: (c: Partial<Message>) => Partial<Message>): [
    Partial<Message>[],
    (pageNumber: number, result: Partial<Message>[]) => void,
  ] => {
    const gatheredPages = useReactiveVar(loadedPages);
    const messages = Object.values(gatheredPages).filter((i) => Array.isArray(i)).flat();
    return [messages.map(fn), pagesGathering];
  };

  return [useResultPage, pagesGathering];
};

const [useLoadedPageGathering, setLoadedMessageGathering] = createLoadedPageGathering();

export default useLoadedPageGathering;
export { setLoadedMessageGathering, useLoadedPageGathering };
