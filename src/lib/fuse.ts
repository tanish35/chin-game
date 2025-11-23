import Fuse from 'fuse.js'
import type { FuseResult } from 'fuse.js'
import { CHINS } from '@/src/lib/chins'
import type { ChinPerson } from '@/src/lib/chins'

const fuse = new Fuse(CHINS, {
  keys: ['name'],
  threshold: 0.4, // fuzzy tolerance
  ignoreLocation: true,
})

export function fuzzyMatch(input: string): string | null {
  const result: FuseResult<ChinPerson>[] = fuse.search(input)
  return result.length > 0 ? result[0].item.name : null
}