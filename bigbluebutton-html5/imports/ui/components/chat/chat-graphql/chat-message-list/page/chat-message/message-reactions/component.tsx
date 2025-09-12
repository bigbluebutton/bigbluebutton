import React, {
  KeyboardEventHandler,
  useRef,
  useEffect,
  useState,
} from 'react';
import { getEmojiDataFromNative } from 'emoji-mart';
import Styled from './styles';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import ReactionItem from './reaction-item/component';
import KEY_CODES from '/imports/utils/keyCodes';

interface ChatMessageReactionsProps {
  reactions: {
    createdAt: string;
    reactionEmoji: string;
    user: {
      name: string;
      userId: string;
    };
  }[];
  sendReaction(reactionEmoji: string, chatId: string, messageId: string): void;
  deleteReaction(reactionEmoji: string, chatId: string, messageId: string): void;
  chatId: string;
  messageId: string;
  keyboardFocused: boolean;
}

type ReactionItem = {
  count: number;
  userNames: string[];
  reactedByMe: boolean;
  reactionEmoji: string;
  leastRecent: number;
  shortcodes: string;
}

const sortByCount = (r1: ReactionItem, r2: ReactionItem) => r2.count - r1.count;
const sortByLeastRecent = (r1: ReactionItem, r2: ReactionItem) => r1.leastRecent - r2.leastRecent;

const roving = (
  event: React.KeyboardEvent<HTMLElement>,
  changeState: (el: HTMLElement | null) => void,
  elementsList: HTMLElement,
  element?: HTMLElement | null,
) => {
  if ([KEY_CODES.ESCAPE, KEY_CODES.TAB].includes(event.keyCode)) {
    changeState(null);
  }

  if (event.keyCode === KEY_CODES.ARROW_RIGHT) {
    event.preventDefault();
    const firstElement = elementsList.firstChild as HTMLElement;
    const elRef = element && element.nextSibling ? (element.nextSibling as HTMLElement) : firstElement;

    elRef.focus();
    changeState(elRef);
  }

  if (event.keyCode === KEY_CODES.ARROW_LEFT) {
    event.preventDefault();
    const lastElement = elementsList.lastChild as HTMLElement;
    const elRef = element && element.previousSibling ? (element.previousSibling as HTMLElement) : lastElement;

    elRef.focus();
    changeState(elRef);
  }
};

const ChatMessageReactions: React.FC<ChatMessageReactionsProps> = (props) => {
  const {
    reactions, sendReaction, deleteReaction, chatId, messageId, keyboardFocused,
  } = props;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const selectedElementRef = useRef<HTMLElement | null>();
  const [reactionItems, setReactionItems] = useState<Record<string, ReactionItem>>({});

  const { data: currentUser } = useCurrentUser((u) => ({ userId: u.userId }));

  const rove: KeyboardEventHandler<HTMLElement> = (e) => {
    if (wrapperRef.current) {
      roving(
        e,
        (el) => { selectedElementRef.current = el; },
        wrapperRef.current,
        selectedElementRef.current,
      );
    }
  };

  useEffect(() => {
    const updateShortcodes = async () => {
      const items = reactions.reduce(async (previousValue, reaction) => {
        const newValue = await previousValue;
        const {
          createdAt,
          reactionEmoji,
          user,
        } = reaction;

        const reactedByMe = user.userId === currentUser?.userId;
        const emojiData = await getEmojiDataFromNative(reactionEmoji);

        if (!newValue[reactionEmoji]) {
          newValue[reactionEmoji] = {
            count: 1,
            userNames: reactedByMe ? [] : [user.name],
            reactedByMe,
            reactionEmoji,
            leastRecent: new Date(createdAt).getTime(),
            shortcodes: emojiData?.shortcodes || '',
          };
        } else {
          newValue[reactionEmoji].count += 1;
          if (reactedByMe) {
            newValue[reactionEmoji].reactedByMe = true;
          } else {
            newValue[reactionEmoji].userNames.push(user.name);
          }
        }
        return newValue;
      }, Promise.resolve({} as Record<string, ReactionItem>));

      items.then((updatedReactionItems) => setReactionItems(updatedReactionItems));
    };
    updateShortcodes();
  }, [reactions]);

  return (
    <Styled.ReactionsWrapper
      tabIndex={keyboardFocused ? 0 : -1}
      ref={wrapperRef}
      onKeyDown={rove}
      onFocus={(e) => {
        const { firstChild } = wrapperRef.current || {};
        if (firstChild instanceof HTMLElement && Object.is(e.target, wrapperRef.current)) {
          firstChild.focus();
          selectedElementRef.current = firstChild;
        }
      }}
    >
      {Object.values(reactionItems).sort(sortByLeastRecent).sort(sortByCount).map((details) => (
        <ReactionItem
          chatId={chatId}
          count={details.count}
          deleteReaction={deleteReaction}
          messageId={messageId}
          reactedByMe={details.reactedByMe}
          reactionEmoji={details.reactionEmoji}
          sendReaction={sendReaction}
          shortcodes={details.shortcodes || ''}
          userNames={details.userNames}
          key={details.reactionEmoji}
        />
      ))}
    </Styled.ReactionsWrapper>
  );
};

export default ChatMessageReactions;
