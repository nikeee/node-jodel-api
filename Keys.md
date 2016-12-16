The `jodel-api` package does not come with authentication keys. You either have to ask the Jodel team to give you one or to reverse engineer them.

However, [there are some keys publicly available on the internet](https://bitbucket.org/cfib90/ojoc/src/HEAD/OJOC/Config.py?at=public&fileviewer=file-view-default) thanks the OJOC project of [Christian Fibich](https://bitbucket.org/cfib90). You can also find details of how the singing process works [here](https://bitbucket.org/cfib90/ojoc/issues/14/keep-up-with-hmac-key-changes). There is also Wodel which comes with it's own key.

These are some publicly available keys:
```TypeScript
import { JodelKeyConfigs } from "jodel-api";

const latestJodelVersion: keyof JodelKeyConfigs<JodelVersion> = "4.30.2";
type JodelVersion = "4.27.0" | "4.28.1" | "4.29.1" | "4.30.2";
const latestWodelVersion: keyof JodelKeyConfigs<WodelVersion> = "1.1";
type WodelVersion = "1.1";

const jodelKeys: JodelKeyConfigs<JodelVersion> = {
	/* "jodelVersion": {key: "key", clientVersion: "jodelVersion", apiVersion: "0.2"} */
	"4.27.0": { key: "VwJHzYUbPjGiXWauoVNaHoCWsaacTmnkGwNtHhjy", clientVersion: "4.27.0", apiVersion: "0.2" },
	"4.28.1": { key: "aPLFAjyUusVPHgcgvlAxihthmRaiuqCjBsRCPLan", clientVersion: "4.28.1", apiVersion: "0.2" },
	"4.29.1": { key: "dIHNtHWOxFmoFouufSflpTKYjPmCIhWUCQHgbNzR", clientVersion: "4.29.1", apiVersion: "0.2" },
	"4.30.2": { key: "zpwKnTvubiKritHEnjOTcTeHxLJJNTEVumuNZqcE", clientVersion: "4.30.2", apiVersion: "0.2" },
};

const wodelKeys: JodelKeyConfigs<WodelVersion> = {
	"1.1": { key: "bgulhzgo9876GFKgguzTZITFGMn879087vbgGFuz", clientVersion: "1.1", apiVersion: "0.2" }
}
```
The keys change with every release. If there are new keys available, this list might be updated.

A `JodelKeyConfig` is used to do the singing of the outgoing messages which is required for every message. You also need a `JodelConfig` which uses the `JodelKeyConfig` to do the actual signing. For example, `AndroidJodelConfig` signs the requests just like the Android app.

## Config Instantiation
To use one of the keys above, you need an instance of the `JodelConfig` interface. `jodel-api` comes with two classes that implement these: `AndroidJodelConfig` and `WodelJodelConfig`. If you have a key that was given to you by the Jodel Team, you have to implement your own JodelConfig class. See below.
```TypeScript
// Jodel Android client:
import { JodelClient, AndroidJodelConfig } from "jodel-api";

const keyConfig = jodelKeys[latestJodelVersion]; // using data from above
const uid = AndroidJodelConfig.createDeviceUID();
const config = new AndroidJodelConfig(uid, keyConfig);
```

To emulate a Wodel client, use:
```TypeScript
import { WodelJodelConfig } from "jodel-api";

const keyConfig = wodelKeys[latestWodelVersion]; // using data from above
const uid = WodelJodelConfig.createDeviceUID();
const config = new WodelJodelConfig(uid, keyConfig);
```

### Own JodelConfig class
If you have a key that was given to you by the Jodel Team, you have to implement your own JodelConfig class. To make things easier, there is a `JodelConfigBase` base class that implements the current signing procedure. There is not really much to say on how to extend this class. Just take a look at the source of `AndroidJodelConfig` or `WodelJodelConfig`. Note that there is no JodelConfig that emulates an iOS device.
