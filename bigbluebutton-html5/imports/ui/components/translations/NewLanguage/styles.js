import styled from 'styled-components';
import { mdPaddingY, smPaddingY } from '/imports/ui/stylesheets/styled-components/general';

const LanguageContainer = styled.div`
  background: #E8ECF0;
  border: 1px solid #8B9AA8;
  box-sizing: border-box;
  border-radius: 3px;
  width: 95%;
  margin-bottom: ${mdPaddingY};
  padding: ${mdPaddingY};
  & > p {
    text-align: center;
  }
  & > input {
    width: 150px;
  }
`;

const CheckButton = styled.button`
  color: green;
  margin-left: ${smPaddingY};
  cursor: pointer;
`;

export default {
  LanguageContainer,
  CheckButton,
};
