import styled from 'styled-components';
import { colorWhite } from '/imports/ui/stylesheets/styled-components/palette';
import { fontSizeLarge, fontSizeBase } from '/imports/ui/stylesheets/styled-components/typography';

const AutoplayOverlay = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  background: rgba(0, 0, 0, 1);
  height: 100%;
  width: 100%;
  color: ${colorWhite};
  font-size: ${fontSizeLarge};
  border-radius: 5px;
  position: absolute;
  z-index: 9999;
  text-align: center;
`;

const Title = styled.div`
  display: block;
  font-size: ${fontSizeLarge};
  text-align: center;
`;

const AutoplayOverlayContent = styled.div`
  text-align: center;
  margin-top: 8px;
`;

const Label = styled.div`
  display: block;
  font-size: ${fontSizeBase};
  text-align: center;
  margin-bottom: 12px;
`;

export default {
  AutoplayOverlay,
  Title,
  AutoplayOverlayContent,
  Label,
};
