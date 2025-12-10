import styled from 'styled-components';
import BaseIcon from '/imports/ui/components/common/icon/component';
import { colorGray } from '/imports/ui/stylesheets/styled-components/palette';
import { $3xlPadding, smPadding } from '/imports/ui/stylesheets/styled-components/general';

export const Root = styled.div`
  color: ${colorGray};
  padding: 0 ${$3xlPadding};
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
`;

export const Icon = styled(BaseIcon)`
  flex-shrink: 0;

  [dir='ltr'] & {
    margin-right: ${smPadding};
  }

  [dir='rtl'] & {
    margin-left: ${smPadding};
  }
`;

export const Typography = styled.p`
  margin: 0;
  white-space: pre-wrap;
  word-break: normal;
  overflow-wrap: normal;
  text-align: center;
`;

export default {
  Root,
  Icon,
  Typography,
};
