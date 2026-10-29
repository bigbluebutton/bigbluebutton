import styled from 'styled-components';
import {
  colorPrimary,
  colorWhite,
  colorWarning,
  colorDanger,
  btnWarningColor,
  connectionStatusGoodBg,
} from '/imports/ui/stylesheets/styled-components/palette';

const StatusIconWrapper = styled.div`
  border-radius: 50%;
  padding: 1.5rem;

  ${({ color }) => {
    let bgColor = connectionStatusGoodBg;
    bgColor = color === 'warning' ? colorWarning : bgColor;
    bgColor = color === 'danger' ? colorDanger : bgColor;
    const iconColor = color === 'warning' ? btnWarningColor : colorWhite;
    return `
      background-color: ${bgColor};
      color: ${iconColor};
    `;
  }}
`;

const IconWrapper = styled.div`
  width: 2.25rem;
  height: 2.25rem;
`;

const Label = styled.div`
  font-weight: 600;
  margin: .25rem 0 .5rem;
`;

const Settings = styled.span`
  color: ${colorPrimary};
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

export default {
  StatusIconWrapper,
  IconWrapper,
  Label,
  Settings,
};
