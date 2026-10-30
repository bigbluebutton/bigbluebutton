import { css } from 'styled-components';
import {
  chatMentionBackgroundColor,
  chatMentionSelfBackgroundColor,
  chatMentionSelfColor,
  colorPrimary,
} from '/imports/ui/stylesheets/styled-components/palette';

export interface ChatMentionStylesProps {
  /** Mentions are rendered from the message HTML, so the current user is only known here. */
  $currentUserId?: string;
}

/**
 * Shared by every surface that injects the message HTML: the message itself, the reply
 * quote, the reply preview above the composer and the pinned message.
 */
const chatMentionStyles = css<ChatMentionStylesProps>`
  & span.chat-mention {
    color: ${colorPrimary};
    font-weight: 600;
    background-color: ${chatMentionBackgroundColor};
    border-radius: 3px;
    padding: 0 2px;
  }

  ${({ $currentUserId }) => $currentUserId && css`
    & span.chat-mention[data-userid="${$currentUserId}"] {
      color: ${chatMentionSelfColor};
      background-color: ${chatMentionSelfBackgroundColor};
    }
  `}
`;

export default chatMentionStyles;
