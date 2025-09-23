import styled from 'styled-components';
import { borderSize } from '/imports/ui/stylesheets/styled-components/general';
import { colorDanger, colorGrayDark } from '/imports/ui/stylesheets/styled-components/palette';

const BadgeCircle = styled.div`
  border-radius: 50%;
  width: 1.2rem;
  height: 1.2rem;
  bottom: ${borderSize};
  background-color: ${colorDanger};
  border: ${borderSize} solid ${colorGrayDark};
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: .7rem;
  color: white;
`;

export default { BadgeCircle };
