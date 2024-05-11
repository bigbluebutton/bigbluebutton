import styled from 'styled-components';

import {
  colorHeading,
  palettePlaceholderText,
  colorGrayLight,
} from '/imports/ui/stylesheets/styled-components/palette';
import { lineHeightComputed } from '/imports/ui/stylesheets/styled-components/typography';

interface ChatUserNameProps {
  isOnline: boolean;
}

export const HeaderContent = styled.div`
  display: flex;
  flex-flow: row;
  width: 100%;
`;

export const ChatUserName = styled.div<ChatUserNameProps>`
  display: flex;
  min-width: 0;
  font-weight: 600;
  position: relative;

  margin-right: calc(${lineHeightComputed} / 2);

  min-width: 0;
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  ${({ isOnline }) => isOnline && `
    color: ${colorHeading};
  `}

  ${({ isOnline }) => !isOnline && `
    text-transform: capitalize;
    font-style: italic;

    & > span {
      text-align: right;
      padding: 0 .1rem 0 0;

      [dir="rtl"] & {
        text-align: left;
        padding: 0 0 0 .1rem;
      }
    }
  `}
`;

export const ChatUserOffline = styled.span`
  color: ${colorGrayLight};
  font-weight: 100;
  text-transform: lowercase;
  font-style: italic;
  font-size: 90%;
  line-height: 1;
  user-select: none;
`;

export const ChatTime = styled.time`
  flex-shrink: 0;
  flex-grow: 0;
  flex-basis: 3.5rem;
  color: ${palettePlaceholderText};
  text-transform: uppercase;
  font-size: 75%;
  [dir='rtl'] & {
    margin: 0 calc(${lineHeightComputed} / 2) 0 0;
  }

  & > span {
    vertical-align: sub;
  }
`;

export const ChatHeaderText = styled.div`
  display: flex;
  align-items: baseline;
  width: 100%;
`;

export default {
  HeaderContent,
  ChatTime,
  ChatUserOffline,
  ChatUserName,
  ChatHeaderText,
};
