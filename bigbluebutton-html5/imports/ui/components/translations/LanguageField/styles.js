import styled from 'styled-components';
import { mdPaddingY } from '/imports/ui/stylesheets/styled-components/general';

const DeleteButton = styled.span`
  right: 20px;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  margin: auto;
  cursor: pointer;
`;

const LanguageContainer = styled.div`
  background: #E8ECF0;
  border: 1px solid #8B9AA8;
  box-sizing: border-box;
  border-radius: 3px;
  width: 95%;
  position: relative;
  margin-bottom: ${mdPaddingY};
  & > p {
    text-align: center;
  }
`;

export default {
  DeleteButton,
  LanguageContainer,
};
