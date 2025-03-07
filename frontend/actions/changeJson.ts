"use server"

import path from "path"
import fs from "fs"

export async function changeJSON(formData: FormData) {
    const data = formData;
    const file = data.get('file') as File;


    const buffer = Buffer.from(await file.arrayBuffer());
    console.log(buffer)
    const filePath = path.join(process.cwd(), 'public', "Big Tusk.json");

    await fs.writeFile(filePath, buffer, () => { });

    console.log(formData)
}