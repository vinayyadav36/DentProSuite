export interface StorageAdapter<T> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | undefined>;
  getByEmail?(email: string): Promise<T | undefined>;
  findMany?(query: Partial<T>): Promise<T[]>;
  insert(item: T): Promise<T>;
  update(id: string, updates: Partial<T>): Promise<T | undefined>;
  delete(id: string): Promise<boolean>;
}
