// npm i -S jodel-api
// Get an API key as described in https://github.com/nikeee/node-jodel-api/blob/master/Keys.md
// Replace the key below
// tsc --module commonjs --target ES2015 ShowPosts.ts

import { JodelClient, JodelKeyConfig, createDeviceUID } from "../lib/lib"; // "jodel-api";

// See Keys.md
const keyConfig = {
	key: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
	clientVersion: "4.67.1",
};

// Create a random UID. Do not do this every time.
// Instead, re-use the first generated UID + accessToken by loggin in with
// JodelClient#loginWithToken
const uid = createDeviceUID();

const config = {
	keyConfig: keyConfig,
	deviceUID: uid,
};

async function main() {
	try {
		const client = new JodelClient(config);
		console.log("Registering...");

		await client.register({
			city: "",
			country: "DE",
			locAccuracy: 10,
			locCoordinates: {
				lat: 0,
				lng: 0
			}
		});
		console.log("Registered!");
		console.log("Token: " + client.accessToken);
		console.log("the token can be passed to JodelClient#login to use the same token to login back again.");

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
