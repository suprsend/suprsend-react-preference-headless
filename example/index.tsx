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
        distinct_id={distinct_id}
        access_token={user_token}
        workspace_key="workspace_key"
      >
        <Preference setuserToken={setuserToken} />
      </SuprSendPreferenceProvider>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
