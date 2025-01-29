import styled from 'styled-components';
import Styled from '/imports/ui/components/settings/submenus/styles';

const Title = styled(Styled.Title)``;

const SubTitle = styled(Styled.SubTitle)``;

const Form = styled(Styled.Form)``;

const Row = styled(Styled.Row)``;

const Col = styled(Styled.Col)`
  display: flex;
  flex-grow: 1;
  flex-basis: 0;

  &:last-child {
    padding-right: 0;
    padding-left: 0;

    [dir="rtl"] & {
      padding-right: 0.1rem;
      padding-left: 0;
    }
  }
`;

const FormElement = styled(Styled.FormElement)``;

const FormElementRight = styled(Styled.FormElementRight)`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-left: 0;
`;

const Label = styled(Styled.Label)`
  margin-left: 0.5rem;
  font-size: 0.9rem;
`;

export default {
  Title,
  SubTitle,
  Form,
  Row,
  Col,
  FormElement,
  FormElementRight,
  Label,
};
