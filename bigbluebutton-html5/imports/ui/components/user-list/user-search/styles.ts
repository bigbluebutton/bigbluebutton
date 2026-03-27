import styled from 'styled-components';
import {
  colorGray,
  colorBorder,
  colorPrimary,
  colorText,
  colorWhite,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  smPaddingX,
  lgPadding,
  xsPadding,
  lgBorderRadius,
  smPaddingY,
} from '/imports/ui/stylesheets/styled-components/general';

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  margin: ${lgPadding} ${lgPadding} 0px ${lgPadding};
  background: ${colorWhite};
  border-radius: ${lgBorderRadius};
  border: 1px solid ${colorBorder};
  padding: ${smPaddingY} ${smPaddingX};
  width: auto;
  height: 40px;
  overflow: hidden;
  box-shadow: none;
  
  &:focus-within {
    box-shadow: 0 0 0 ${xsPadding} ${colorBorder};
  }
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  color: ${colorText};
  font-size: 0.875rem;
  padding: 0;
  margin-left: ${smPaddingX};

  &::placeholder {
    color: ${colorGray};
  }

  [dir="rtl"] & {
    margin-left: 0;
    margin-right: ${smPaddingX};
  }
`;

const ClearButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${colorGray};
  font-size: 1.5rem;
  line-height: 1;
  padding: 0;
  margin-left: ${smPaddingX};
  width: 1.5rem;
  height: 1.5rem;

  &:hover {
    color: ${colorText};
  }

  [dir="rtl"] & {
    margin-left: 0;
    margin-right: ${smPaddingX};
  }
`;

const SpinnerWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: ${smPaddingX};
  color: ${colorPrimary};

  [dir="rtl"] & {
    margin-left: 0;
    margin-right: ${smPaddingX};
  }
`;

export default {
  SearchContainer,
  SearchInput,
  ClearButton,
  SpinnerWrapper,
};
