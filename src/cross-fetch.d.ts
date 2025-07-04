declare module "cross-fetch" {
  const fetch: typeof globalThis.fetch;
  export default fetch;
} 