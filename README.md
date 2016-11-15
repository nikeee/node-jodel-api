# node-jodel-api [![Travis Build Status](https://travis-ci.org/nikeee/node-jodel-api.svg?branch=master)](https://travis-ci.org/nikeee/node-jodel-api) [![npm version](https://badge.fury.io/js/jodel-api.svg)](https://www.npmjs.com/package/jodel-api)
> Node.js Jodel API, written in TypeScript

## Using the Library
```Shell
npm install -S jodel-api
```

jodel-api comes with its own type definitions, no additional type references required.

```TypeScript
import { JodelClient } from "jodel-api";

const config = null; // See Keys.md
async function main() {
    const client = new JodelClient(config);
    await client.login({
        city: "",
        country: "DE",
        locAccuracy: 10,
        locCoordinates: {
            lat: 123,
            lng: 456
        }
    });
    console.log("Logged in!");
    console.log("Token: " + client.accessToken);
    // the token can be passed to JodelClient#loginWithToken to use the same token to login back again.

    const res = await client.getKarma();
    console.log("Karma: " + res.karma);
}
main();
```
`jodel-api` uses `node-fetch` which is similar to the [Fetch API](https://developer.mozilla.org/en/docs/Web/API/Fetch_API) of most browsers and therefore should be easy to rewrite.
