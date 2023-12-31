import * as React from 'react';
import Switch from 'react-switch';
import Checkbox from './CheckBox';
import { handleError } from './Preference';
import {
  IPreferenceState,
  PreferenceOptions,
  useUpdatePreferences,
} from '@suprsend/react-preferences-headless';

interface INotificationCategoryPreferencesProps {
  preferenceData?: IPreferenceState | null;
  setuserToken: (val: string) => void;
}

export default function NotificationCategoryPreferences({
  preferenceData,
  setuserToken,
}: INotificationCategoryPreferencesProps) {
  const {
    update_category_preference,
    update_channel_preference_in_category,
  } = useUpdatePreferences();

  if (!preferenceData?.sections) {
    return <p>No Data</p>;
  }
  return (
    <div>
      {preferenceData.sections?.map((section, index) => {
        return (
          <div style={{ marginBottom: 24 }} key={index}>
            {section?.name && (
              <div
                style={{
                  backgroundColor: '#FAFBFB',
                  paddingTop: 12,
                  paddingBottom: 12,
                  marginBottom: 18,
                }}
              >
                <p
                  style={{
                    fontSize: 18,
                    fontWeight: 500,
                    color: '#3D3D3D',
                  }}
                >
                  {section.name}
                </p>
                <p style={{ color: '#6C727F' }}>{section.description}</p>
              </div>
            )}

            {section?.subcategories?.map((subcategory, index) => {
              return (
                <div
                  key={index}
                  style={{
                    borderBottom: '1px solid #D9D9D9',
                    paddingBottom: 12,
                    marginTop: 18,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontSize: 16,
                          fontWeight: 600,
                          color: '#3D3D3D',
                        }}
                      >
                        {subcategory.name}
                      </p>
                      <p style={{ color: '#6C727F', fontSize: 14 }}>
                        {subcategory.description}
                      </p>
                    </div>
                    <div>
                      <Switch
                        disabled={!subcategory.is_editable}
                        onChange={data => {
                          const preference = data
                            ? PreferenceOptions.OPT_IN
                            : PreferenceOptions.OPT_OUT;

                          const resp = update_category_preference?.(
                            subcategory.category,
                            preference
                          );
                          if (resp?.error) {
                            handleError(resp, setuserToken); // synchronous client side errors thrown by sdk will be handled here
                          }
                        }}
                        uncheckedIcon={false}
                        checkedIcon={false}
                        height={20}
                        width={40}
                        onColor="#2563EB"
                        checked={
                          subcategory.preference === PreferenceOptions.OPT_IN
                        }
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                    {subcategory?.channels?.map((channel, index) => {
                      return (
                        <Checkbox
                          key={index}
                          selected={
                            channel.preference === PreferenceOptions.OPT_IN
                          }
                          title={channel.channel}
                          disabled={!channel.is_editable}
                          onClick={() => {
                            if (!channel.is_editable) return;
                            const preference =
                              channel.preference === PreferenceOptions.OPT_IN
                                ? PreferenceOptions.OPT_OUT
                                : PreferenceOptions.OPT_IN;
                            const resp = update_channel_preference_in_category?.(
                              channel.channel,
                              preference,
                              subcategory.category
                            );
                            if (resp?.error) {
                              handleError(resp, setuserToken); // synchronous client side errors thrown by sdk will be handled here
                            }
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
