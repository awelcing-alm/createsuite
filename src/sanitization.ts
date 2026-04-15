import * as path from 'path';

export function sanitizeForGitCommit(input: string): string {
  return input
    .replace(/[\x00-\x1F\x7F]/g, '')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 500);
}

export function isValidTaskId(id: string): boolean {
  return /^cs-[a-z0-9]{5}$/i.test(id);
}

export function isValidConvoyId(id: string): boolean {
  return /^cs-cv-[a-z0-9]{5}$/i.test(id);
}

export function isValidAgentId(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

