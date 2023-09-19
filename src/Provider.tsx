import React, { useEffect, Fragment, memo } from 'react';
import { useConfigStore, usePreferenceStore } from './state';
import PreferencesApi from './api';
import { IProviderProps } from './types';

function SuprSendPreferenceProvider({
  workspaceKey,
  distinctID,
  accessToken,
  tenantID,
  children,
}: IProviderProps) {
  useEffect(() => {
    useConfigStore.setState(() => ({
      workspace_key: workspaceKey,
      distinct_id: distinctID,
      user_token: accessToken,
      tenant_id: tenantID || 'default',
    }));

    const preferenceData = usePreferenceStore.getState();
    if (
      distinctID &&
      accessToken &&
      workspaceKey &&
      !preferenceData.preferenceInstance
    ) {
      const preference = new PreferencesApi();
      usePreferenceStore.setState(() => ({
        preferenceInstance: preference,
      }));
    }
  }, [distinctID, accessToken, tenantID, workspaceKey]);

  return <Fragment>{children}</Fragment>;
}

export default memo(
  SuprSendPreferenceProvider
) as typeof SuprSendPreferenceProvider;
