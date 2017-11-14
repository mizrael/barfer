export interface User {
    userId: string;
    nickname: string;
    email: string;
    name: string;
    picture: string;
    barfsCount: Number;
    followed: boolean;
}

export const NullUser: User = {
    email: "",
    barfsCount: 0,
    name: "",
    nickname: "",
    picture: "",
    userId: "",
    followed: false,
};