import type { IFeatureFlagsProvider, FlagValue } from './IFeatureFlagsProvider';

function parseValue(raw: string): FlagValue {
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  const n = Number(raw);
  if (!Number.isNaN(n) && raw.trim() !== '') return n;
  return raw;
}

function envKeyToFlagKey(envKey: string): string {
  return envKey.replace('FEATURE_FLAG_', '').toLowerCase().replaceAll('_', '-');
}

export class EnvProvider implements IFeatureFlagsProvider {
  async getAllFlags(): Promise<Record<string, FlagValue>> {
    const flags: Record<string, FlagValue> = {};
    for (const [key, value] of Object.entries(process.env)) {
      if (key.startsWith('FEATURE_FLAG_') && value !== undefined) {
        flags[envKeyToFlagKey(key)] = parseValue(value);
      }
    }
    return flags;
  }

  async getFlag<T extends FlagValue>(key: string, defaultValue: T): Promise<T> {
    const flags = await this.getAllFlags();
    return (key in flags ? flags[key] : defaultValue) as T;
  }
}
