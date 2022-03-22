import styled from 'styled-components';
import Button from '/imports/ui/components/common/button/component';
import { fontSizeSmall } from '/imports/ui/stylesheets/styled-components/typography';

const DndContainer = styled.div`
  height: 200px;
`;

const DndTextArea = styled.textarea`
  width: 100%;
  height: 100%;
  resize: none;
  font-size: ${fontSizeSmall};

  ${({ active }) => active && `
    background: grey;
  `}

  ${({ active }) => !active && `
    background: white;
  `}
`;

const DndButton = styled(Button)`
  width: 100%;
`;

export default {
  DndContainer,
  DndTextArea,
  DndButton,
};
