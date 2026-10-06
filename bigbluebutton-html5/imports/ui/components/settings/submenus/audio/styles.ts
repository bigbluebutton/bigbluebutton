import styled from 'styled-components';
import { Radio, RadioGroup } from '@mui/material';
import { styled as materialStyled } from '@mui/material/styles';
import {
  appsPanelTextColor,
  colorBlueAux,
  colorBorder,
  colorPrimary,
  defaultBorder,
} from '/imports/ui/stylesheets/styled-components/palette';
import Styled from '/imports/ui/components/settings/submenus/styles';
import { lgBorderRadius } from '/imports/ui/stylesheets/styled-components/general';
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
  color: ${appsPanelTextColor};
  font-size: ${fontSizeBase};
  font-style: normal;
  font-weight: ${headingsFontWeight};
  line-height: normal;
`;

const FilterOptionDescription = styled.p`
  margin: 0;
  color: ${appsPanelTextColor};
  font-size: ${fontSizeSmall};
  font-style: normal;
  font-weight: ${textFontWeight};
  line-height: normal;
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

const SectionTabList = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 1rem;
  margin-bottom: 1.5rem;
  border: 1px solid ${defaultBorder};
  border-radius: ${lgBorderRadius};
`;

const SectionTab = styled.button<{ $selected: boolean }>`
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: ${lgBorderRadius};
  background: ${({ $selected }) => ($selected ? colorBlueAux : 'transparent')};
  color: ${appsPanelTextColor};
  font-size: ${fontSizeBase};
  font-weight: ${textFontWeight};
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${colorPrimary};
    outline-offset: 2px;
  }
`;

const SectionTabDivider = styled.span`
  align-self: stretch;
  width: 1px;
  background: ${defaultBorder};
`;

const DeviceTestContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SectionHeader = styled.div`
  display: flex;
  flex-direction: column;
`;

const SectionDescription = styled.p`
  margin: 0;
  max-width: 28rem;
  color: ${appsPanelTextColor};
  font-size: ${fontSizeBase};
  font-weight: ${textFontWeight};
`;

const SpeakerRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 1.5rem;
`;

const SpeakerSelect = styled.div`
  flex: 1 1 16rem;
  min-width: 0;
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
  FilterOptionDescription,
  SectionTabList,
  SectionTab,
  SectionTabDivider,
  DeviceTestContainer,
  SectionHeader,
  SectionDescription,
  SpeakerRow,
  SpeakerSelect,
};
