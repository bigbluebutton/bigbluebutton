import styled from 'styled-components';
import {
  colorGrayLighter, colorGrayLightest, colorOffWhite,
} from '/imports/ui/stylesheets/styled-components/palette';

const EmojiWrapper = styled.button<{ highlighted: boolean }>`
  background: none;
  border-radius: 1rem;
  padding: 0.375rem 1rem;
  line-height: 1;
  display: flex;
  flex-wrap: nowrap;
  border: 1px solid ${colorGrayLightest};
  cursor: pointer;

  ${({ highlighted }) => highlighted && `
    background-color: ${colorOffWhite};
  `}

  em-emoji {
    [dir='ltr'] & {
      margin-right: 0.25rem;
    }

    [dir='rtl'] & {
      margin-left: 0.25rem;
    }
  }

  &:hover {
    border: 1px solid ${colorGrayLighter};
  }
`;

const ReactionsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  user-select: none;
`;

export default {
  EmojiWrapper,
  ReactionsWrapper,
};
