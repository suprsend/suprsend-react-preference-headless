import { create } from 'zustand';
import { IConfigStore, IPreferencesStore } from './types';

export const useConfigStore = create<IConfigStore>()(() => ({
  workspace_key: null,
  distinct_id: null,
  user_token: null,
  tenant_id: 'default',
  api_url: 'https://hub.suprsend.com',
  preference_debounce: 1000,
}));

export const usePreferenceStore = create<IPreferencesStore>()(() => ({
  sections: null,
  channel_preferences: null,
  preferenceInstance: null,
}));
