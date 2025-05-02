const calculateEstimated1RM = (weight: number, reps: number): number => {
  return Math.round(weight * (1 + (reps / 30)));
};

const calculations = {
  calculateEstimated1RM
};

export default calculations; 