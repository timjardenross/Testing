import { type Data, emptyData } from "../domain/model";
import { validateData } from "../domain/records";
export interface Repository {
  load(): Promise<Data>;
  commit(data: Data, expectedRevision: number): Promise<Data>;
}
export class BrowserRepository implements Repository {
  private open(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const r = indexedDB.open("climate-resilience-v1", 1);
      r.onupgradeneeded = () => r.result.createObjectStore("state");
      r.onsuccess = () => {
        r.result.onversionchange = () => r.result.close();
        resolve(r.result);
      };
      r.onerror = () => reject(r.error);
      r.onblocked = () =>
        reject(
          Error(
            "Storage upgrade blocked. Close other application tabs and retry.",
          ),
        );
    });
  }
  async load() {
    const db = await this.open();
    try {
      return await new Promise<Data>((resolve, reject) => {
        const tx = db.transaction("state");
        const r = tx.objectStore("state").get("data");
        r.onsuccess = () => {
          try {
            resolve(r.result ? validateData(r.result) : emptyData());
          } catch (e) {
            reject(e);
          }
        };
        r.onerror = () => reject(r.error);
      });
    } finally {
      db.close();
    }
  }
  async commit(data: Data, expectedRevision: number) {
    validateData(data);
    const db = await this.open();
    try {
      return await new Promise<Data>((resolve, reject) => {
        const tx = db.transaction("state", "readwrite");
        const s = tx.objectStore("state");
        const r = s.get("data");
        let updated: Data;
        let problem: Error | undefined;
        r.onsuccess = () => {
          if ((r.result?.revision ?? 0) !== expectedRevision) {
            problem = Error(
              "Another tab changed the data. Export your unsaved draft, then reload before retrying. Nothing was overwritten.",
            );
            tx.abort();
            return;
          }
          updated = { ...data, revision: expectedRevision + 1 };
          try {
            s.put(updated, "data");
          } catch (e) {
            problem = e instanceof Error ? e : Error(String(e));
            tx.abort();
          }
        };
        tx.oncomplete = () => resolve(updated);
        tx.onabort = () =>
          reject(
            problem ||
              tx.error ||
              Error(
                "Storage transaction aborted. Keep this page open and export unsaved data.",
              ),
          );
        tx.onerror = () => reject(tx.error);
      });
    } finally {
      db.close();
    }
  }
}
