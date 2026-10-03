import { ProblemContext } from '../../shared/types';

export interface ProblemAdapter {
  matches(url: URL): boolean;
  waitUntilReady(): Promise<void>;
  getProblem(): ProblemContext | null;
  getUserCode?(): string | null;
  onProblemChange(cb: () => void): () => void;
}
