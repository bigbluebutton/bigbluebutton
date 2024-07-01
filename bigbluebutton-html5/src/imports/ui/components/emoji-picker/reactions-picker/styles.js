import styled, { css } from 'styled-components';

const EmojiWrapper = styled.span`
  padding-top: 0.9em;
  padding-bottom: 0.1em;
  ${({ selected }) => !selected && css`
    :hover {
      border-radius:100%;
      outline-color: transparent;
      outline-style:solid;
      box-shadow: 0 0 0 0.25em #eee;
      background-color: #eee;
      opacity: 0.75;
    }
  `}
  ${({ selected }) => selected && css`
    em-emoji {
      cursor: not-allowed;
    }
  `}
  ${({ selected, emoji }) => selected && selected !== emoji && css`
    opacity: 0.75;
  `}
  ${({ selected, emoji }) => selected && selected === emoji && css`
    border-radius:100%;
    outline-color: transparent;
    outline-style:solid;
    box-shadow: 0 0 0 0.25em #eee;
    background-color: #eee;
  `}
`;

export default {
  EmojiWrapper,
};
