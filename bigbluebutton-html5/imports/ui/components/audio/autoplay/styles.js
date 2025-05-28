import styled from 'styled-components';
import Button from '/imports/ui/components/common/button/component';

const AutoplayPrompt = styled.span`
  margin-top: auto;
  margin-bottom: auto;
`;

const AutoplayButton = styled(Button)`
  &:focus {
    outline: none !important;
  }

  span:last-child {
    color: black;
    font-size: 1rem;
    font-weight: 600;
    margin-top: 1rem;
  }
`;

export default {
  AutoplayPrompt,
  AutoplayButton,
};
