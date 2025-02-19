import styled from 'styled-components';
import Select from '@mui/material/Select';
import {
  colorGrayDark,
  colorLink,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  fontSizeSmall, textFontWeight,
} from '/imports/ui/stylesheets/styled-components/typography';

const CaptionsSelectorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const CaptionsLanguageText = styled.div`
  color: ${colorGrayDark};
  font-size: ${fontSizeSmall};
  font-weight: ${textFontWeight};
`;

const CaptionsTerms = styled.div`
  padding-left: 2.7rem;
  color: ${colorGrayDark};
  font-size: ${fontSizeSmall};
  font-weight: ${textFontWeight};
`;

const CaptionsTermsLink = styled.a`
  color: ${colorLink};
`;

const CaptionsSelector = styled(Select)`
  height: 3.5rem;
  flex: 1;
  border-radius: 0.5rem !important;
  overflow: hidden;
  width: 100%;
`;

export default {
  CaptionsSelectorContainer,
  CaptionsLanguageText,
  CaptionsTerms,
  CaptionsTermsLink,
  CaptionsSelector,
};
