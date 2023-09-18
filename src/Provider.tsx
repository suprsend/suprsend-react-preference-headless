import React, { useEffect, Fragment, memo } from 'react';
import { useConfigStore, usePreferenceStore } from './state';
import PreferencesApi from './api';
import { IProviderProps } from './types';

function SuprSendPreferenceProvider({
  workspace_key,
  distinct_id,
  access_token,
  tenant_id,
  children,
}: IProviderProps) {
  useEffect(() => {
    useConfigStore.setState(() => ({
      workspace_key,
      distinct_id,
      user_token: access_token,
      tenant_id: tenant_id || 'default',
    }));

    const preferenceData = usePreferenceStore.getState();
    if (
      distinct_id &&
      access_token &&
      workspace_key &&
      !preferenceData.preferenceInstance
    ) {
      const preference = new PreferencesApi();
      usePreferenceStore.setState(() => ({
        preferenceInstance: preference,
      }));
    }
  }, [distinct_id, access_token, tenant_id, workspace_key]);

  return <Fragment>{children}</Fragment>;
}

export default memo(
  SuprSendPreferenceProvider
) as typeof SuprSendPreferenceProvider;
