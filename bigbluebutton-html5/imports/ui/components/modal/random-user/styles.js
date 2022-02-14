import styled from 'styled-components';
import Button from '/imports/ui/components/common/button/component';
import {
  fontSizeLarge,
  fontSizeXXL,
  headingsFontWeight,
} from '/imports/ui/stylesheets/styled-components/typography';
import {
  mdPaddingX,
  smPaddingX,
} from '/imports/ui/stylesheets/styled-components/general';

const ModalViewContainer = styled.div`
  display: flex;
  flex-flow: column;
  align-items: center;
`;

const ModalViewTitle = styled.div`
  font-weight: 600;
  font-size: ${fontSizeLarge};
  margin-bottom: ${mdPaddingX};
`;

const ModalAvatar = styled.div`
  height: 6rem;
  width: 6rem;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: ${fontSizeXXL};
  font-weight: 400;
  margin-bottom: ${smPaddingX};
  text-transform: capitalize;
`;

const SelectedUserName = styled.div`
  margin-bottom: ${mdPaddingX};;
  font-weight: ${headingsFontWeight};
  font-size: 2rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  position: relative;
  width: 100%;
  text-align: center;
`;

const SelectButton = styled(Button)`
  margin-bottom: ${mdPaddingX};
`;

export default {
  ModalViewContainer,
  ModalViewTitle,
  ModalAvatar,
  SelectedUserName,
  SelectButton,
};
