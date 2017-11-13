export interface CreateBarfDto {
    authorId: string;
    text: string;
}

export interface BarfDetails {
    id: string;
    userId: string;
    userName: string;
    picture: string;
    text: string;
    creationDate: Number;
}