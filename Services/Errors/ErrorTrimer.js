export const errorTrim = (trimmedError) => {
    if (trimmedError.startsWith('"') && trimmedError.endsWith('"')) {
      return trimmedError.slice(1, -1);
    }
    return trimmedError;
  };
  