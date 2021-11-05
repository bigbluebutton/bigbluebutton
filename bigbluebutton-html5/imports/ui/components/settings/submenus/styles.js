import styled from 'styled-components';
import {
  colorGrayDark,
  colorGrayLabel,
} from '/imports/ui/stylesheets/styled-components/palette';

const Title = styled.h3`
  color: ${colorGrayDark};
  font-weight: 400;
  font-size: 1.3rem;
  margin: 0;
  margin-bottom: 1.5rem;
`;

const SubTitle = styled.h4`
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

const Form = styled.div`
  display: flex;
  flex-flow: column;
`;

const Row = styled.div`
  display: flex;
  flex-flow: row;
  flex-grow: 1;
  justify-content: space-between;
  margin-bottom: 0.7rem;
`;

const Col = styled.div`
  display: flex;
  flex-grow: 1;
  flex-basis: 0;

  &:last-child {
    padding-right: 0;
    padding-left: 1rem;

    [dir="rtl"] & {
      padding-right: 0.1rem;
      padding-left: 0;
    }
  }
`;

const FormElement = styled.div`
  position: relative;
  display: flex;
  flex-flow: column;
  flex-grow: 1;
`;

const FormElementRight = styled.div`
  position: relative;
  flex-grow: 1;
  display: flex;
  justify-content: flex-end;
  flex-flow: row;
  align-items: center;
`;

const FormElementCenter = styled.div`
  position: relative;
  display: flex;
  flex-grow: 1;
  justify-content: center;
  flex-flow: row;
  align-items: center;
`;

const Label = styled.span`
  color: ${colorGrayLabel};
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

export default {
  Title,
  SubTitle,
  Form,
  Row,
  Col,
  FormElement,
  FormElementRight,
  FormElementCenter,
  Label,
};
