import { create } from "domain";
import { createBrotliDecompress } from "zlib"
import { createDatabase } from "./actions/gaia/createDb";

export async function register() {
    await createDatabase()
}

