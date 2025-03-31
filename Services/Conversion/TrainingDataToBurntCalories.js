export const calculateBurntCalories = (activityType, bodyWeight, distanceMeters, speedKmh, timeMinutes ) => {
    if (!timeMinutes && distanceMeters && speedKmh) {
        timeMinutes = (distanceMeters / speedKmh) * 60;
    }
  
    if (!timeMinutes && distanceMeters && speedKmh) {
        timeMinutes = ((distanceMeters / 1000) / speedKmh) * 60;
    }

    if(speedKmh === 0 || distanceMeters === 0){
        return 0;
    }
    
      const METs = {
        'Running': 9.8,
        'Walking': 3.8,
        'Hiking': 7.0,
        'Bike': 7.5,
        'Mountain Bike': 8.5,
        'E-Bike': 6.8,
        'Swimming': 8.0,
        'Surfing': 4.5,
        'Kayaking': 4.0,
        'Paddling': 4.0,
        'Ice skating': 5.0,
        'Snowboarding': 5.5,
        'Skiing': 6.0,
        'Football': 8.0,
        'Golf': 4.3,
        'Squash': 7.0,
        'Tennis': 7.3,
        'Badminton': 4.5,
        'Basketball': 6.5,
        'VolleyBall': 3.5,
        'Workout': 6.0,
      };
    
    const MET = METs[activityType] || 1;
    const hours = timeMinutes / 60;
    
    const calories = MET * bodyWeight * hours;
    
    return calories;
  };
  