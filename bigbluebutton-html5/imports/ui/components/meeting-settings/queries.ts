import { gql } from '@apollo/client';

export interface getBigblueButtonSettingsResponse {
  meeting: Meeting[]
}

interface ClientSettings {
  clientSettingsJson: string; // You might need to adjust the type based on the actual JSON structure
}

interface Meeting {
    clientSettings: ClientSettings;
}

export const getBigblueButtonSettings = gql`
  query getClientSettings {
    meeting {
      clientSettings {
        clientSettingsJson
      }
    }
  }
`;

export default {
  getBigblueButtonSettings,
};
