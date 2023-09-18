import * as React from 'react';
import {
  useUpdatePreferences,
  ChannelLevelPreferenceOptions,
  IPreferenceState,
  IChannelPreference,
} from '../../';

interface IChannelLevelPreferernceItemProps {
  channel: IChannelPreference;
}

function ChannelLevelPreferernceItem({
  channel,
}: IChannelLevelPreferernceItemProps) {
  const [isActive, setIsActive] = React.useState(false);
  const { update_overall_channel_preference } = useUpdatePreferences();

  return (
    <div
      style={{
        border: '1px solid #D9D9D9',
        borderRadius: 5,
        padding: '12px 24px',
        marginBottom: 24,
      }}
    >
      <div
        style={{
          cursor: 'pointer',
        }}
        onClick={() => setIsActive(!isActive)}
      >
        <p
          style={{
            fontSize: 18,
            fontWeight: 500,
            color: '#3D3D3D',
          }}
        >
          {channel.channel}
        </p>
        <p style={{ color: '#6C727F', fontSize: 14 }}>
          {channel.is_restricted
            ? 'Allow required notifications only'
            : 'Allow all notifications'}
        </p>
      </div>
      {isActive && (
        <div style={{ marginTop: 12, marginLeft: 24 }}>
          <p
            style={{
              color: '#3D3D3D',
              fontSize: 16,
              fontWeight: 500,
              marginTop: 12,
              borderBottom: '1px solid #E8E8E8',
            }}
          >
            {channel.channel} Preferences
          </p>
          <div style={{ marginTop: 12 }}>
            <div style={{ marginBottom: 8 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <div>
                  <input
                    type="radio"
                    name={`all- ${channel.channel}`}
                    value={'true'}
                    id={`all- ${channel.channel}`}
                    checked={!channel.is_restricted}
                    onChange={() => {
                      const resp = update_overall_channel_preference?.(
                        channel.channel,
                        ChannelLevelPreferenceOptions.ALL
                      );
                      if (resp?.error) {
                        console.log(resp.message);
                      }
                    }}
                  />
                </div>
                <label
                  htmlFor={`all- ${channel.channel}`}
                  style={{ marginLeft: 12 }}
                >
                  All
                </label>
              </div>
              <p style={{ color: '#6C727F', fontSize: 14, marginLeft: 22 }}>
                Allow All Notifications, except the ones that I have turned off
              </p>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div>
                  <input
                    type="radio"
                    name={`required- ${channel.channel}`}
                    value={'true'}
                    id={`required- ${channel.channel}`}
                    checked={channel.is_restricted}
                    onChange={() => {
                      const resp = update_overall_channel_preference?.(
                        channel.channel,
                        ChannelLevelPreferenceOptions.REQUIRED
                      );
                      if (resp?.error) {
                        console.log(resp.message);
                      }
                    }}
                  />
                </div>
                <label
                  htmlFor={`required- ${channel.channel}`}
                  style={{ marginLeft: 12 }}
                >
                  Required
                </label>
              </div>
              <p style={{ color: '#6C727F', fontSize: 14, marginLeft: 22 }}>
                Allow only important notifications related to account and
                security settings
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface IChannelLevelPreferencesProps {
  preferenceData?: IPreferenceState | null;
}

export default function ChannelLevelPreferences({
  preferenceData,
}: IChannelLevelPreferencesProps) {
  return (
    <div>
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
          What notifications to allow for channel?
        </p>
      </div>
      <div>
        {preferenceData?.channel_preferences ? (
          <div>
            {preferenceData.channel_preferences?.map(
              (channel, index: number) => {
                return (
                  <ChannelLevelPreferernceItem key={index} channel={channel} />
                );
              }
            )}
          </div>
        ) : (
          <p>No Data</p>
        )}
      </div>
    </div>
  );
}
