import styled from 'styled-components';
import Styled from '/imports/ui/components/user-list/user-list-content/translations/styles';

const TranslationOriginalVolumePanel = styled.div`
  margin: 8px 0 8px 4px;
`;

const InterpretationVolumeWrapper = styled.div`
  display: table;
`;

const InterpretationVolumeOriginal = styled.div`
  display: table-cell;
  text-align: left;
  vertical-align: middle;
  width: 50%;
`;

const InterpretationVolumeInterpretation = styled.div`
  display: table-cell;
  text-align: right;
  vertical-align: middle;
  width: 50%;
`;

const Container = styled(Styled.TranslationContainer)``;

const SmallTitle = styled(Styled.SmallTitle)``;

export default {
  TranslationOriginalVolumePanel,
  InterpretationVolumeWrapper,
  InterpretationVolumeOriginal,
  InterpretationVolumeInterpretation,
  Container,
  SmallTitle,
};
