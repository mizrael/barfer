export enum Exchanges {
    Barfs = "barfs",
    Hashtags = "hashtags",
    Users = "users"
}

export enum Events {
    BarfCreated = "barf.created",
    BarfReady = "barf.ready",
    BarfFor = "barf.for.",
    RequestHashtagsRefresh = "hashtags.refresh",
    RequestUpdateUserData = "user.update.details",
    UserFollowed = "user.followed",
    UserUnfollowed = "user.unfollowed",
}