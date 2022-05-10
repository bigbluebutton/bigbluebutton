import UserAvatar from '/imports/ui/components/user-avatar/component';
import {
  userIndicatorsOffset,
  mdPaddingY,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  colorPrimary,
} from '/imports/ui/stylesheets/styled-components/palette';
import styled from 'styled-components';

const UserAvatarStyled = styled(UserAvatar)`
  height: 60%;
  width: 45%;
  max-width: 66px;
  max-height: 66px;

  ${({ unhealthyStream }) => unhealthyStream && `
    filter: grayscale(50%) opacity(50%);
  `}

  ${({ dialIn }) => dialIn && `
    &:before {
      content: "\\00a0\\e91a\\00a0";
      padding: ${mdPaddingY};
      opacity: 1;
      top: ${userIndicatorsOffset};
      right: ${userIndicatorsOffset};
      bottom: auto;
      left: auto;
      border-radius: 50%;
      background-color: ${colorPrimary};
      padding: 0.7rem !important;

      [dir="rtl"] & {
        left: auto;
        right: ${userIndicatorsOffset};
        letter-spacing: -.33rem;
      }
    }
  `}

    ${({ presenter }) => presenter && `
    &:before {
      padding: 0.7rem !important;
    }
  `};
`;

export default {
  UserAvatarStyled,
};
