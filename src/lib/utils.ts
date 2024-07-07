
export const serializeError = async (err: any, options?: any) => {
    const pk = await import("serialize-error");
    return pk.serializeError(err, options);
}