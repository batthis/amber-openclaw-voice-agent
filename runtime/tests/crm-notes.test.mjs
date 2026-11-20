import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const exec = promisify(execFile);

test('CRM preserves notes on null and lets the operator intentionally clear them', async (t) => {
  const temp = await mkdtemp(join(tmpdir(), 'amber-crm-notes-'));
  t.after(() => rm(temp, { recursive: true, force: true }));
  await exec(process.execPath, ['--input-type=commonjs', '-e', `
    const assert = require('node:assert/strict');
    const crm = require(process.argv[1]);
    async function main() {
      const phone = '+12025550142';
      const context = {};
      const update = (fields) => crm({ action: 'upsert_contact', phone, ...fields }, context);
      const notes = 'Operator follow-up';
      assert.equal((await update({context_notes: notes})).result.context_notes, notes);
      assert.equal((await update({name: 'Alex', context_notes: null})).result.context_notes, notes);
      assert.equal((await update({context_notes: ''})).result.context_notes, null);
    }
    main().catch(error => { console.error(error); process.exitCode = 1; });
  `, fileURLToPath(new URL('../../amber-skills/crm/handler.js', import.meta.url))], {
    env: { ...process.env, AMBER_CRM_DB_PATH: join(temp, 'crm.sqlite') },
  });
});
