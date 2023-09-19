import * as React from 'react';
import {
  usePreferences,
  usePreferenceEvent,
  IPreferenceErrorData,
} from '../../';
import ChannelLevelPreferences from './ChannelLevelPreferences';
import NotificationCategoryPreferences from './NotificationCategoryPreferences';

export function handleError(
  error: IPreferenceErrorData,
  setuserToken: (val: string) => void
) {
  if (error.response.type === 'TOKEN_EXPIRED') {
    // refresh token api call
    // setuserToken('<new jwt token>');
  } else {
    console.log(error.response.message); // show to user using toast
  }
}

export default function Preference({ setuserToken }) {
  const preferenceData = usePreferences();
  const emitter = usePreferenceEvent();

  React.useEffect(() => {
    emitter?.on('preferences_error', error => {
      handleError(error, setuserToken); // asynchronous api call errors needs to be handled here. token expiry error can come as both client error and server error as we check expiry before sending request
    });

    return () => {
      emitter?.off('preferences_error');
    };
  }, [emitter]);

  if (!preferenceData || preferenceData.loading) {
    return <p>Loading...</p>;
  } else if (preferenceData.error) {
    return <p>Something went wrong. Please refresh page and try again</p>;
  }
  return (
    <div style={{ margin: 24 }}>
      <h3 style={{ marginBottom: 24 }}>Notification Preferences</h3>
      <NotificationCategoryPreferences
        preferenceData={preferenceData.data}
        setuserToken={setuserToken}
      />
      <ChannelLevelPreferences
        preferenceData={preferenceData.data}
        setuserToken={setuserToken}
      />
    </div>
  );
}
