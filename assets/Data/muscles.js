import Abs from '../../assets/main/Muscles/ic_category_abs_large.svg';
import Back from '../../assets/main/Muscles/ic_category_back_large.svg';
import Biceps from '../../assets/main/Muscles/ic_category_biceps_large.svg';
import Calves from '../../assets/main/Muscles/ic_category_calves_large.svg';
import Cardio from '../../assets/main/Muscles/ic_category_cardio_large.svg';
import Chest from '../../assets/main/Muscles/ic_category_chest_large.svg';
import Forearms from '../../assets/main/Muscles/ic_category_forearms_large.svg';
import Glutes from '../../assets/main/Muscles/ic_category_glutes_large.svg';
import Hamstrings from '../../assets/main/Muscles/ic_category_hamstrings_large.svg';
import Quads from '../../assets/main/Muscles/ic_category_quadriceps_large.svg';
import Shoulders from '../../assets/main/Muscles/ic_category_shoulders_large.svg';
import Trapezius from '../../assets/main/Muscles/ic_category_trapezius_large.svg';
import Triceps from '../../assets/main/Muscles/ic_category_triceps_large.svg';

import { View } from 'react-native';

export const muscles = [
  { id: 0, name: 'Abs', icon: Abs },
  { id: 1, name: 'Back', icon: Back },
  { id: 2, name: 'Biceps', icon: Biceps },
  { id: 3, name: 'Calves', icon: Calves },
  { id: 4, name: 'Cardio', icon: Cardio },
  { id: 5, name: 'Chest', icon: Chest },
  { id: 6, name: 'Forearms', icon: Forearms },
  { id: 7, name: 'Glutes', icon: Glutes },
  { id: 8, name: 'Hamstrings', icon: Hamstrings },
  { id: 9, name: 'Quadriceps', icon: Quads },
  { id: 10, name: 'Shoulders', icon: Shoulders },
  { id: 11, name: 'Trapezius', icon: Trapezius },
  { id: 12, name: 'Triceps', icon: Triceps },
  { id: 13, name: 'Core', icon: Abs },
  { id: 14, name: 'Hips', icon: Glutes },
  { id: 15, name: 'Legs', icon: Quads },
  { id: 16, name: 'Back', icon: Back },
];

export const getMuscleIcon = (name) => {
  const muscle = muscles.find(m => m.name === name);
  const Icon = muscle?.icon;

  return Icon ? (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Icon width="100%" height="100%" preserveAspectRatio="xMidYMid meet" />
    </View>
  ) : null;
};