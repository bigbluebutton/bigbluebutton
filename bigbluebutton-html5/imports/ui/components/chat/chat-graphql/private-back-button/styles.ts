import styled from 'styled-components';
import {
  colorGrayLighter,
} from '/imports/ui/stylesheets/styled-components/palette';

const Form = styled.div`
  width: 100%;
  margin-top: .2rem;
`;

const ArrowWrapper = styled.div`
  display: flex; 
  align-items: center;
  background-color: #E3F2FD;
  border-top-left-radius: 0.75rem;
  border-bottom-left-radius: 0.75rem;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-left: 1px solid transparent;
  border-top: 1px solid transparent;
  border-bottom: 1px solid transparent;
  border-right: 1px solid ${colorGrayLighter};
  color: #1976D2;
  padding: 8px;
  cursor: pointer;
`;

const InputWrapper = styled.div`
  display: flex; 
  align-items: center;
  border-radius: 0.75rem;
  cursor: pointer;
  border: 1px solid ${colorGrayLighter};
  background-color: #fff;
`;

export default {
  Form,
  ArrowWrapper,
  InputWrapper,
};
