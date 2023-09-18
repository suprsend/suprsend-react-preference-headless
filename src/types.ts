import PreferencesApi from './api';
import { PreferenceOptions, ChannelLevelPreferenceOptions } from './api';

export interface ICategoryChannel {
  channel: string;
  preference: PreferenceOptions;
  is_editable: boolean;
}

export interface ICategory {
  name: string;
  category: string;
  description?: string | null;
  preference: PreferenceOptions;
  is_editable: boolean;
  channels?: ICategoryChannel[] | null;
}

export interface ISection {
  name?: string | null;
  description?: string | null;
  subcategories?: ICategory[] | null;
}

export interface IChannelPreference {
  channel: string;
  is_restricted: boolean;
}

export interface IPreferenceState {
  sections: ISection[] | null;
  channel_preferences: IChannelPreference[] | null;
}

export interface IErrorResponse {
  type?: string;
  message?: string;
}

export interface IPreferenceErrorData {
  error: boolean;
  is_api_error?: boolean;
  status_code?: number | null;
  response: IErrorResponse;
}

export interface IPreferencesResponse {
  loading: boolean;
  error: boolean;
  error_data?: IPreferenceErrorData;
  data: IPreferenceState | null;
}

export interface IPreferenceAPIReponse
  extends IPreferenceState,
    IPreferenceErrorData {}

export interface IProviderProps {
  workspace_key: string;
  distinct_id: string | null;
  access_token: string | null;
  tenant_id?: string;
  children: React.ReactElement | React.ReactElement[];
}

export interface IPreferencesStore extends IPreferenceState {
  preferenceInstance: PreferencesApi | null;
}

export interface IConfigStore {
  workspace_key: string | null;
  distinct_id: any;
  user_token: string | null;
  tenant_id: string;
  api_url: string;
  preference_debounce: number;
}

export interface IUseUpdatePreferences {
  update_category_preference?: (
    category: string,
    preference: PreferenceOptions
  ) => IPreferenceAPIReponse;

  update_channel_preference_in_category?: (
    channel: string,
    preference: PreferenceOptions,
    category: string
  ) => IPreferenceAPIReponse;
  update_overall_channel_preference?: (
    channel: string,
    preference: ChannelLevelPreferenceOptions
  ) => IPreferenceAPIReponse;
}
