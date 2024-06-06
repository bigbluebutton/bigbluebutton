import styled from 'styled-components';
import {
  colorPrimary,
  colorSuccess,
  colorWarning,
  colorDanger,
} from '/imports/ui/stylesheets/styled-components/palette';

const StatusIconWrapper = styled.div`
  border-radius: 50%;
  padding: 1.5rem;

  ${({ color }) => {
    let bgColor = colorSuccess;
    bgColor = color === 'warning' ? colorWarning : bgColor;
    bgColor = color === 'danger' ? colorDanger : bgColor;
    return `background-color: ${bgColor};`
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
