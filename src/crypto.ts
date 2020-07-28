import { createHmac } from "crypto";
import * as Types from "./JodelInterfaces";
import { parse as parseQuerystring } from "querystring";
import * as constants from "./constants";
import { JodelConfig } from "./JodelConfig";

export async function signHeaders(config: JodelConfig, method: Types.HttpVerb, path: string, timestamp: Date, parameters: string, body: string, headers: Types.FetchHeaders): Promise<Types.SignedFetchHeaders> {

	const newHeaders: Types.FetchHeaders = { ...headers };

	const authHeader = newHeaders["Authorization"];
	const auth = authHeader ? authHeader.split(" ")[1] : "";

	// Not appending / because it has to match the path in the request char-by-char
	// if (!path.endsWith("/"))
	//	path += "/";

	const timestampISO = timestamp.toISOString().replace(/\.\d+Z/, "Z"); // trim off milliseconds and stuff

	const messageArr = [
		method.toUpperCase(),
		constants.PRODUCTION_HOST,
		constants.PRODUCTION_PORT,
		path,
		auth,
		timestampISO,
		parameters ? encodeParams(parameters) : "",
		body ? body : ""
	];
	const message = messageArr.join("%");
	// console.log("Message: %s", message);

	const signature = await signData(config, message);
	newHeaders["X-Client-Type"] = config.clientType;
	newHeaders["X-Api-Version"] = config.keyConfig.apiVersion || constants.DEFAULT_API_VERSION;
	newHeaders["X-Timestamp"] = timestampISO;
	newHeaders["X-Authorization"] = "HMAC " + signature.toUpperCase();

	return newHeaders as Types.SignedFetchHeaders;
}

export function signData(config: JodelConfig, data: string): Promise<string> {
	const hmac = createHmac("sha1", config.keyConfig.key);
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

export function createDeviceUID(): string {
	const universe = "abcdef0123456789";
	const uid: string[] = [];
	let n = 64;
	while (n--)
		uid.push(universe.charAt((Math.random() * universe.length) | 0));
	return uid.join("");
}

function encodeParams(ps: string): string {
	const qs = parseQuerystring(ps);
	const resArr: string[] = [];
	for (let key in qs) {
		const value = qs[key];
		if (Array.isArray(value))
			continue;
		resArr.push(encodeComponent(key) + "%" + encodeComponent(value!));
	}
	return resArr.join("%");
}

function encodeComponent(str: string): string {
	return encodeURIComponent(str).replace(/\\+/g, "%20").replace(/%21/g, "!").replace(/%27/g, "'").replace(/%28/g, "(").replace(/%29/g, ")").replace(/%7E/g, "~");
}
