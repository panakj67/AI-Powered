export const moveTaskStatus = (tasks, taskId, status) =>
  tasks.map((task) => (task._id === taskId ? { ...task, status } : task));
