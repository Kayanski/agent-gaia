"use server"

import { insertAiFileIntoDB } from "./ai/helpers";
import PostgresDatabaseAdapter from "@elizaos/adapter-postgres";

const db = new PostgresDatabaseAdapter({
    connectionString: process.env.POSTGRES_URL,
    parseInputs: true,
});
export async function changeJSON(formData: FormData) {
    const data = formData;
    const file = data.get('file') as File;


    const fileString = Buffer.from(await file.arrayBuffer()).toString();
    const fileJson = JSON.parse(fileString);
    console.log(fileJson)
    await insertAiFileIntoDB(fileJson, db)
}