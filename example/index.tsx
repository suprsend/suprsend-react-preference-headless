import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
  usePreferences,
  SuprSendPreferenceProvider,
  usePreferenceEvent,
  IPreferenceErrorData,
} from '../';
import ChannelLevelPreferences from './src/ChannelLevelPreferences';
import NotificationCategoryPreferences from './src/NotificationCategoryPreferences';

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
const App = () => {
  const [distinct_id, setDistinctID] = React.useState<string | null>(null);
  const [user_token, setuserToken] = React.useState<string | null>(null);

  React.useEffect(() => {
    setDistinctID('distinct_id');
    setuserToken('jwt token');
  }, []);

  return (
    <div>
      <SuprSendPreferenceProvider
        distinct_id={distinct_id}
        access_token={user_token}
        workspace_key="workspace_key"
      >
        <Preference setuserToken={setuserToken} />
      </SuprSendPreferenceProvider>
    </div>
  );
};

function Preference({ setuserToken }) {
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
    return <p>Something went wrong. Please refresh and try again</p>;
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

ReactDOM.render(<App />, document.getElementById('root'));
