import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Preference from './src/Preference';
import { SuprSendPreferenceProvider } from '@suprsend/react-preferences-headless';

function App() {
  const [distinct_id, setDistinctID] = React.useState<string | null>(null);
  const [user_token, setuserToken] = React.useState<string | null>(null);

  React.useEffect(() => {
    //get your distinctID and accessToken and set here
    setDistinctID('distinct_id');
    setuserToken('jwt token');
  }, []);

  return (
    <div>
      <SuprSendPreferenceProvider
        distinctID={distinct_id}
        accessToken={user_token}
        workspaceKey="workspace_key" //add your workspaceKey
      >
        <Preference setuserToken={setuserToken} />
      </SuprSendPreferenceProvider>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
