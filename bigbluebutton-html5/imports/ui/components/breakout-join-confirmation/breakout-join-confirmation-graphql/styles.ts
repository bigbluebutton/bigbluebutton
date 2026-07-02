import styled from 'styled-components';
import { colorWhite, colorBorder } from '/imports/ui/stylesheets/styled-components/palette';

const SelectParent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Select = styled.select`
  background-color: ${colorWhite};
  width: 50%;
  margin: 1rem;
  border-color: ${colorBorder};
`;

export default {
  SelectParent,
  Select,
};
