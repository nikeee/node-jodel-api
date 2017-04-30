The `jodel-api` package does not come with authentication keys. You either have to ask the Jodel team to give you one or to reverse engineer them.

However, [there are some keys publicly available on the internet](https://bitbucket.org/cfib90/ojoc/src/HEAD/OJOC/Config.py?at=public&fileviewer=file-view-default) thanks the OJOC project of [Christian Fibich](https://bitbucket.org/cfib90). You can also find details of how the singing process works [here](https://bitbucket.org/cfib90/ojoc/issues/14/keep-up-with-hmac-key-changes). There is also Wodel which comes with it's own key.

These are some publicly available keys:
```TypeScript
const jodelKeys = {
	"4.35.6": { key: "cYjTAwjdJyiuXAyrMhkCDiVZhshhLhotNotLiPVu", clientVersion: "4.35.6", apiVersion: "0.2" },
	"4.38.3": { key: "KZmLMUggDeMzQfqMNYFLWNyttEmQgClvlPyACVlH", clientVersion: "4.38.3", apiVersion: "0.2" },
	"4.40.1": { key: "XcpPpQcnfqEweoHRuOQbeGrRryHfxCoSkwpwKoxE", clientVersion: "4.40.1", apiVersion: "0.2" },
};
```
The keys change with every release. If there are new keys available, this list might be updated.

A `JodelKeyConfig` is used to do the singing of the outgoing messages which is required for every message. You also need a `JodelConfig` which uses the `JodelKeyConfig` to do the actual signing. For example, `AndroidJodelConfig` signs the requests just like the Android app.

## Config Instantiation
To use one of the keys above, you need an instance of the `JodelConfig` interface. `jodel-api` comes with the `AndroidJodelConfig` class that implements this. If you have a key that was given to you by the Jodel Team, you have to implement your own JodelConfig class. See below.
```TypeScript
// Jodel Android client:
import { JodelClient, AndroidJodelConfig } from "jodel-api";

const keyConfig = jodelKeys[latestJodelVersion]; // using data from above
const uid = AndroidJodelConfig.createDeviceUID();
const config = new AndroidJodelConfig(uid, keyConfig);
```

### Own JodelConfig class
If you have a key that was given to you by the Jodel Team, you have to implement your own JodelConfig class. To make things easier, there is a `JodelConfigBase` base class that implements the current signing procedure. There is not really much to say on how to extend this class. Just take a look at the source of `AndroidJodelConfig` or `WodelJodelConfig`. Note that there is no JodelConfig that emulates an iOS device.
