import fetch, { RequestInit } from "node-fetch";
import * as humps from "humps";
import * as querystring from "querystring";

import * as Types from "./JodelInterfaces";
import { JodelConfig, FillableJodelConfig, fillDefaults } from "./JodelConfig";

import * as jodelCrypto from "./crypto";

class JodelAPI {
	constructor(private readonly config: JodelConfig, public accessToken: Types.AccessToken | undefined) {
	}

	private post<T>(path: string, queryParams: Types.KeyValue<any> = {}, body: Types.KeyValue<any> | null): Promise<T> {
		return this.doRequest<T>("post", path, this.accessToken, queryParams, body);
	}
	private get<T>(path: string, queryParams: Types.KeyValue<any> = {}): Promise<T> {
		return this.doRequest<T>("get", path, this.accessToken, queryParams, null);
	}
	private delete<T>(path: string, queryParams: Types.KeyValue<any>, body: Types.KeyValue<any> | null): Promise<T> {
		return this.doRequest<T>("delete", path, this.accessToken, queryParams, body);
	}
	private put<T>(path: string, queryParams: Types.KeyValue<any>, body: Types.KeyValue<any> | null): Promise<T> {
		return this.doRequest<T>("put", path, this.accessToken, queryParams, body);
	}
	private postUnverified<T>(path: string, queryParams: Types.KeyValue<any>, body: Types.KeyValue<any> | null): Promise<T> {
		return this.doRequest<T>("post", path, undefined, queryParams, body);
	}

	private async doRequest<T>(method: Types.HttpVerb, path: string, accessToken: Types.AccessToken | undefined, queryParams: Types.KeyValue<any>, body: Types.KeyValue<any> | null): Promise<T> {
		// if (!path.endsWith("/"))
		//	path += "/";

		let url = this.config.endpoint + path;

		let qs: string = "";
		if (queryParams) {
			queryParams = queryParams ? queryParams : {};
			queryParams = humps.decamelizeKeys(queryParams);

			qs = querystring.stringify(queryParams);
			if (qs && qs.length > 0) {
				if (!url.endsWith("?"))
					url += "?";
				url += qs;
			}
		}

		if (body) {
			body = humps.decamelizeKeys(body);
		}

		let headers = this.createHeaders(accessToken);
		const bodyStr = body ? JSON.stringify(body) : "";

		headers = await jodelCrypto.signHeaders(this.config, method, "/api" + path, new Date(), qs, bodyStr, headers);

		// console.log("Url: %s", url);
		// console.log("Query params:"); console.dir(queryParams);
		// console.log("Headers:"); console.dir(headers);
		// console.log("Body:"); console.dir(body);

		const init: RequestInit = {
			body: bodyStr,
			method,
			headers
		};

		const res = await fetch(url, init);
		if (!res.ok) {
			const rejection: HttpJodelErrorResponse = {
				code: res.status,
				text: res.statusText,
				content: await res.text()
			};
			return Promise.reject<T>(rejection);
		}
		const resObj = await res.json();
		const convertedCase: T = humps.camelizeKeys(resObj) as T;
		// console.log("Response:"); console.dir(convertedCase);
		return convertedCase;
	}

	private createHeaders(accessToken: Types.AccessToken | undefined): Types.FetchHeaders {
		let headers: Types.FetchHeaders = {
			"User-Agent": this.config.userAgent,
			"Content-Type": "application/json",
		};
		if (accessToken)
			headers["Authorization"] = `Bearer ${this.accessToken}`;
		return headers;
	}

	public getChannelCombo(channel: string): Promise<Types.GetPostsComboResponse> {
		return this.get<Types.GetPostsComboResponse>(`/v3/posts/channel/combo`, { channel: channel });
	}

	public getDiscussedChannelPosts(channel: string, after: string): Promise<Types.GetPostsResponse> {
		return this.get<Types.GetPostsResponse>("/v3/posts/channel/discussed", { channel: channel, after: after }).then(ps => { JodelAPI.fixPosts(ps.posts); return ps; });
	}

	public getKarma(): Promise<Types.GetKarmaResponse> {
		return this.get<Types.GetKarmaResponse>("/v2/users/karma");
	}

	public getModerationFeed(): Promise<Types.GetModerationPostsResponse> {
		return this.get<Types.GetModerationPostsResponse>("/v3/moderation")
	}

	// TODO: Check if position parameter is still used
	public getMostDiscussedPosts(position?: Types.Coordinates, after?: string): Promise<Types.GetPostsResponse> {
		const params: any = {};
		if (after) params["after"] = after;
		if (position) {
			params["lat"] = position.lat;
			params["lng"] = position.lng;
		}
		return this.get<Types.GetPostsResponse>("/v2/posts/location/discussed", params).then(ps => { JodelAPI.fixPosts(ps.posts); return ps; });
	}

	// TODO: Check if position parameter is still used
	public getMostPopularPosts(position?: Types.Coordinates, after?: string): Promise<Types.GetPostsResponse> {
		const params: any = {};
		if (after) params["after"] = after;
		if (position) {
			params["lat"] = position.lat;
			params["lng"] = position.lng;
		}
		return this.get<Types.GetPostsResponse>("/v2/posts/location/popular", params).then(ps => { JodelAPI.fixPosts(ps.posts); return ps; });
	}

	// TODO: Check if position parameter is still used
	public getMostRecentPosts(position?: Types.Coordinates, after?: string): Promise<Types.GetPostsResponse> {
		const params: any = {};
		if (after) params["after"] = after;
		if (position) {
			params["lat"] = position.lat;
			params["lng"] = position.lng;
		}
		return this.get<Types.GetPostsResponse>("/v2/posts/location/", params).then(ps => { JodelAPI.fixPosts(ps.posts); return ps; });
	}

	public getMyMostDiscussedPosts(pagination: Types.Pagination): Promise<Types.GetPostsResponse> {
		return this.get<Types.GetPostsResponse>("/v2/posts/location/", pagination).then(ps => { JodelAPI.fixPosts(ps.posts); return ps; });
	}

	public getMyPinnedPosts(pagination: Types.Pagination | null = null): Promise<Types.GetPostsResponse> {
		return this.get<Types.GetPostsResponse>("/v2/posts/mine/pinned/", pagination ? pagination : {}).then(ps => { JodelAPI.fixPosts(ps.posts); return ps; });
	}

	public getMyPopularPosts(pagination: Types.Pagination): Promise<Types.GetPostsResponse> {
		return this.get<Types.GetPostsResponse>("/v2/posts/mine/popular/", pagination).then(ps => { JodelAPI.fixPosts(ps.posts); return ps; });
	}

	public getMyPosts(pagination: Types.Pagination): Promise<Types.GetPostsResponse> {
		return this.get<Types.GetPostsResponse>("/v2/posts/mine/", pagination).then(ps => { JodelAPI.fixPosts(ps.posts); return ps; });
	}

	public getMyPostsCombo(): Promise<Types.GetPostsComboResponse> {
		return this.get<Types.GetPostsComboResponse>("/v2/posts/mine/combo");
	}

	public getMyRepliedPosts(pagination: Types.Pagination | null = null): Promise<Types.GetPostsResponse> {
		return this.get<Types.GetPostsResponse>("/v2/posts/mine/replies/", pagination ? pagination : {}).then(ps => { JodelAPI.fixPosts(ps.posts); return ps; });
	}

	public getMyVotedPosts(pagination: Types.Pagination | null = null): Promise<Types.GetPostsResponse> {
		return this.get<Types.GetPostsResponse>("/v2/posts/mine/votes/", pagination ? pagination : {}).then(ps => { JodelAPI.fixPosts(ps.posts); return ps; });
	}

	public getPopularChannelPosts(channel: string, after: string): Promise<Types.GetPostsResponse> {
		const params: any = {};
		if (after) params["after"] = after;
		if (channel) params["channel"] = channel
		return this.get<Types.GetPostsResponse>("/v3/posts/channel/popular", params).then(ps => { JodelAPI.fixPosts(ps.posts); return ps; });
	}

	public getPost(postId: string, highlight?: string): Promise<Types.Post> {
		return this.get<Types.Post>(`/v2/posts/${postId}/`, { highlight: highlight ? highlight : null }).then(p => JodelAPI.fixPost(p));
	}

	public deletePost(postId: string): Promise<Types.Response> {
		return this.delete<Types.Response>(`/v2/posts/${postId}`, {}, null);
	}

	public async getRecentChannelPosts(channel: string, after: string): Promise<Types.GetPostsResponse> {
		const params: any = {};
		if (after) params["after"] = after;
		if (channel) params["channel"] = channel
		return this.get<Types.GetPostsResponse>("/v3/posts/channel", params).then(ps => { JodelAPI.fixPosts(ps.posts); return ps; });
	}

	public getUserConfig(): Promise<Types.GetUserConfigResponse> {
		return this.get<Types.GetUserConfigResponse>("/v3/user/config");
	}

	public downvotePost(postId: string): Promise<Types.VoteInformation> {
		return this.put<Types.VoteInformation>(`/v2/posts/${postId}/downvote`, {}, null);
	}

	public flagPost(postId: string, reason: Types.FlagReason): Promise<Types.Response> {
		return this.put<Types.Response>(`/v2/posts/${postId}/flag`, {}, reason);
	}

	public followChannel(channel: string): Promise<Types.Response> {
		return this.put<Types.Response>("/v3/user/followChannel", { channel }, null);
	}

	public pinPost(postId: string): Promise<Types.PinPostResponse> {
		return this.put<Types.PinPostResponse>(`/v2/posts/${postId}/pin`, {}, null);
	}

	public sendLogs(data: Types.Investigation): Promise<Types.Response> {
		return this.put<Types.Response>("/v3/investigate", {}, data);
	}

	public sendPushToken(data: Types.PushTokenRequest): Promise<Types.Response> {
		return this.put<Types.Response>("/v2/users/pushToken", {}, data);
	}

	public sendUserLocation(data: Types.SendLocationRequest): Promise<Types.LocationUpdateResponse> {
		return this.put<Types.LocationUpdateResponse>("/v2/users/location", {}, data);
	}

	public unfollowChannel(channel: string): Promise<Types.Response> {
		return this.put<Types.Response>("/v3/user/unfollowChannel", { channel }, null);
	}

	public unpinPost(postId: string): Promise<Types.PinPostResponse> {
		return this.put<Types.PinPostResponse>(`/v2/posts/${postId}/unpin`, {}, null);
	}
	public upvotePost(postId: string): Promise<Types.VoteInformation> {
		return this.put<Types.VoteInformation>(`/v2/posts/${postId}/upvote`, {}, null);
	}

	/*
	public checkFollowedChannelsStatus(data: CheckFollowedChannelsStatusRequest): Promise<string[]> {
		return this.post("/v3/user/followedChannelsStatus", {}, data);
	}
	*/

	public dismissStickyPost(id: Types.PostId): Promise<Types.Response> {
		return this.put(`/v3/stickyposts/${id}/dismiss`, {}, null);
	}

	public downvoteStickyPost(id: Types.PostId): Promise<Types.Response> {
		return this.put(`/v3/stickyposts/${id}/down`, {}, null);
	}

	public upvoteStickyPost(id: Types.PostId): Promise<Types.Response> {
		return this.put(`/v3/stickyposts/${id}/up`, {}, null);
	}

	public getNewAccessToken(data: Types.NewAccessTokenRequest): Promise<Types.NewAccessTokenResponse> {
		return this.post("/v2/users/refreshToken", {}, data);
	}

	public getRequestToken(data: Types.RequestTokenRequest): Promise<Types.VerifyAndGetAccessTokenResponse> {
		return this.post("/v2/users", {}, data);
	}

	public sendModerationResult(data: Types.ModerationResult): Promise<Types.Response> {
		return this.post("/v3/moderation", {}, data);
	}

	public sendPost(data: Types.SendPostRequest | Types.SendImagePostRequest | Types.ReplyPostRequest | Types.SendImageReplyPostRequest): Promise<Types.SendPostResponse> {
		const demData = data as Types.SendImagePostRequest & Types.SendImageReplyPostRequest;
		const img = demData.image;
		if (img && img instanceof Buffer) {
			demData.image = img.toString("base64");
		}
		return this.post("/v2/posts/", {}, data);
	}

	public sendUserType(data: Types.UserType): Promise<Types.Response> {
		return this.post("/v3/user/school_screen", {}, data);
	}

	public trackAction(data: Types.ActionTrackingRequest): Promise<Types.Response> {
		return this.post("/v3/action", {}, data);
	}

	public getFollowedChannelsMeta(map: Types.KeyValue<number>): Promise<Types.GetChannelsInfoResponse> {
		return this.post("/v3/user/followedChannelsMeta", {}, map);
	}

	public getPostsCombo(pos: Types.Coordinates, stickies: boolean): Promise<Types.GetPostsComboResponse> {
		// TODO FIX POSTS
		return this.get("/v3/posts/location/combo", { lat: pos.lat, lng: pos.lng, stickies });
	}
	public getRecommendedChannels(): Promise<Types.GetRecommendedResponse> {
		return this.get("/v3/user/recommendedChannels");
	}

	private static fixPosts(ps: Types.Post[]): Types.Post[] {
		for (const p of ps)
			JodelAPI.fixPost(p);
		return ps;
	}
	private static fixPost(p: Types.Post): Types.Post {
		if (typeof p.createdAt === "string") p.createdAt = new Date(p.createdAt as string);
		if (typeof p.updatedAt === "string") p.updatedAt = new Date(p.updatedAt as string);
		if (p.children && p.children.length > 0) {
			for (let i = 0; i < p.children.length; ++i) {
				p.children[i] = JodelAPI.fixPost(p.children[i]);
			}
		}
		return p;
	}
}

export class JodelClient {
	private readonly api: JodelAPI;
	private readonly config: JodelConfig;

	public get accessToken(): Types.AccessToken | undefined {
		return this._accessToken;
	}

	constructor(config: FillableJodelConfig, private _accessToken?: Types.AccessToken) {
		this.config = fillDefaults(config);
		this.api = new JodelAPI(this.config, _accessToken);
	}

	public async register(location: Types.Location): Promise<void> {
		const authRes = await this.api.getRequestToken({
			clientId: this.config.clientId,
			deviceUid: this.config.deviceUID,
			location: location
		});

		if (!authRes.accessToken) return Promise.reject<void>("No access token provided");
		this._accessToken = authRes.accessToken;
		this.api.accessToken = this._accessToken;
	}
	public login(accessToken: Types.AccessToken): Promise<void> {
		if (!accessToken) return Promise.reject<void>("No access token provided");
		// Maybe this will do an async operation some day
		this._accessToken = accessToken;
		this.api.accessToken = accessToken;
		return Promise.resolve();
	}

	public updateLocation(countryCode: string, lat: number, long: number, accuracy: number = JodelClient.randomAccuracy()): Promise<Types.LocationUpdateResponse> {
		if (!this.accessToken) return Promise.reject<Types.LocationUpdateResponse>("No access token provided");
		countryCode = countryCode.toUpperCase();
		return this.api.sendUserLocation({
			location: {
				country: countryCode,
				locAccuracy: accuracy || 0.0,
				locCoordinates: {
					lat: lat,
					lng: long
				}
			}
		});
	}

	public postImage(image: Buffer, color: Types.Color, location: Types.Location): Promise<Types.SendPostResponse> {
		if (!this.accessToken) return Promise.reject<Types.SendPostResponse>("No access token provided");
		return this.api.sendPost({
			image,
			location,
			color
		});
	}

	public post(message: string, color: Types.Color, location: Types.Location): Promise<Types.SendPostResponse> {
		if (!this.accessToken) return Promise.reject<Types.SendPostResponse>("No access token provided");
		return this.api.sendPost({
			message,
			location,
			color
		});
	}

	public reply(ancestor: Types.PostId, message: string, location: Types.Location): Promise<Types.SendPostResponse> {
		if (!this.accessToken) return Promise.reject<Types.SendPostResponse>("No access token provided");
		return this.api.sendPost({
			ancestor,
			message,
			location
		});
	}

	// TODO: Check if position parameter is still used
	public getMostPopularPosts(position?: Types.Coordinates, after?: Types.PostId): Promise<Types.GetPostsResponse> {
		if (!this.accessToken) return Promise.reject<Types.GetPostsResponse>("No access token provided");
		return this.api.getMostPopularPosts(position, after);
	}
	// TODO: Check if position parameter is still used
	public getMostDiscussedPosts(position?: Types.Coordinates, after?: Types.PostId): Promise<Types.GetPostsResponse> {
		if (!this.accessToken) return Promise.reject<Types.GetPostsResponse>("No access token provided");
		return this.api.getMostDiscussedPosts(position, after);
	}
	// TODO: Check if position parameter is still used
	public getMostRecentPosts(position?: Types.Coordinates, after?: Types.PostId): Promise<Types.GetPostsResponse> {
		if (!this.accessToken) return Promise.reject<Types.GetPostsResponse>("No access token provided");
		return this.api.getMostRecentPosts(position, after);
	}

	public getPost(id: Types.PostId, highlight?: string): Promise<Types.Post> {
		if (!this.accessToken) return Promise.reject<Types.Post>("No access token provided");
		return this.api.getPost(id, highlight);
	}

	public getKarma(): Promise<Types.GetKarmaResponse> {
		if (!this.accessToken) return Promise.reject<Types.GetKarmaResponse>("No access token provided");
		return this.api.getKarma();
	}

	private static randomAccuracy(): number {
		return Math.floor(Math.random() * 21);
	}
}

interface HttpJodelErrorResponse {
	code: number;
	text: string;
	content: string;
}
