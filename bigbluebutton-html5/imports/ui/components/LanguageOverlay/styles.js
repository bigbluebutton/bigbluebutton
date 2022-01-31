import styled from 'styled-components';
import {
  colorWhite,
  colorOffWhite,
  colorPrimary,
  colorGray,
} from '/imports/ui/stylesheets/styled-components/palette';

const LanguageOverlay = styled.div`
  li {
    box-sizing: unset;
    display: flex;
    justify-content: space-between;

    padding-left: 1em;
    padding-right: 1em;
    min-width: 8em;
    list-style: none;

    &:hover{
      color: ${colorWhite};
    }
  }

  ul {
    padding: 5px;
    background-color: ${colorOffWhite};
  }
`;

const LanguageOption = styled.li`
  cursor: pointer;

  &:hover {
    background-color: ${colorPrimary};
  }

  ${({ filtered }) => filtered && `
    color: ${colorGray};
    cursor: default;

    &:hover {
      background-color: ${colorGray};
    }
  `}
`;

export default {
  LanguageOverlay,
  LanguageOption,
};
