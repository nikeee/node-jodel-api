// npm i -S jodel-api
// tsc --module commonjs --target ES2015 ShowPosts.ts

import { JodelClient, JodelKeyConfigs, AndroidJodelConfig } from "jodel-api";

type JodelVersion = "4.27.0" | "4.28.1" | "4.29.1" | "4.30.2" | "4.31.1";

// See Keys.md
const jodelKeys: JodelKeyConfigs<JodelVersion> = {
	/* "jodelVersion": {key: "key", clientVersion: "jodelVersion", apiVersion: "0.2"} */
	"4.31.1": { key: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", clientVersion: "4.31.1", apiVersion: "0.2" },
};

const keyConfig = jodelKeys["4.31.1"];

// Create a random UID. Do not do this every time.
// Instead, re - use the first generated UID + accessToken by loggin in with
// JodelClient#loginWithToken
const uid = AndroidJodelConfig.createDeviceUID();

const config = new AndroidJodelConfig(uid, keyConfig);

async function main() {
	try {
		const client = new JodelClient(config);
		console.log("Loggin in...");

		await client.login({
			city: "",
			country: "DE",
			locAccuracy: 10,
			locCoordinates: {
				lat: 0,
				lng: 0
			}
		});
		console.log("Logged in!");
		console.log("Token: " + client.accessToken);
		// the token can be passed to JodelClient#loginWithToken to use the same token to login back again.

		const res = await client.getKarma();
		console.log("Karma: " + res.karma);
		const posts = await client.getMostRecentPosts();
		for (const post of posts.posts) {
			console.log(post.message);
			console.log("------------------------------");
		}
	}
	catch (ex) {
		console.error("Something failed: ", ex);
	}
}

main();
