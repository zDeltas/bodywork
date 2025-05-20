const calculateEstimated1RM = (weight: number, reps: number): number => {
  return Math.round(weight * (1 + reps / 30));
};

const calculateVolume = (weight: number, reps: number, sets: number): number => {
  return weight * reps * sets;
};

const calculations = {
  calculateEstimated1RM,
  calculateVolume
};

export default calculations;
