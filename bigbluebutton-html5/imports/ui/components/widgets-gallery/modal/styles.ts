import styled from 'styled-components';
import ModalSimple from '/imports/ui/components/common/modal/simple/component';
import Button from '/imports/ui/components/common/button/component';
import { widgetsPanelTextColor } from '/imports/ui/stylesheets/styled-components/palette';
import {
  lgBorderRadius,
  widgetsModalButtonPaddingX,
  widgetsModalButtonPaddingY,
  widgetsModalPadding,
  widgetsModalPaddingBottom,
} from '/imports/ui/stylesheets/styled-components/general';
import { titlesFontWeight } from '/imports/ui/stylesheets/styled-components/typography';

const Modal = styled(ModalSimple)`
  padding: ${widgetsModalPadding} ${widgetsModalPadding} ${widgetsModalPaddingBottom} ${widgetsModalPadding};
  color: ${widgetsPanelTextColor};
`;

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Title = styled.div`
  text-align: center;
  font-weight: ${titlesFontWeight};
  font-size: calc(1.3rem);
  white-space: normal;
  margin: 0px 0px 1rem;
  line-height: calc(2rem);
  color: ${widgetsPanelTextColor};
`;

const SubTitle = styled.div`
  font-style: normal;
  font-weight: ${titlesFontWeight};
  line-height: normal;
`;

const Description = styled.div`
`;

const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

// @ts-expect-error -> Untyped component.
const ConfirmButton = styled(Button)`
  padding: ${widgetsModalButtonPaddingY} ${widgetsModalButtonPaddingX};
  border-radius: ${lgBorderRadius};
  align-self: flex-end;
`;

export default {
  Modal,
  ModalContent,
  Title,
  SubTitle,
  Description,
  ButtonWrapper,
  ConfirmButton,
};
