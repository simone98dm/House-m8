export type FlagValue = boolean | string | number;

export interface IFeatureFlagsProvider {
  getAllFlags(): Promise<Record<string, FlagValue>>;
  getFlag<T extends FlagValue>(key: string, defaultValue: T): Promise<T>;
}
