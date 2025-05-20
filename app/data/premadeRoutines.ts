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
          { weight: 0, reps: 12, rest: '90', type: 'warmUp', note: '', rpe: 0 },
          { weight: 0, reps: 10, rest: '90', type: 'workingSet', note: '', rpe: 7 },
          { weight: 0, reps: 8, rest: '90', type: 'workingSet', note: '', rpe: 7 }
        ]
      },
      {
        name: 'Développé Couché',
        key: 'bench-press',
        translationKey: 'bench-press',
        series: [
          { weight: 0, reps: 12, rest: '90', type: 'warmUp', note: '', rpe: 0 },
          { weight: 0, reps: 10, rest: '90', type: 'workingSet', note: '', rpe: 7 },
          { weight: 0, reps: 8, rest: '90', type: 'workingSet', note: '', rpe: 7 }
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
          { weight: 0, reps: 12, rest: '90', type: 'warmUp', note: '', rpe: 0 },
          { weight: 0, reps: 10, rest: '90', type: 'workingSet', note: '', rpe: 7 },
          { weight: 0, reps: 8, rest: '90', type: 'workingSet', note: '', rpe: 7 }
        ]
      },
      {
        name: 'Tractions',
        key: 'pull-ups',
        translationKey: 'pull-ups',
        series: [
          { weight: 0, reps: 8, rest: '90', type: 'workingSet', note: '', rpe: 7 },
          { weight: 0, reps: 8, rest: '90', type: 'workingSet', note: '', rpe: 7 },
          { weight: 0, reps: 8, rest: '90', type: 'workingSet', note: '', rpe: 7 }
        ]
      }
    ],
    createdAt: new Date().toISOString()
  }
];

export default PREMADE_ROUTINES; 
