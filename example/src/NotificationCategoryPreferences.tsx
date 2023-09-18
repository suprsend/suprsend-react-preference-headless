import * as React from 'react';
import Switch from 'react-switch';
import Checkbox from './CheckBox';
import {
  ICategory,
  IPreferenceState,
  IUseUpdatePreferences,
  PreferenceOptions,
  useUpdatePreferences,
  ICategoryChannel,
} from '../../';

const handleCategoryPreferenceChange = (
  data: boolean,
  subcategory: ICategory,
  update_category_preference: IUseUpdatePreferences['update_category_preference'],
  setuserToken: (val: string) => void
) => {
  const resp = update_category_preference?.(
    subcategory.category,
    data ? PreferenceOptions.OPT_IN : PreferenceOptions.OPT_OUT
  );
  if (resp?.error) {
    if (resp.response.type === 'TOKEN_EXPIRED') {
      // refresh token api call
      // setuserToken('<new jwt token>');
    } else {
      console.log(resp.response.message);
    }
  }
};

const handleChannelPreferenceInCategoryChange = (
  channel: ICategoryChannel,
  subcategory: ICategory,
  update_channel_preference_in_category: IUseUpdatePreferences['update_channel_preference_in_category'],
  setuserToken: (val: string) => void
) => {
  if (!channel.is_editable) return;

  const resp = update_channel_preference_in_category?.(
    channel.channel,
    channel.preference === PreferenceOptions.OPT_IN
      ? PreferenceOptions.OPT_OUT
      : PreferenceOptions.OPT_IN,
    subcategory.category
  );
  if (resp?.error) {
    if (resp.response.type === 'TOKEN_EXPIRED') {
      // refresh token api call
      // setuserToken('<new jwt token>');
    } else {
      console.log(resp.response.message);
    }
  }
};

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
                          handleCategoryPreferenceChange(
                            data,
                            subcategory,
                            update_category_preference,
                            setuserToken
                          );
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
                            handleChannelPreferenceInCategoryChange(
                              channel,
                              subcategory,
                              update_channel_preference_in_category,
                              setuserToken
                            );
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
