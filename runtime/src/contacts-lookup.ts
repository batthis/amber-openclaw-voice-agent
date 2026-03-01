/**
 * Apple Contacts Lookup
 *
 * Queries the local Apple Contacts (AddressBook) SQLite databases
 * to resolve contact names to phone numbers.
 * 
 * Searches across all iCloud-synced source databases for maximum coverage.
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

interface ContactResult {
  firstName: string | null;
  lastName: string | null;
  fullName: string;
  phone: string;
  label: string | null;
}

/**
 * Find all AddressBook SQLite databases (main + sources).
 */
function findAddressBookDbs(): string[] {
  const baseDir = path.join(os.homedir(), 'Library', 'Application Support', 'AddressBook');
  const dbs: string[] = [];

  // Main DB
  const mainDb = path.join(baseDir, 'AddressBook-v22.abcddb');
  if (fs.existsSync(mainDb)) dbs.push(mainDb);

  // Source DBs (iCloud, Google, etc.)
  const sourcesDir = path.join(baseDir, 'Sources');
  if (fs.existsSync(sourcesDir)) {
    for (const source of fs.readdirSync(sourcesDir)) {
      const sourceDb = path.join(sourcesDir, source, 'AddressBook-v22.abcddb');
      if (fs.existsSync(sourceDb)) dbs.push(sourceDb);
    }
  }

  return dbs;
}

/**
 * Normalize a phone number to E.164-ish format for comparison.
 */
function normalizePhone(phone: string): string {
  // Strip everything except digits and leading +
  const digits = phone.replace(/[^\d+]/g, '');
  // If starts with 1 and is 11 digits, add +
  if (digits.length === 11 && digits.startsWith('1')) return '+' + digits;
  // If 10 digits, assume US/CA
  if (digits.length === 10) return '+1' + digits;
  // If already has +, keep as-is
  if (digits.startsWith('+')) return digits;
  return digits;
}

/**
 * Search contacts by name (fuzzy, case-insensitive).
 */
export function searchByName(query: string): ContactResult[] {
  const dbs = findAddressBookDbs();
  const results: ContactResult[] = [];
  const seen = new Set<string>(); // dedupe by normalized phone

  const sanitizedQuery = query.replace(/['"\\;]/g, '').trim();
  if (!sanitizedQuery) return [];

  for (const db of dbs) {
    try {
      const sql = `
        SELECT r.ZFIRSTNAME, r.ZLASTNAME, p.ZFULLNUMBER, p.ZLABEL
        FROM ZABCDRECORD r
        JOIN ZABCDPHONENUMBER p ON p.ZOWNER = r.Z_PK
        WHERE (
          r.ZFIRSTNAME LIKE '%${sanitizedQuery}%' COLLATE NOCASE
          OR r.ZLASTNAME LIKE '%${sanitizedQuery}%' COLLATE NOCASE
          OR (r.ZFIRSTNAME || ' ' || r.ZLASTNAME) LIKE '%${sanitizedQuery}%' COLLATE NOCASE
          OR r.ZNICKNAME LIKE '%${sanitizedQuery}%' COLLATE NOCASE
          OR r.ZORGANIZATION LIKE '%${sanitizedQuery}%' COLLATE NOCASE
        )
        AND p.ZFULLNUMBER IS NOT NULL;
      `;

      const output = execFileSync('/usr/bin/sqlite3', [db, sql], {
        encoding: 'utf8',
        timeout: 5000,
      }).trim();

      if (!output) continue;

      for (const line of output.split('\n')) {
        const [firstName, lastName, phone, label] = line.split('|');
        if (!phone) continue;

        const normalized = normalizePhone(phone);
        const dedupeKey = `${(firstName || '').toLowerCase()}_${(lastName || '').toLowerCase()}_${normalized}`;

        if (seen.has(dedupeKey)) continue;
        seen.add(dedupeKey);

        const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Unknown';

        results.push({
          firstName: firstName || null,
          lastName: lastName || null,
          fullName,
          phone: phone.trim(),
          label: label || null,
        });
      }
    } catch {
      // Skip databases that fail to query
    }
  }

  return results;
}

/**
 * Search contacts by phone number.
 */
export function searchByPhone(phone: string): ContactResult[] {
  const dbs = findAddressBookDbs();
  const results: ContactResult[] = [];
  const seen = new Set<string>();

  // Extract just digits for LIKE matching
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 7) return []; // too short to be meaningful

  // Use last 10 digits for matching (strip country code)
  const searchDigits = digits.slice(-10);

  for (const db of dbs) {
    try {
      // SQLite doesn't have regex, so we search for the digit sequence
      // within the phone number (which may have formatting)
      const sql = `
        SELECT r.ZFIRSTNAME, r.ZLASTNAME, p.ZFULLNUMBER, p.ZLABEL
        FROM ZABCDRECORD r
        JOIN ZABCDPHONENUMBER p ON p.ZOWNER = r.Z_PK
        WHERE REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(p.ZFULLNUMBER, ' ', ''), '-', ''), '(', ''), ')', ''), '+', '')
          LIKE '%${searchDigits}%'
        AND p.ZFULLNUMBER IS NOT NULL;
      `;

      const output = execFileSync('/usr/bin/sqlite3', [db, sql], {
        encoding: 'utf8',
        timeout: 5000,
      }).trim();

      if (!output) continue;

      for (const line of output.split('\n')) {
        const [firstName, lastName, foundPhone, label] = line.split('|');
        if (!foundPhone) continue;

        const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Unknown';
        const dedupeKey = `${fullName.toLowerCase()}_${normalizePhone(foundPhone)}`;

        if (seen.has(dedupeKey)) continue;
        seen.add(dedupeKey);

        results.push({
          firstName: firstName || null,
          lastName: lastName || null,
          fullName,
          phone: foundPhone.trim(),
          label: label || null,
        });
      }
    } catch {
      // Skip databases that fail
    }
  }

  return results;
}
