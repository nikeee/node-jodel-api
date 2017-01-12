import { createHmac } from "crypto";
import { parse as parseQuerystring } from "querystring";

import * as Types from "./JodelInterfaces";

export interface JodelConfig {
	readonly endpoint: string;
	readonly clientId: Types.ClientID;
	readonly userAgent: string;
	readonly deviceUID: Types.DeviceUID;
	readonly keyConfig: JodelKeyConfig<string>;
	readonly clientType: string;

	signHeaders(method: Types.HttpVerb, path: string, timestamp: Date, parameters: string, body: string, headers: Types.FetchHeaders): Promise<Types.SignedFetchHeaders>;
}

export class JodelConfigBase implements JodelConfig {

	constructor(public readonly deviceUID: string, public readonly keyConfig: JodelKeyConfig<string>, public readonly clientType: string, public readonly clientId: string, public readonly userAgent: string) {
	}

	public get endpoint(): string {
		return JodelApiUrl.PRODUCTION_API_URL;
	}

	public async signHeaders(method: Types.HttpVerb, path: string, timestamp: Date, parameters: string, body: string, headers: Types.FetchHeaders): Promise<Types.SignedFetchHeaders> {

		const newHeaders: Types.FetchHeaders = {...headers};

		const authHeader = newHeaders["Authorization"];
		const auth = authHeader ? authHeader.split(" ")[1] : "";

		if (!path.endsWith("/"))
			path += "/";

		const timestampISO = timestamp.toISOString().replace(/\.\d+Z/, "Z"); // trim off milliseconds and stuff

		const messageArr = [
			method.toUpperCase(),
			JodelApiUrl.PRODUCTION_HOST,
			JodelApiUrl.PRODUCTION_PORT,
			path,
			auth,
			timestampISO,
			parameters ? JodelConfigBase.encodeParams(parameters) : "",
			body ? body : ""
		];
		const message = messageArr.join("%");
		// console.log("Message: %s", message);

		const signature = await this.signData(message);
		newHeaders["X-Client-Type"] = this.clientType;
		newHeaders["X-Api-Version"] = this.keyConfig.apiVersion;
		newHeaders["X-Timestamp"] = timestampISO;
		newHeaders["X-Authorization"] = "HMAC " + signature.toUpperCase();

		return newHeaders as Types.SignedFetchHeaders;
	}

	private signData(data: string): Promise<string> {
		const hmac = createHmac("sha1", this.keyConfig.key);
		return new Promise((resolve, reject) => {
			hmac.on("readable", () => {
				const signature = hmac.read();
				if (signature && signature instanceof Buffer)
					return resolve(signature.toString("hex").toUpperCase());
				return reject("No buffer :(");
			});
			const dataBuffer = Buffer.from(data, "utf8");
			hmac.write(dataBuffer);
			hmac.end();
		});
	}

	public static createDeviceUID(): string {
		const universe = "abcdef0123456789";
		const uid: string[] = [];
		let n = 64;
		while (n--)
			uid.push(universe.charAt((Math.random() * universe.length) | 0));
		return uid.join("");
	}

	protected static encodeParams(ps: string): string {
		const qs = parseQuerystring(ps);
		const resArr: string[] = [];
		const encode = JodelConfigBase.encodeComponent;
		for (let key in qs) {
			const value = qs[key];
			resArr.push(encode(key) + "%" + encode(value));
		}
		return resArr.join("%");
	}
	protected static encodeComponent(str: string): string {
		return encodeURIComponent(str).replace(/\\+/g, "%20").replace(/%21/g, "!").replace(/%27/g, "'").replace(/%28/g, "(").replace(/%29/g, ")").replace(/%7E/g, "~");
	}
}

export interface JodelKeyConfigs<TVersion> {
	[version: string]: JodelKeyConfig<TVersion>
}

export interface JodelKeyConfig<TVersion> {
	key: string;
	clientVersion: TVersion;
	apiVersion: Types.ApiVersion;
}

class JodelApiUrl {
	public static readonly PRODUCTION_HOST: string = "api.go-tellm.com";
	public static readonly PRODUCTION_PORT: number = 443;
	public static readonly PRODUCTION_API_URL: string = `https://${JodelApiUrl.PRODUCTION_HOST}:${JodelApiUrl.PRODUCTION_PORT}/api`;
}
