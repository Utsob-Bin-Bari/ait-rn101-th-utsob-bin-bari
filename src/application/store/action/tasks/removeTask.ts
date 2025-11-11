export const removeTask = (taskId: string) => ({
  type: 'REMOVE_TASK' as const,
  payload: taskId
});

