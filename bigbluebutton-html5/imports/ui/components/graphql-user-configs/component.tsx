import React, { ReactNode } from 'react';
import LoadingScreen from '/imports/ui/components/common/loading-screen/component';
import { useQuery } from '@apollo/client';
import logger from '/imports/startup/client/logger';
import {USER_CUSTOM_PARAMETER_QUERY} from "/imports/ui/components/graphql-user-configs/queries";

interface CustomParameter {
  parameter: string;
  value: string;
}

interface QueryData {
  user_customParameter: CustomParameter[];
}

interface GraphqlUserConfigsProps {
  children: ReactNode;
}

const GraphqlUserConfigs: React.FC<GraphqlUserConfigsProps> = ({ children }) => {
  const { loading, error, data } = useQuery<QueryData>(USER_CUSTOM_PARAMETER_QUERY);

  if (loading || error) return <LoadingScreen>{}</LoadingScreen>;

  if (data) {
    data.user_customParameter.forEach((customParameter) => {
      try {
        const parsedValue = JSON.parse(customParameter.value.toLowerCase().trim());
        Session.set(`cparam_${customParameter.parameter}`, parsedValue);
      } catch (error) {
        Session.set(`cparam_${customParameter.parameter}`, customParameter.value);
        logger.warn(`userCustomParameter:Parameter ${customParameter.parameter} could not be parsed (was not json)`);
      }
    });
  }

  return <>{children}</>;
};

export default GraphqlUserConfigs;
