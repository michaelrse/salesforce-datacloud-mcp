import cron from 'node-cron';
import NodeCache from 'node-cache';

// SQLite removed — Cloud Run has ephemeral disk, so a pure in-memory cache is the right fit.
export class CacheManager {
  #cache;

  constructor() {
    this.#cache = new NodeCache({ stdTTL: 3600, useClones: false });
  }

  async getOrSet(key, ttl, fetcherFn, forceRefresh = false) {
    if (!forceRefresh) {
      const hit = this.#cache.get(key);
      if (hit !== undefined) return hit;
    }

    console.error(`[CACHE MISS] Key: ${key}. Fetching fresh data...`);
    const freshData = await fetcherFn();

    if (freshData !== undefined && freshData !== null) {
      // NodeCache expects TTL in seconds
      this.#cache.set(key, freshData, Math.floor(ttl / 1000));
    }
    return freshData;
  }

  del(key) {
    this.#cache.del(key);
  }

  async initializeCaches(sfClient) {
    console.error('Hydrating server caches...');
    try {
      await Promise.all([
        sfClient.metadata.getDataCloudSchema(),
        sfClient.connectDataModel.getDataModelObjectByName('ssot__Individual__dlm'),
      ]);
      console.error('Cache hydration complete.');
    } catch (error) {
      console.error('Error during cache hydration:', error.message);
    }
  }

  startBackgroundRefreshJobs(sfClient) {
    cron.schedule('0 0 * * *', async () => {
      console.error('Running background cache refresh for metadata...');
      try {
        await sfClient.metadata.getDataCloudSchema(true);
      } catch (error) {
        console.error('Background metadata refresh failed:', error.message);
      }
    });

    cron.schedule('0 */6 * * *', async () => {
      console.error('Running background cache refresh for DMOs...');
      try {
        await sfClient.connectDataModel.getDataModelObjectByName('ssot__Individual__dlm', true);
        await sfClient.connectDataModel.getDataModelObjectByName('UnifiedIndividual__dlm', true);
      } catch (error) {
        console.error('Background DMO refresh failed:', error.message);
      }
    });
  }
}
