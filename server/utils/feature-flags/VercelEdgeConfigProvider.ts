import { getAll, get } from '@vercel/edge-config';
import { consola } from 'consola';
import type { IFeatureFlagsProvider, FlagValue } from './IFeatureFlagsProvider';

export class VercelEdgeConfigProvider implements IFeatureFlagsProvider {
  async getAllFlags(): Promise<Record<string, FlagValue>> {
    try {
      const all = await getAll();
      return all as Record<string, FlagValue>;
    } catch (err) {
      consola.warn(
        '[FeatureFlags] VercelEdgeConfigProvider.getAllFlags failed:',
        err,
      );
      return {};
    }
  }

  async getFlag<T extends FlagValue>(key: string, defaultValue: T): Promise<T> {
    try {
      const value = await get<T>(key);
      return value ?? defaultValue;
    } catch (err) {
      consola.warn(
        `[FeatureFlags] VercelEdgeConfigProvider.getFlag("${key}") failed:`,
        err,
      );
      return defaultValue;
    }
  }
}
