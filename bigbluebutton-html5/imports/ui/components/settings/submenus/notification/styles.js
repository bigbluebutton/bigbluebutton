import styled from 'styled-components';
import Styled from '/imports/ui/components/settings/submenus/styles';
import { jumboPaddingY } from '/imports/ui/stylesheets/styled-components/general';

const Title = styled(Styled.Title)``;

const SubTitle = styled(Styled.SubTitle)``;

const Form = styled(Styled.Form)``;

const Row = styled(Styled.Row)``;

const Col = styled(Styled.Col)``;

const FormElement = styled(Styled.FormElement)``;

const FormElementRight = styled(Styled.FormElementRight)``;

const Label = styled(Styled.Label)``;

const PresenterAwaySection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${jumboPaddingY};
  margin-top: ${jumboPaddingY};
`;

const ColHeading = styled(Styled.Col)`
  display: block;
  text-align: end;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  font-weight: bold;
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
  ColHeading,
  PresenterAwaySection,
};
