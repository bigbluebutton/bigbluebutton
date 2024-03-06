import { gql } from '@apollo/client';

export interface getBigBlueButtonSettingsResponse {
  meeting: Meeting[]
}

interface ClientSettings {
  clientSettingsJson: string; // You might need to adjust the type based on the actual JSON structure
}

interface Meeting {
    clientSettings: ClientSettings;
}

export const getBigBlueButtonSettings = gql`
  query getClientSettings {
    meeting {
      clientSettings {
        clientSettingsJson
      }
    }
  }
`;

export default {
  getBigBlueButtonSettings,
};
