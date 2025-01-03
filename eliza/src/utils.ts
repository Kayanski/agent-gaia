
export async function asyncAction<T>(promise: Promise<T>): Promise<{ data: T | undefined, err: any | undefined }> {
    return promise.then((data) => ({
        data,
        err: undefined
    })).catch((err) => ({
        data: undefined,
        err
    }))
}
