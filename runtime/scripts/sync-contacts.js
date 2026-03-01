const Database = require('/Users/abebatthish/clawd/skills/amber-voice-assistant/runtime/node_modules/better-sqlite3');
const fs = require('fs');
const path = require('path');
const os = require('os');

const abDir = path.join(os.homedir(), 'Library', 'Application Support', 'AddressBook');
const sourcesDir = path.join(abDir, 'Sources');

const dbPaths = [];
const mainDb = path.join(abDir, 'AddressBook-v22.abcddb');
if (fs.existsSync(mainDb)) dbPaths.push(mainDb);
if (fs.existsSync(sourcesDir)) {
  for (const s of fs.readdirSync(sourcesDir)) {
    const p = path.join(sourcesDir, s, 'AddressBook-v22.abcddb');
    if (fs.existsSync(p)) dbPaths.push(p);
  }
}

function cleanLabel(l) {
  if (!l) return '';
  return l.replace(/^_\$!</, '').replace(/>!\$_$/, '');
}

// Merge map: name-based key → merged contact
const mergeMap = new Map();

for (const dbPath of dbPaths) {
  try {
    const db = new Database(dbPath, { readonly: true, fileMustExist: true });
    const records = db.prepare(`SELECT Z_PK, ZFIRSTNAME, ZLASTNAME, ZNICKNAME, ZORGANIZATION, ZJOBTITLE, ZNOTE FROM ZABCDRECORD`).all();

    for (const r of records) {
      const fn = (r.ZFIRSTNAME || '').trim();
      const ln = (r.ZLASTNAME || '').trim();
      if (!fn && !ln) continue;

      const mergeKey = `${fn.toLowerCase()}_${ln.toLowerCase()}`;

      let contact = mergeMap.get(mergeKey);
      if (!contact) {
        contact = {
          firstName: fn, lastName: ln,
          nickname: '', organization: '', jobTitle: '', note: '',
          phones: [], emails: [], relationships: [], addresses: [],
          _seenPhones: new Set(), _seenEmails: new Set(), _seenRels: new Set(),
        };
        mergeMap.set(mergeKey, contact);
      }

      // Merge scalar fields (prefer non-empty)
      if (!contact.nickname && r.ZNICKNAME) contact.nickname = r.ZNICKNAME;
      if (!contact.organization && r.ZORGANIZATION) contact.organization = r.ZORGANIZATION;
      if (!contact.jobTitle && r.ZJOBTITLE) contact.jobTitle = r.ZJOBTITLE;
      if (!contact.note && r.ZNOTE) contact.note = r.ZNOTE;

      // Phones
      const phones = db.prepare(`SELECT ZFULLNUMBER, ZLABEL FROM ZABCDPHONENUMBER WHERE ZOWNER = ? AND ZFULLNUMBER IS NOT NULL`).all(r.Z_PK);
      for (const p of phones) {
        const num = p.ZFULLNUMBER.trim();
        const digits = num.replace(/\D/g, '').slice(-10);
        if (!contact._seenPhones.has(digits)) {
          contact._seenPhones.add(digits);
          contact.phones.push({ number: num, label: cleanLabel(p.ZLABEL) });
        }
      }

      // Emails
      const emails = db.prepare(`SELECT ZADDRESS, ZLABEL FROM ZABCDEMAILADDRESS WHERE ZOWNER = ? AND ZADDRESS IS NOT NULL`).all(r.Z_PK);
      for (const e of emails) {
        const addr = e.ZADDRESS.toLowerCase();
        if (!contact._seenEmails.has(addr)) {
          contact._seenEmails.add(addr);
          contact.emails.push({ address: e.ZADDRESS, label: cleanLabel(e.ZLABEL) });
        }
      }

      // Relationships
      const rels = db.prepare(`SELECT ZNAME, ZLABEL FROM ZABCDRELATEDNAME WHERE ZOWNER = ? AND ZNAME IS NOT NULL`).all(r.Z_PK);
      for (const rel of rels) {
        const relKey = `${rel.ZNAME.toLowerCase()}_${cleanLabel(rel.ZLABEL)}`;
        if (!contact._seenRels.has(relKey)) {
          contact._seenRels.add(relKey);
          contact.relationships.push({ name: rel.ZNAME, type: cleanLabel(rel.ZLABEL) });
        }
      }

      // Addresses
      try {
        const addrs = db.prepare(`SELECT ZSTREET, ZCITY, ZSTATE, ZZIPCODE, ZCOUNTRYNAME, ZLABEL FROM ZABCDPOSTALADDRESS WHERE ZOWNER = ?`).all(r.Z_PK);
        for (const a of addrs) {
          const parts = [a.ZSTREET, a.ZCITY, a.ZSTATE, a.ZZIPCODE, a.ZCOUNTRYNAME].filter(Boolean);
          if (parts.length) {
            contact.addresses.push({ full: parts.join(', '), label: cleanLabel(a.ZLABEL) });
          }
        }
      } catch (_) {}
    }
    db.close();
  } catch (e) {
    console.warn(`Skipped ${dbPath}: ${e.message}`);
  }
}

// Clean up internal tracking sets and filter contacts with at least phone or email
const contacts = [];
for (const c of mergeMap.values()) {
  delete c._seenPhones;
  delete c._seenEmails;
  delete c._seenRels;
  if (c.phones.length || c.emails.length) contacts.push(c);
}

const outPath = path.join(os.homedir(), 'clawd', 'skills', 'amber-voice-assistant', 'runtime', 'contacts-cache.json');
fs.writeFileSync(outPath, JSON.stringify({ exportedAt: new Date().toISOString(), count: contacts.length, contacts }, null, 2));
console.log(`✓ Exported ${contacts.length} contacts (merged across sources)`);
