import styled from 'styled-components';
import { Radio, RadioGroup } from '@mui/material';
import { styled as materialStyled } from '@mui/material/styles';
import {
  appsPanelTextColor,
  colorBorder,
  colorPrimary,
  colorStandout,
} from '/imports/ui/stylesheets/styled-components/palette';
import Styled from '/imports/ui/components/settings/submenus/styles';
import {
  fontSizeBase,
  fontSizeSmall,
  headingsFontWeight,
  textFontWeight,
  titlesFontWeight,
} from '/imports/ui/stylesheets/styled-components/typography';

const Form = styled(Styled.Form)``;

const AudioMenuContainer = styled.div`
  padding-bottom: 1.5rem;
`;

const AudioTitle = styled(Styled.Title)`
  color: ${appsPanelTextColor};
  font-size: ${fontSizeBase};
  font-style: normal;
  font-weight: ${titlesFontWeight};
  line-height: normal;
  margin-bottom: 0.5rem;
`;

const AudioSubtitle = styled(Styled.SubTitle)`
  color: ${appsPanelTextColor};
  font-size: ${fontSizeBase};
  font-style: normal;
  font-weight: ${textFontWeight};
  line-height: normal;
  margin: 0;
  padding-bottom: 1.5rem;
`;

const RoundRadio = materialStyled(Radio)(() => ({
  width: 24,
  height: 24,
  aspectRatio: '1/1',
  padding: 0,
  color: colorBorder,
  '&.Mui-checked': {
    color: colorPrimary,
  },
  '&.Mui-disabled': {
    color: colorBorder,
    opacity: 0.5,
  },
}));

const FilterGroup = styled(RadioGroup)`
  width: 100%;
  gap: 1rem;
`;

const FilterOptionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FilterOptionTitle = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  color: ${appsPanelTextColor};
  font-size: ${fontSizeBase};
  font-style: normal;
  font-weight: ${headingsFontWeight};
  line-height: normal;
`;

const ExperimentalBadge = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 1.25rem;
  padding: 0 0.4rem;
  border: 1px solid ${colorStandout};
  border-radius: 0.25rem;
  color: ${colorStandout};
  font-size: ${fontSizeSmall};
  font-weight: ${textFontWeight};
  line-height: 1;
`;

const FilterOptionDescription = styled.p`
  margin: 0 0 0 calc(24px + 0.5rem);
  color: ${appsPanelTextColor};
  font-size: ${fontSizeSmall};
  font-style: normal;
  font-weight: ${textFontWeight};
  line-height: normal;

  [dir="rtl"] & {
    margin-right: calc(24px + 0.5rem);
    margin-left: 0;
  }
`;

const FilterOption = styled.label`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  cursor: pointer;

  &:has(input:disabled) {
    cursor: not-allowed;

    ${FilterOptionTitle}, ${FilterOptionDescription} {
      opacity: 0.5;
    }
  }
`;

export default {
  Form,
  AudioMenuContainer,
  AudioTitle,
  AudioSubtitle,
  RoundRadio,
  FilterGroup,
  FilterOption,
  FilterOptionHeader,
  FilterOptionTitle,
  ExperimentalBadge,
  FilterOptionDescription,
};
