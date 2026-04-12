const { LRUCache } = require('lru-cache')

const createCache = ({ ttlMs, max = 500 }) => {
  const cache = new LRUCache({
    max,
    ttl: ttlMs,
    allowStale: false,
    updateAgeOnGet: false,
    updateAgeOnHas: false,
  })

  return {
    get: (key) => cache.get(key),
    set: (key, value) => cache.set(key, value),
    has: (key) => cache.has(key),
  }
}

module.exports = { createCache }
