import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { SuprSendPreferenceProvider } from '../';
import Preference from './src/Preference';

function App() {
  const [distinct_id, setDistinctID] = React.useState<string | null>(null);
  const [user_token, setuserToken] = React.useState<string | null>(null);

  React.useEffect(() => {
    setDistinctID('distinct_id');
    setuserToken('jwt token');
  }, []);

  return (
    <div>
      <SuprSendPreferenceProvider
        distinctID={distinct_id}
        accessToken={user_token}
        workspaceKey="workspace_key"
      >
        <Preference setuserToken={setuserToken} />
      </SuprSendPreferenceProvider>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
