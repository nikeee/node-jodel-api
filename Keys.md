The `jodel-api` package does not come with authentication keys. You either have to ask the Jodel team to give you one or to reverse engineer them.

However, [there are some keys publicly available on the internet](https://bitbucket.org/cfib90/ojoc/src/HEAD/OJOC/Config.py?at=public&fileviewer=file-view-default) thanks the OJOC project of [Christian Fibich](https://bitbucket.org/cfib90). You can also find details of how the singing process works [here](https://bitbucket.org/cfib90/ojoc/issues/14/keep-up-with-hmac-key-changes). There is also Wodel which comes with it's own key.

These are some publicly available keys:
```TypeScript
import { JodelKeyConfigs } from "jodel-api";

const latestJodelVersion: JodelVersion = "4.22.2";
type JodelVersion = "4.3.7" | "4.4.9" | "4.5.11" | "4.6.6" | "4.7.7"
							| "4.8.4" | "4.9.3" | "4.10.3" | "4.11.2" | "4.12.5"
							| "4.13.2" | "4.14.1" | "4.15.2" | "4.16.1" | "4.17.1"
							| "4.18.1" | "4.18.2" | "4.21.1" | "4.22.2"
							;
const latestWodelVersion: WodelVersion = "1.1";
type WodelVersion = "1.1";

const jodelKeys: JodelKeyConfigs<JodelVersion> = {
	/* "jodelVersion": {key: "key", clientVersion: "jodelVersion", apiVersion: "0.2"} */
	"4.3.7": { key: "nKZoTvctImEZZtCZecbrqRTEESjdZfLXAjcFeSeN", clientVersion: "4.3.7", apiVersion: "0.1" },
	"4.4.9": { key: "XxRSVNhJcKHuvxKRxNHwXqncJlLRARjIxbkMWsCL", clientVersion: "4.4.9", apiVersion: "0.1" },
	"4.5.11": { key: "lCYNVKnhGxvoxeowhlRPEcLRWxKjLMEeitqbrnaR", clientVersion: "4.5.11", apiVersion: "0.1" },
	"4.6.6": { key: "dmawzpxCBUCiLjVfgksushgRZNDvPzUjYqtYXewa", clientVersion: "4.6.6", apiVersion: "0.1" },
	"4.7.7": { key: "JvFnTDLfCqLkczWrsWsgGddZuHHOzEOAdFYTaHpb", clientVersion: "4.7.7", apiVersion: "0.1" },
	"4.8.4": { key: "yZONmIluAFsrvxYOVhrwphHTQsSVlOWCNwVAoYic", clientVersion: "4.8.4", apiVersion: "0.2" },
	"4.9.3": { key: "yYCLZiVAVTjxFHnXbpIcwxJBiVmzUOGxYWKGNaQX", clientVersion: "4.9.3", apiVersion: "0.2" },
	"4.10.3": { key: "ONUwOHssvRziEhtoJjirYYRjldiQNNoIniBwyfVe", clientVersion: "4.10.3", apiVersion: "0.2" },
	"4.11.2": { key: "XpOTPTszrtNioQQAnrREKwjtWESeUMlPQcsxmbkC", clientVersion: "4.11.2", apiVersion: "0.2" },
	"4.12.5": { key: "pNsUaphGEfqqZJJIKHjfxAReDqdCTIIuaIVGaowG", clientVersion: "4.12.5", apiVersion: "0.2" },
	"4.13.2": { key: "iyWpGGuOOCdKIMRsfxoJMIPsmCFdrscSxGyCfmBb", clientVersion: "4.13.2", apiVersion: "0.2" },
	"4.14.1": { key: "jcUwaNNZwTSaMgbEEohXJhncvyIMdnZkFecWfPOU", clientVersion: "4.14.1", apiVersion: "0.2" },
	"4.15.2": { key: "udlVqQNfOaQqJRTcGIqkViTtBHZiMxzkYdmcjfWR", clientVersion: "4.15.2", apiVersion: "0.2" },
	"4.16.1": { key: "nggKWnnmsyaeqzrJozIPivDdxVMLVorNgOiaxDkC", clientVersion: "4.16.1", apiVersion: "0.2" },
	"4.17.1": { key: "JymRNkOGDUHQMVeVvdzvaxcKaeuJKWWFeihnYnsY", clientVersion: "4.17.1", apiVersion: "0.2" },
	"4.18.1": { key: "axMGahEhhBHsSiUogkqzpLEEVAePsLbDTYoVJimH", clientVersion: "4.18.1", apiVersion: "0.2" },
	"4.18.2": { key: "axMGahEhhBHsSiUogkqzpLEEVAePsLbDTYoVJimH", clientVersion: "4.18.2", apiVersion: "0.2" },
	"4.21.1": { key: "MowxMGuZnoXYgVoAlqmcgUPxdbszEBpBXpjpccbg", clientVersion: "4.21.1", apiVersion: "0.2" },
	"4.22.2": { key: "zWACiYUMtLRiNATSvdjVtUutOMboswcXCPbZMeSE", clientVersion: "4.22.2", apiVersion: "0.2" },
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
