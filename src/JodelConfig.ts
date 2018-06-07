import * as Types from "./JodelInterfaces";
import * as constants from "./constants";

export interface JodelConfig {
	readonly endpoint: string;
	readonly clientId: Types.ClientID;
	readonly userAgent: string;
	readonly deviceUID: Types.DeviceUID;
	readonly keyConfig: JodelKeyConfig<string>;
	readonly clientType: string;
}

export interface JodelKeyConfig<TVersion> {
	key: string;
	clientVersion: TVersion;
	apiVersion?: Types.ApiVersion;
}

export interface MandantoryJodelConfig {
	keyConfig: JodelKeyConfig<string>;
	deviceUID: Types.DeviceUID;
}

export type FillableJodelConfig = Partial<JodelConfig> & MandantoryJodelConfig;

export function fillDefaults(config: FillableJodelConfig): JodelConfig {
	const userAgent = `Jodel/${config.keyConfig.clientVersion} Dalvik/2.1.0 (Linux; U; Android 6.0.1; Nexus 5 Build/MMB29V)`;
	const clientType = "android_" + config.keyConfig.clientVersion;

	return {
		endpoint: constants.PRODUCTION_API_URL,
		clientId: constants.ANDROID_CLIENT_ID,
		userAgent,
		clientType,
		...config,
	};
}
