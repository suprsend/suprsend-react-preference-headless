# @suprsend/react-preferences-headless

This SDK is used to integrate preferences functionality in React, React Native Applications

Refer full documentation [here](https://docs.suprsend.com/docs/react-headless)

Example implementation is available [here](https://github.com/suprsend/suprsend-react-preference-headless/tree/main/example)

## Installation

```bash
npm install --save @suprsend/react-preferences-headless
```

## Integration

```jsx
import { SuprSendPreferenceProvider } from '@suprsend/react-preferences-headless';

function Example() {
  return (
    <SuprSendPreferenceProvider
      workspaceKey="<workspace_key>"
      distinctID="<distinct_id>"
      accessToken="<access_token>"
    >
      <Preference />
    </SuprSendPreferenceProvider>
  );
}

function Preference() {
  const preferenceData = usePreferences();
  const emitter = usePreferenceEvent();
  const {
    update_category_preference,
    update_channel_preference_in_category,
    update_overall_channel_preference,
  } = useUpdatePreferences();

  return <div>Design your component here using data from above hooks<div/>
}
```

## License

MIT © [https://github.com/suprsend](https://github.com/https://github.com/suprsend)
