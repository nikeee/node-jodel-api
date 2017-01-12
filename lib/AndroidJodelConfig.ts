import { JodelConfigBase, JodelKeyConfig } from "./JodelConfig";
import { DeviceUID } from "./JodelInterfaces";

export class AndroidJodelConfig extends JodelConfigBase {
	private static readonly CLIENT_ID = "81e8a76e-1e02-4d17-9ba0-8a7020261b26";

	constructor(deviceUID: DeviceUID, keyConfig: JodelKeyConfig<string>) {
		super(deviceUID, keyConfig, "android_" + keyConfig.clientVersion, AndroidJodelConfig.CLIENT_ID, AndroidJodelConfig.createUserAgent(keyConfig.clientVersion));
	}
	private static createUserAgent(version: string): string {
		return `Jodel/${version} Dalvik/2.1.0 (Linux; U; Android 6.0.1; Nexus 5 Build/MMB29V)`;
	}
}
