export interface Pagination {
	skip: number;
	limit: number;
}

export interface Coordinates {
	lat: number;
	lng: number;
}

export interface Location {
	city?: string;
	country?: string;
	locAccuracy?: number;
	name?: string;
	locCoordinates: Coordinates;
}

export interface KeyValue<T> {
	[key: string]: T;
}

// export type Gender = "male" | "female" | "neutral";
export type Owner = "own" | "friend" | "friendsfriend" | "team";
export type UserTypeName = "highschooler" | "student";
export type AccessToken = string;

export const enum ModerationDecision {
	ACCEPT = 0,
	DISCARD = 2,
	SKIP = 1,
}

export interface Request { }

export interface Investigation extends Request {
	ancestorPostId: string;
	postId: string;
}

export interface PushTokenRequest extends Request {
	clientId: string;
	pushToken: string;
}

export interface SendLocationRequest extends Request {
	location: Location;
}

export interface NewAccessTokenRequest extends Request {
	currentClientId: string;
	distinctId: string;
	refreshToken: string;
}
export interface RequestTokenRequest extends Request {
	clientId: string;
	deviceUid: string;
	location: Location;
}

export interface UserType extends Request {
	phone: string
	type: UserTypeName;
}

export interface ModerationResult extends Request {
	decision: ModerationDecision;
	taskId: string;
}

export interface ActionTrackingRequest extends Request {
	action: string;
}

export interface SendPostRequestBase extends Request {
	location: Location;
	message: string;
}
export interface SendPostRequest extends Request {
	color: Color;
}
export interface ReplyPostRequest extends SendPostRequestBase {
	ancestor: PostId;
}
export interface SendImagePostRequest extends SendPostRequest {
	image: Buffer | string;
}
export interface SendImageReplyPostRequest extends ReplyPostRequest {
	image: Buffer | string;
}

export interface CheckFollowedChannelsStatusRequest extends Request {
	[key: string]: number;
}

export interface Response { }

export interface RequestTokenResponse extends Response {
	expirationDate: number;
	requestToken: AccessToken;
}

export type PostOwner = "friend" | "own" | "team";
export type VotedStatus = "up" | "down" | "";
export interface ImageHeaders extends KeyValue<any> {
	// TODO
}
export type Tag = string;
export type UserHandle = string;

export interface Post {
	ancestor?: PostId;
	childCount?: number;
	children?: Post[];
	color: Color;
	createdAt: Date | string;
	updatedAt: Date | string;
	discoveredBy: number;
	discovered: number;
	distance: number;
	imageHeaders: ImageHeaders;
	imageUrl: string;
	thumbnailUrl: string;
	location: Location;
	message: string;
	parentCreator?: number;
	parentId: PostId;
	pinCount?: number;
	pinned?: boolean;
	postId: PostId;
	postOwn: PostOwner;
	replierMark?: string;
	userHandle: UserHandle;
	voteCount: number;
	voted: VotedStatus;
	tags: Tag[]
}

export interface ModerationPost extends Post {
	flagReason: FlagReasonEnum;
	taskId: string;
}

export interface FlagReason {
	reasonId: FlagReasonEnum;
	stringResourceId: number;
}

export type StickyPostType = "info" | "link" | "survey";
export interface StickyPost {
	color: Color;
	link: string;
	linkedPostColor: Color;
	locationName: string;
	message: string;
	stickyPostId: PostId;
	type: StickyPostType;
	voted: VotedStatus;
}

export interface ChannelInfo {
	channel: string;
	followers: number;
	unread: boolean;
}

export const enum FlagReasonEnum {
	DISCLOSURE = 1,
	HARRASSMENT = 2,
	OTHER = 4,
	REPOST = 6,
	SPAMMING = 3,
	SPAMMING_SPOILER = 7,
	SPOILER = 5,
}

export interface GetPostsResponse extends Response {
	max: number;
	posts: Post[];
}

export interface GetKarmaResponse extends Response {
	karma: number;
}

export interface GetModerationPostsResponse extends Response {
	bounty: ModerationBounty;
	posts: ModerationPost[];
}

export interface ModerationBounty {
	picturePost: Post;
}

export type ExperimentalFeature = "flag_reason_change" | "post_pinning" | "school_screen" | "school_screen_block" | "tag_channels";
export interface Experiment {
	features: ExperimentalFeature[];
	group: string;
	name: string;
}

export interface VoteInformation {
	voteCount: number;
}

export interface GetPostsComboResponse extends Response {
	followersCount: number;
	max: number;
	recent: Post[];
	replied: Post[];
	voted: Post[];
}

export interface GetUserConfigResponse extends Response {
	channelsFollowLimit: number;
	experiments: Experiment[];
	followedChannels: string[];
	moderator: boolean;
	userType: string;
}

export interface NewAccessTokenResponse extends Response {
	accessToken: string;
	expirationDate: number;
}

export interface VerifyAndGetAccessTokenResponse extends Response {
	accessToken: string;
	distinctId: string;
	expirationDate: number;
	expiresIn: number;
	refreshToken: string;
	tokenType: "bearer";
	returning: boolean;
}

export interface PinPostResponse extends Response {
	pinCount: number;
}

export interface LocationUpdateResponse extends Response {
	city: string;
	country: string;
	loc: number[];
	name: string;
	radius: number;
}

export interface SendPostResponse extends Response {
	investigation: Investigation;
	max: number;
	posts: Post[];
}

export interface GetRecommendedResponse extends Response {
	recommended: ChannelInfo[];
}

export interface GetChannelsInfoResponse extends Response {
	channels: ChannelInfo[];
}

export type DeviceUID = string;
export type ClientID = string;

export type PostId = string;
export type Color = "FF9908" | "FFBA00" | "DD5F5F" | "06A3CB" | "8ABDB0" | "9EC41C";

export interface FetchHeaders extends KeyValue<string> {
};
export interface SignedFetchHeaders extends FetchHeaders {
	["X-Client-Type"]: string;
	["X-Api-Version"]: ApiVersion;
	["X-Timestamp"]: string;
	["X-Authorization"]: string; // "HMAC ....."
}

export type HttpVerb = "post" | "get" | "put" | "delete" | "options" | "head" | "patch" | "connect" | "trace";

export type ApiVersion = "0.1" | "0.2";
