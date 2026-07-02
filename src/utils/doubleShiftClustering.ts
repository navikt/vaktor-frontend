import { Schedules } from '../types/types'

export interface DoubleClusterMap {
  map: Map<string, number>
  clusterNames: string[]
}

/**
 * Clusters overlapping double shifts using BFS traversal on overlapping_schedules.
 * Groups all shifts that overlap (directly or transitively) into clusters.
 *
 * @param vakter List of schedules (typically filtered to is_double === true)
 * @returns Map of shift IDs to cluster indices, and cluster display names
 */
export function clusterDoubleShifts(vakter: Schedules[]): DoubleClusterMap {
  const doubles = vakter.filter((s) => s.is_double)
  if (doubles.length === 0) return { map: new Map(), clusterNames: [] }

  const doubleById = new Map(doubles.map((s) => [s.id, s]))
  const visited = new Set<string>()
  const clusters: string[][] = []

  for (const s of doubles) {
    if (visited.has(s.id)) continue

    const clusterIds = new Set<string>()
    const queue: string[] = [s.id]

    // BFS traversal through overlapping_schedules
    while (queue.length > 0) {
      const id = queue.shift()!
      if (clusterIds.has(id)) continue

      clusterIds.add(id)
      const node = doubleById.get(id)
      if (node) {
        for (const overlap of node.overlapping_schedules ?? []) {
          if (!clusterIds.has(overlap.id)) queue.push(overlap.id)
        }
      }
    }

    clusterIds.forEach((id) => visited.add(id))
    clusters.push(Array.from(clusterIds))
  }

  const map = new Map<string, number>()
  clusters.forEach((cluster, i) => cluster.forEach((id) => map.set(id, i)))

  const clusterNames = clusters.map((ids) => {
    const names = new Set(ids.map((id) => vakter.find((s) => s.id === id)?.user?.name).filter(Boolean))
    return Array.from(names).join(' & ')
  })

  return { map, clusterNames }
}
