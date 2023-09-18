import * as React from 'react';
import * as ReactDOM from 'react-dom';
import SuprSendPreferenceProvider from '../dist';

const App = () => {
  return (
    <div>
      <SuprSendPreferenceProvider distinct_id="mike" user_token="testing">
        <p>Hello world</p>
      </SuprSendPreferenceProvider>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
