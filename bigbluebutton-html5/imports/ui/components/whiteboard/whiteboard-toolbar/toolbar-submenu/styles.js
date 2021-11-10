import styled from 'styled-components';
import { toolbarButtonHeight, toolbarButtonWidth } from '/imports/ui/stylesheets/styled-components/general';
import { toolbarListColor, toolbarListBgFocus } from '/imports/ui/stylesheets/styled-components/palette';

const CustomSvgIcon = styled.svg`
  position: absolute;
  width: ${toolbarButtonWidth};
  height: ${toolbarButtonHeight};
  left: 0;
  top: 0;
`;

const TextThickness = styled.p`
  font-family: Arial, sans-serif;
  font-weight: normal;
  text-shadow: -1px 0 ${toolbarListBgFocus}, 0 1px ${toolbarListBgFocus}, 1px 0 ${toolbarListBgFocus}, 0 -1px ${toolbarListBgFocus};
  margin: auto;
  color: ${toolbarListColor};
`;

const Wrapper = styled.div`
  ${({ type }) => (
    type === 'font-size' 
    || type === 'annotations' 
    || type === 'thickness' 
    || type === 'color' ) && `
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    height: ${toolbarButtonHeight};
    position: absolute;
    right: ${toolbarButtonHeight};
    left: auto;
    top: 0;
    box-shadow: 0 0 10px -2px rgba(0, 0, 0, .25);

    [dir="rtl"] & {
      right: auto;
      left: ${toolbarButtonHeight};
    }
  `}
`;

export default {
  CustomSvgIcon,
  TextThickness,
  Wrapper,
};
