import styled from 'styled-components';
import BaseIcon from '/imports/ui/components/common/icon/component';
import { colorGray } from '/imports/ui/stylesheets/styled-components/palette';
import { $3xlPadding, smPadding } from '/imports/ui/stylesheets/styled-components/general';

export const Root = styled.div`
  color: ${colorGray};
  padding: 0 ${$3xlPadding};
  width: 100%;
  text-align: center;
`;

export const Icon = styled(BaseIcon)`
  vertical-align: baseline;

  [dir='ltr'] & {
    margin-right: ${smPadding};
  }

  [dir='rtl'] & {
    margin-left: ${smPadding};
  }
`;

export const Typography = styled.p`
  display: inline;
  margin: 0;
  vertical-align: baseline;
  overflow-wrap: break-word;
  white-space: pre-wrap;
`;

export default {
  Root,
  Icon,
  Typography,
};
