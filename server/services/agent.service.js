export const planSteps = async (goal) => {
  return [
    { title: `Research for: ${goal}`, status: "pending" },
    { title: "Build options shortlist", status: "pending" },
    { title: "Draft final recommendation", status: "pending" },
  ];
};

export const executeStep = async (run, stepIndex) => {
  run.steps[stepIndex].status = "completed";
  run.logs.push({ message: `Completed step: ${run.steps[stepIndex].title}` });
  return run;
};

export const updateProgress = async (run) => {
  run.status = run.steps.every((s) => s.status === "completed") ? "completed" : "running";
  return run;
};
