import styled from 'styled-components';
import {
  jumboPaddingY,
  lgPaddingX,
  smPaddingX,
  modalMargin,
  lgPaddingY,
  titlePositionLeft,
  mdPaddingX,
} from '../../stylesheets/styled-components/general';
import { fontSizeLarge, fontSizeBase, fontSizeSmall } from '/imports/ui/stylesheets/styled-components/typography';
import { colorGray, colorGrayDark, colorGrayLabel, colorGrayLighter } from '../../stylesheets/styled-components/palette';
import Modal from '/imports/ui/components/common/modal/simple/component';
import Button from '/imports/ui/components/common/button/component';

const ToggleLabel = styled.span`
  margin-right: ${smPaddingX};

  [dir="rtl"] & {
    margin: 0 0 0 ${smPaddingX};
  }
`;

const LockViewersModal = styled(Modal)`
  padding: ${jumboPaddingY};
`;

const Container = styled.div`
  margin: 0 ${modalMargin} ${lgPaddingX};
`;

const Header = styled.div`
  margin: 0;
  padding: 0;
  border: none;
  line-height: ${titlePositionLeft};
  margin-bottom: ${lgPaddingY};
`;

const Title = styled.h2`
  left: ${titlePositionLeft};
  right: auto;
  color: ${colorGrayDark};
  font-weight: bold;
  font-size: ${fontSizeLarge};
  text-align: center;

  [dir="rtl"] & {
    left: auto;
    right: ${titlePositionLeft};
  }
`;

const Description = styled.div`
  text-align: center;
  color: ${colorGray};
  margin-bottom: ${jumboPaddingY};
`;

const Form = styled.div`
  display: flex;
  flex-flow: column;
  border-bottom: 1px solid ${colorGrayLighter};
`;

const SubHeader = styled.header`
  display: flex;
  flex-flow: row;
  flex-grow: 1;
  justify-content: space-between;
  color: ${colorGrayLabel};
  font-size: ${fontSizeBase};
  margin-bottom: ${titlePositionLeft};
`;

const Bold = styled.div`
  font-weight: bold;
`;

const Row = styled.div`
  display: flex;
  flex-flow: row;
  flex-grow: 1;
  justify-content: space-between;
  margin-bottom: ${mdPaddingX};

  & > :first-child {
    margin:  0 ${mdPaddingX} 0 0;

    [dir="rtl"] & {
      margin: 0 0 0 ${mdPaddingX};
    }
  }
`;

const Col = styled.div`
  display: flex;
  flex-grow: 1;
  flex-basis: 0;
  margin: 0;

  [dir="rtl"] & {
    margin: 0;
  }
`;

const FormElement = styled.div`
  position: relative;
  display: flex;
  flex-flow: column;
  flex-grow: 1;
`;

const FormElementRight = styled(FormElement)`
  display: flex;
  justify-content: flex-end;
  flex-flow: row;
  align-items: center;
`;

const Label = styled.div`
  color: ${colorGrayLabel};
  font-size: ${fontSizeSmall};
  margin-bottom: ${lgPaddingY};
`;

const Footer = styled.div`
  display: flex;
  margin: ${smPaddingX} ${modalMargin} 0;
`;

const Actions = styled.div`
  margin-left: auto;
  margin-right: 0;

  [dir="rtl"] & {
    margin-right: auto;
    margin-left: 3px;
  }
`;

const ButtonCancel = styled(Button)`
  margin: 0 0.25rem;
`;

const ButtonApply = styled(Button)`
  margin: 0 0.25rem;
`;

export default {
  ToggleLabel,
  LockViewersModal,
  Container,
  Header,
  Title,
  Description,
  Form,
  SubHeader,
  Bold,
  Row,
  Col,
  FormElement,
  FormElementRight,
  Label,
  Footer,
  Actions,
  ButtonCancel,
  ButtonApply,
};
