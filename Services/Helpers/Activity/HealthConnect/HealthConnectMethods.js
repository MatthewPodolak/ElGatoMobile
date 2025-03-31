import { readRecords } from 'react-native-health-connect';

export const readStepsToday = async () => {
  const now = new Date();
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  try {
    const { records } = await readRecords('Steps', {
      timeRangeFilter: {
        operator: 'between',
        startTime: start.toISOString(),
        endTime: now.toISOString(),
      },
    });

    if (!records || records.length === 0) {
      return 0;
    }

    const groups = {};
    records.forEach(record => {
      const origin = record.metadata?.dataOrigin;
      if (origin) {
        if (!groups[origin]) {
          groups[origin] = [];
        }
        groups[origin].push(record);
      }
    });

    const groupKeys = Object.keys(groups);
    if (groupKeys.length === 0) {
      return 0;
    }

    const chosenGroup = groups[groupKeys[0]];
    const totalSteps = chosenGroup.reduce((sum, record) => sum + (record.count || 0), 0);

    return totalSteps;

  } catch (error) {
    return 0;
  }
};

export const readBurntCaloriesPeriod = async (from, to) => {
  if (!(from instanceof Date) || !(to instanceof Date)) {
    return 0;
  }

  try {
    const { records } = await readRecords('ActiveCaloriesBurned', {
      timeRangeFilter: {
        operator: 'between',
        startTime: from.toISOString(),
        endTime: to.toISOString(),
      },
    });

    if (!records || records.length === 0) {
      return 0;
    }

    const groups = {};
    records.forEach(record => {
      const origin = record.metadata?.dataOrigin;
      if (origin) {
        if (!groups[origin]) {
          groups[origin] = [];
        }
        groups[origin].push(record);
      }
    });

    const groupKeys = Object.keys(groups);
    if (groupKeys.length === 0) {
      return 0;
    }

    const chosenGroup = groups[groupKeys[0]];
    const totalCalories = chosenGroup.reduce((sum, record) => { return sum + (record.calories || 0); }, 0);

    return totalCalories;

  } catch (error) {
    return 0;
  }
};