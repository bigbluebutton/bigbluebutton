import type { useMutation } from '@apollo/client/react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-creation/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const projectMutationResult = (result: useMutation.Result<any>): PluginSdk.MutationResultObject => ({
  called: result.called,
  data: result.data,
  error: result.error,
  loading: result.loading,
});

export default projectMutationResult;
