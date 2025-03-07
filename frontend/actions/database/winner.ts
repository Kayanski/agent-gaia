import { ApiResult } from "..";
import { queryApi } from "./query";

export async function winner(): Promise<string | undefined> {
    const winner: ApiResult<string | undefined> = await queryApi("winner");
    return winner.result;
}