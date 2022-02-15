import styled from 'styled-components';
import { colorGrayDark, colorGray } from '/imports/ui/stylesheets/styled-components/palette';
import {
  jumboPaddingY,
  lgPaddingX,
  lgPaddingY,
  titlePositionLeft,
  modalMargin,
} from '/imports/ui/stylesheets/styled-components/general';
import { fontSizeLarge } from '/imports/ui/stylesheets/styled-components/typography';
import Modal from '/imports/ui/components/common/modal/simple/component';
import Button from '/imports/ui/components/common/button/component';

const GuestPolicyModal = styled(Modal)`
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

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const GuestPolicyButton = styled(Button)`
  width: 200px;
  box-sizing: border-box;
  margin: 5px;

  ${({ disabled }) => disabled && `
    & > span {
      text-decoration: underline;
    }
  `}
`;

export default {
  GuestPolicyModal,
  Container,
  Header,
  Title,
  Description,
  Content,
  GuestPolicyButton,
};
