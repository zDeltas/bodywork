import { Routine } from '@/types/common';

const PREMADE_ROUTINES: Routine[] = [
  {
    id: 'premade-1',
    title: 'Full Body',
    description: 'Entraînement complet du corps',
    exercises: [
      {
        name: 'Squat',
        key: 'squat',
        translationKey: 'squat',
        series: [
          { unitType: 'reps', weight: 0, reps: 12, rest: '90', type: 'warmUp', note: '', rpe: 0 },
          { unitType: 'reps', weight: 0, reps: 10, rest: '90', type: 'workingSet', note: '', rpe: 7 },
          { unitType: 'reps', weight: 0, reps: 8, rest: '90', type: 'workingSet', note: '', rpe: 7 }
        ]
      },
      {
        name: 'Développé Couché',
        key: 'bench-press',
        translationKey: 'bench-press',
        series: [
          { unitType: 'reps', weight: 0, reps: 12, rest: '90', type: 'warmUp', note: '', rpe: 0 },
          { unitType: 'reps', weight: 0, reps: 10, rest: '90', type: 'workingSet', note: '', rpe: 7 },
          { unitType: 'reps', weight: 0, reps: 8, rest: '90', type: 'workingSet', note: '', rpe: 7 }
        ]
      },
      {
        name: 'Planche',
        key: 'exercise_core_plank',
        translationKey: 'exercise_core_plank',
        series: [
          { unitType: 'time', weight: 0, duration: 60, rest: '60', type: 'workingSet', note: '', rpe: 7 },
          { unitType: 'time', weight: 0, duration: 90, rest: '60', type: 'workingSet', note: '', rpe: 8 }
        ]
      }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'premade-2',
    title: 'Push Pull Legs',
    description: 'Split classique PPL',
    exercises: [
      {
        name: 'Développé Couché',
        key: 'bench-press',
        translationKey: 'bench-press',
        series: [
          { unitType: 'reps', weight: 0, reps: 12, rest: '90', type: 'warmUp', note: '', rpe: 0 },
          { unitType: 'reps', weight: 0, reps: 10, rest: '90', type: 'workingSet', note: '', rpe: 7 },
          { unitType: 'reps', weight: 0, reps: 8, rest: '90', type: 'workingSet', note: '', rpe: 7 }
        ]
      },
      {
        name: 'Tractions',
        key: 'pull-ups',
        translationKey: 'pull-ups',
        series: [
          { unitType: 'reps', weight: 0, reps: 8, rest: '90', type: 'workingSet', note: '', rpe: 7 },
          { unitType: 'reps', weight: 0, reps: 8, rest: '90', type: 'workingSet', note: '', rpe: 7 },
          { unitType: 'reps', weight: 0, reps: 8, rest: '90', type: 'workingSet', note: '', rpe: 7 }
        ]
      }
    ],
    createdAt: new Date().toISOString()
  }
];

export default PREMADE_ROUTINES; 
