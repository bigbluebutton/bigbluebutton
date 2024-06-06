import styled from 'styled-components';
import Styled from '/imports/ui/components/settings/submenus/styles';
import { colorLink } from '/imports/ui/stylesheets/styled-components/palette';

const Title = styled(Styled.Title)``;

const Form = styled(Styled.Form)``;

const Row = styled(Styled.Row)``;

const Col = styled(Styled.Col)``;

const FormElement = styled(Styled.FormElement)``;

const FormElementRight = styled(Styled.FormElementRight)``;

const Label = styled(Styled.Label)``;

const LabelSmall = styled(Label)`
  color: ${colorLink};
  font-size: 0.7rem;
  margin-bottom: 0.3rem;
`;

const Select = styled(Styled.Select)``;

export default {
  Title,
  Form,
  Row,
  Col,
  FormElement,
  FormElementRight,
  Label,
  LabelSmall,
  Select,
};
