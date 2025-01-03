import { queryApi } from "./query";

export async function winner(): Promise<string | undefined> {

    const winner: string | undefined = await queryApi("winner");
    return winner;
}