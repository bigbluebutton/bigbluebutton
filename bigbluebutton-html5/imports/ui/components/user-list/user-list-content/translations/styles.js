import styled from 'styled-components';
import {
  smPaddingX,
  lgPaddingX,
  lgPaddingY,
  listItemBgHover,
  borderSize,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  colorGray,
  itemFocusBorder,
  colorGrayDark,
  colorOffWhite,
} from '/imports/ui/stylesheets/styled-components/palette';
import { fontSizeSmall } from '/imports/ui/stylesheets/styled-components/typography';

const SmallTitle = styled.h2`
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  padding: 0 ${smPaddingX};
  margin: 0 0 (${lgPaddingX} / 2) 0;
  color: ${colorGray};
`;

const TranslationContainer = styled.div`
  display: flex;
  flex-flow: row;
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  cursor: pointer;
  [dir="rtl"] & {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;
  }
  &:first-child {
    margin-top: 0;
  }
  &:hover {
    outline: transparent;
    outline-style: dotted;
    outline-width: 2px;
    background-color: ${listItemBgHover};
  }
  &:active,
  &:focus {
    outline: transparent;
    outline-width: 2px;
    outline-style: solid;
    background-color: ${listItemBgHover};
    box-shadow: inset 0 0 0 ${borderSize} ${itemFocusBorder}, inset 1px 0 0 1px ${itemFocusBorder};
  }
  cursor: pointer;
  text-decoration: none;
  flex-grow: 1;
  line-height: 2;
  color: ${colorGrayDark};
  background-color: ${colorOffWhite};
  padding-top: ${lgPaddingY};
  padding-bottom: ${lgPaddingY};
  padding-left: ${lgPaddingY};
  padding-right: 0;
  margin-left: ${borderSize};
  margin-top: ${borderSize};
  margin-bottom: ${borderSize};
  margin-right: 0;
  
  & > img {
    height: 24px;
    width: 24px;
  }
  ${({ active }) => active && `
    background-color: ${listItemBgHover};
    box-shadow: inset 0 0 0 ${borderSize} ${itemFocusBorder}, inset 1px 0 0 1px ${itemFocusBorder};
  `}
`;

const OptionName = styled.span`
  font-weight: 400;
  font-size: ${fontSizeSmall};
  color: ${colorGrayDark};
  flex-grow: 1;
  line-height: 2;
  text-align: left;
  padding: 0 0 0 ${lgPaddingY};
  text-overflow: ellipsis;
`;

export default {
  SmallTitle,
  TranslationContainer,
  OptionName,
};
