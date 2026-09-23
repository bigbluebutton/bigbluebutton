import styled from 'styled-components';
import {
  colorGrayLabel,
  noticeWarningBg,
  noticeWarningBorder,
  noticeWarningText,
  noticeWarningIcon,
} from '/imports/ui/stylesheets/styled-components/palette';
import { mdPaddingX } from '/imports/ui/stylesheets/styled-components/general';
import {
  fontSizeBase,
  fontSizeMedium,
  fontSizeSmall,
  btnFontWeight,
  headingsFontWeight,
  textFontWeight,
} from '/imports/ui/stylesheets/styled-components/typography';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import PreFlightStyled from '../styles';

const NoticeBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  border: 1px solid ${noticeWarningBorder};
  border-radius: 62.5rem;
  color: ${noticeWarningText};
  background-color: ${noticeWarningBg};
  font-size: ${fontSizeSmall};
  font-weight: ${btnFontWeight};
  line-height: 1.25rem;

  & > svg {
    width: 1rem;
    height: 1rem;
    color: ${noticeWarningIcon};
  }
`;

const ErrorBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  max-width: 100%;
`;

const ErrorText = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${mdPaddingX};
  max-width: 100%;
`;

const ErrorHeading = styled(PreFlightStyled.Heading)`
  max-width: 27rem;
  font-weight: ${headingsFontWeight};
  line-height: 2.75rem;

  @media ${smallOnly} {
    line-height: normal;
  }
`;

const ErrorDescription = styled(PreFlightStyled.Description)`
  max-width: 25rem;
  font-size: ${fontSizeMedium};

  @media ${smallOnly} {
    font-size: ${fontSizeBase};
  }
`;

const ErrorNotice = styled.div`
  max-width: 25rem;
  color: ${colorGrayLabel};
  font-size: ${fontSizeSmall};
  font-weight: ${textFontWeight};
`;

export default {
  NoticeBadge,
  ErrorBlock,
  ErrorText,
  ErrorHeading,
  ErrorDescription,
  ErrorNotice,
};
