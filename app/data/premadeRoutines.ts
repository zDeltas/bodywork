import { Routine } from '@/app/types/routine';

export const PREMADE_ROUTINES: Routine[] = [
  {
    id: 'premade-1',
    title: 'Full Body',
    description: 'Entraînement complet du corps',
    exercises: [
      {
        name: 'Squat',
        key: 'squat',
        series: [
          { weight: 0, reps: 12, rest: '90', type: 'warmUp', note: '' },
          { weight: 0, reps: 10, rest: '90', type: 'workingSet', note: '' },
          { weight: 0, reps: 8, rest: '90', type: 'workingSet', note: '' }
        ]
      },
      {
        name: 'Développé Couché',
        key: 'bench-press',
        series: [
          { weight: 0, reps: 12, rest: '90', type: 'warmUp', note: '' },
          { weight: 0, reps: 10, rest: '90', type: 'workingSet', note: '' },
          { weight: 0, reps: 8, rest: '90', type: 'workingSet', note: '' }
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
        series: [
          { weight: 0, reps: 12, rest: '90', type: 'warmUp', note: '' },
          { weight: 0, reps: 10, rest: '90', type: 'workingSet', note: '' },
          { weight: 0, reps: 8, rest: '90', type: 'workingSet', note: '' }
        ]
      },
      {
        name: 'Tractions',
        key: 'pull-ups',
        series: [
          { weight: 0, reps: 8, rest: '90', type: 'workingSet', note: '' },
          { weight: 0, reps: 8, rest: '90', type: 'workingSet', note: '' },
          { weight: 0, reps: 8, rest: '90', type: 'workingSet', note: '' }
        ]
      }
    ],
    createdAt: new Date().toISOString()
  }
]; 