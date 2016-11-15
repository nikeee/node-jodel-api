import { JodelConfigBase, JodelKeyConfig } from "./JodelConfig";
import { DeviceUID } from "./JodelInterfaces";

export class WindowsJodelConfig extends JodelConfigBase {
	private static readonly CLIENT_ID = "6a62f24e-7784-0226-3fffb-5e0e895aaaf";

	constructor(deviceUID: DeviceUID, keyConfig: JodelKeyConfig<string>) {
		super(deviceUID, keyConfig, "wodel_" + keyConfig.clientVersion, WindowsJodelConfig.CLIENT_ID, WindowsJodelConfig.createUserAgent(keyConfig.clientVersion));
	}
	private static createUserAgent(version: string): string {
		return `Jodel/${version} (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)`;
	}
}
