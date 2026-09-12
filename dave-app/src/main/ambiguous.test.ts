import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { AmbiguousAdapter } from "./adapters/ambiguous";
const id = "85b935df-4df8-4d9c-b05f-8d3f6a4cbf14";
test("Ambiguous uses documented envelopes and sends only the reviewed task fields", async () => {
  const directory = mkdtempSync("/tmp/dave-ambi-");
  let writes = 0;
  const adapter = new AmbiguousAdapter(
    () => "test-key",
    directory,
    async (url, init) => {
      assert.equal((init?.headers as any).Authorization, "Bearer test-key");
      if (init?.method === "GET")
        return Response.json({
          data: [{ id, title: "A task", status: "todo" }],
        });
      writes++;
      assert.deepEqual(JSON.parse(init!.body as string), {
        title: "Do this",
        description: "Reviewed description",
      });
      return Response.json({ task: { id, title: "Do this", status: "todo" } });
    },
  );
  try {
    assert.equal((await adapter.list())[0].id, id);
    const draft = {
      requestId: id,
      title: "Do this",
      description: "Reviewed description",
    };
    assert.equal((await adapter.create(draft)).id, id);
    assert.equal((await adapter.create(draft)).id, id);
    assert.equal(writes, 1);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
test("an uncertain task creation is not retried after restart", async () => {
  const directory = mkdtempSync("/tmp/dave-ambi-");
  let calls = 0;
  const fetcher: typeof fetch = async () => {
    calls++;
    throw new Error("Connection lost");
  };
  try {
    const draft = { requestId: id, title: "Task", description: "" };
    await assert.rejects(
      () => new AmbiguousAdapter(() => "key", directory, fetcher).create(draft),
      /Check Ambiguous/,
    );
    await assert.rejects(
      () => new AmbiguousAdapter(() => "key", directory, fetcher).create(draft),
      /Check Ambiguous/,
    );
    assert.equal(calls, 1);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
