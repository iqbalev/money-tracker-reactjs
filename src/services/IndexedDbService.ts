export class IndexedDbService {
  DB_NAME = "money-tracker" as const;
  DB_VERSION = 1 as const;
  STORE_NAMES = {
    summary: "summary",
    transactions: "transactions",
    settings: "settings",
  } as const;

  async open(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        db.createObjectStore(this.STORE_NAMES.summary);
        db.createObjectStore(this.STORE_NAMES.transactions, {
          keyPath: "id",
          autoIncrement: true,
        });
        db.createObjectStore(this.STORE_NAMES.settings);
      };

      request.onsuccess = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        resolve(db);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async add<T>(
    storeName: keyof typeof this.STORE_NAMES,
    value: T,
    key?: string
  ): Promise<void> {
    const db = await this.open();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.STORE_NAMES[storeName], "readwrite");
      const store = tx.objectStore(this.STORE_NAMES[storeName]);

      if (storeName === "transactions") {
        store.add(value);
      } else {
        store.put(value, key || this.STORE_NAMES[storeName]);
      }

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async get<T>(
    storeName: keyof typeof this.STORE_NAMES,
    key?: string
  ): Promise<T> {
    const db = await this.open();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readonly");
      const store = tx.objectStore(storeName);
      const request = store.get(key || this.STORE_NAMES[storeName]);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll<T>(storeName: keyof typeof this.STORE_NAMES): Promise<T[]> {
    const db = await this.open();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readonly");
      const store = tx.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeNames: (keyof typeof this.STORE_NAMES)[]): Promise<void> {
    const db = await this.open();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeNames, "readwrite");

      for (const name of storeNames) {
        tx.objectStore(name).clear();
      }

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}

export const indexedDb = new IndexedDbService();
