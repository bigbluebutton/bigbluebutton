import { IntlShape } from 'react-intl';

export interface AudioCaptionsTextControlsProps {
  intl: IntlShape;
  textActive: boolean;
  captionLocale: string;
  availableCaptions: string[];
}
