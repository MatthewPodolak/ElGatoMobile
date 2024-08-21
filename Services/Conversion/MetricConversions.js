export const convertFeetInchesToCm = (height) => {
    const [feet, inches] = height.split("'").map(val => parseFloat(val));
    const totalInches = (feet * 12) + inches;
    const heightInCm = totalInches * 2.54;
    return heightInCm.toFixed(2);
  };