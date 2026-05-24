export type HoveredProject = {
  name:   string;
  client: string;
  desc:   string;
  url:    string;
} | null;

let _current: HoveredProject = null;
let _hoveredIndex: number | null = null;
const _listeners = new Set<(p: HoveredProject) => void>();

export function setHoveredIndex(i: number | null) { _hoveredIndex = i; }
export function getHoveredIndex(): number | null    { return _hoveredIndex; }

export function setHoveredProject(p: HoveredProject) {
  if (_current === p) return;
  _current = p;
  _listeners.forEach(fn => fn(p));
}

export function getHoveredProject(): HoveredProject {
  return _current;
}

export function subscribeHoveredProject(fn: (p: HoveredProject) => void): () => void {
  _listeners.add(fn);
  return () => _listeners.delete(fn);
}
