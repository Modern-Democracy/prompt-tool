export interface User {
    id: string;
    displayName: string;
    email: string;
}
export interface UserState {
    user: User;
    token: string;
    session: string;
}
