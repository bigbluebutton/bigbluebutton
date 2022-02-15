import styled from 'styled-components';
import { colorGrayLight, colorSuccess } from '/imports/ui/stylesheets/styled-components/palette';
import Icon from '/imports/ui/components/common/icon/component';

const CheckboxWrapper = styled.div`
  opacity: 1;

  ${({ disabled }) => disabled && `
    & > div i {
      opacity: .5;
      cursor: not-allowed;
    }
  `}
`;

const CheckboxInput = styled.input`
  border: 0;
  clip: rect(0 0 0 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  display: inline-block;
  width: 1px;
`;

const CheckboxIcon = styled(Icon)`
  cursor: pointer;
  font-size: 1.35rem;
  color: ${colorGrayLight};
`;

const CheckboxIconChecked = styled(CheckboxIcon)`
  color: ${colorSuccess};
`;

export default {
  CheckboxWrapper,
  CheckboxInput,
  CheckboxIcon,
  CheckboxIconChecked,
};
