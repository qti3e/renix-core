// Map<string, ProviderData>();
const providers = new Map();

/**
 * Defines a new data provider
 *
 * @param 
 *
 * @param cb (arg: any): Promise<any>;
 */
function defineProvider(name, cb) {
  providers.set(name, {
    cb,
    promises: new Map(),
    caches: new Map()
  });
}

/**
 * Clear the entire cached data.
 */
function clearCache() {
  providers.forEach((_, key) => {
    key.caches.clear();
  });
}

/**
 * Perform a query using providers.
 *
 * @param q { provider: string, arg: any }
 *
 * @param maxCache if cached data is available, its age must be under
 *                 maxCache
 */
function query(q, maxCache = 2000) {
  if (!providers.has(q.provider)) {
    throw new Error(`[Renix] "${q.provider}" is not registered provider.`);
  }
  const provider = providers.get(q.provider);
  const strArg = JSON.stringify(q.arg);
  if (provider.caches.has(strArg)) {
    const cache = provider.caches.get(strArg);
    if (Date.now() - cache.time <= maxCache) {
      return new Promise(r => r(cache.data));
    }
  }
  if (provider.promises.has(strArg)) {
    return provider.promises.get(strArg);
  }
  const promise = new Promise((resolve, reject) => {
    provider.cb(q.arg).then(data => {
      provider.caches.set(strArg, {
        time: Date.now(),
        data
      });
      provider.promises.delete(strArg);
      resolve(data);
    }, reject);
  });
  provider.promises.set(strArg, promise);
  return promise;
}

// Export members
module.exports = {
  defineProvider,
  clearCache,
  query
};
