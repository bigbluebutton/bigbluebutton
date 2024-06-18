import { gql } from '@apollo/client';

export const CAPTION_ADD_LOCALE = gql`
  mutation CaptionAddLocale($locale: String!) {
    captionAddLocale(
      locale: $locale
    )
  }
`;

export default CAPTION_ADD_LOCALE;
