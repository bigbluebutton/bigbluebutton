import React, { useContext } from 'react';
import { JoinContext } from '/imports/ui/components/components-data/join-context/context';
import LoadingScreen from '/imports/ui/components/common/loading-screen/component';
import ErrorScreen from '/imports/ui/components/error-screen/component';

const JoinLoading = ({ children }) => {
  const usingJoinContext = useContext(JoinContext);
  const { joinState } = usingJoinContext;
  const { isLoading, hasError } = joinState;

  const codeError = Session.get('codeError');

  return (
    <>
      { (isLoading && !hasError) && (<LoadingScreen />) }
      { hasError ? (
        <ErrorScreen code={codeError} />
      ) : children }
    </>
  );
};

export default JoinLoading;
