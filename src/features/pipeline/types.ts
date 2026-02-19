export type PipelineStatus = 'Idle' | 'Running' | 'Succeeded' | 'Failed';

export type PipelineItem = {
  id: string;
  name: string;
  connectionId: string;
  connectionName: string;
  schedule: string;
  owner: string;
  description: string;
  status: PipelineStatus;
  lastRunAt: string | null;
};
