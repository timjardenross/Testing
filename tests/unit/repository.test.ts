import "fake-indexeddb/auto";
import { it, expect } from "vitest";
import { BrowserRepository } from "../../src/persistence/repository";
import { emptyData } from "../../src/domain/model";
it("IndexedDB commits atomically, survives reload and rejects stale writers", async () => {
  const r = new BrowserRepository();
  const d = await r.load();
  const n = await r.commit(
    { ...d, settings: { ...d.settings, classification: "Exercise" } },
    d.revision,
  );
  expect((await new BrowserRepository().load()).settings.classification).toBe(
    "Exercise",
  );
  await expect(r.commit(emptyData(), d.revision)).rejects.toThrow(
    "Another tab",
  );
  expect((await r.load()).revision).toBe(n.revision);
});
