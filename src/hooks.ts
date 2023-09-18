import { useEffect, useState } from 'react';
import { Emitter } from 'mitt';
import { useConfigStore, usePreferenceStore } from './state';
import {
  IPreferenceAPIReponse,
  IPreferenceErrorData,
  IPreferencesResponse,
  IUseUpdatePreferences,
} from './types';

const initialResponseObj = {
  loading: true,
  error: false,
  data: null,
};

export function usePreferences(): IPreferencesResponse {
  const [getResponse, setGetResponse] = useState<IPreferencesResponse>(
    initialResponseObj
  );

  const configData = useConfigStore();
  const preferenceData = usePreferenceStore();

  useEffect(() => {
    if (getResponse.data) return; // when jwt refreshed dont call get_preferences again

    preferenceData.preferenceInstance
      ?.get_preferences()
      .then((data: IPreferenceAPIReponse) => {
        let response: IPreferencesResponse = { ...initialResponseObj };
        response.loading = false;
        if (data.error) {
          response.error = true;
          response.error_data = data;
        } else {
          response.data = data;
        }
        setGetResponse(response);
      });
  }, [configData]);

  // when get_preference is triggered internally ex: overall_channel_pref method update client
  useEffect(() => {
    if (getResponse.data) {
      setGetResponse(prev => {
        return {
          ...prev,
          data: {
            channel_preferences: preferenceData.channel_preferences,
            sections: preferenceData.sections,
          },
        };
      });
    }
  }, [preferenceData]);

  return getResponse;
}

export function usePreferenceEvent() {
  const preference = usePreferenceStore();
  const mittEvent: Emitter<{
    preferences_error: IPreferenceErrorData;
  }> | null = preference?.preferenceInstance?.emitter;

  return mittEvent;
}

export function useUpdatePreferences(): IUseUpdatePreferences {
  const preference = usePreferenceStore();

  return {
    update_category_preference: preference.preferenceInstance?.update_category_preference.bind(
      preference.preferenceInstance
    ),
    update_channel_preference_in_category: preference.preferenceInstance?.update_channel_preference_in_category.bind(
      preference.preferenceInstance
    ),
    update_overall_channel_preference: preference.preferenceInstance?.update_overall_channel_preference.bind(
      preference.preferenceInstance
    ),
  };
}
