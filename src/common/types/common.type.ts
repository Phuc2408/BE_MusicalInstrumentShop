export interface IBackendRes<T = any>{
    statusCode: number;
    message: string | string[];
    error?: string;
    data?: T;
}