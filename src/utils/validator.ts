export const checkIfEmpty = ([...inputs]: string[]) => {
  let isEmpty = false;
  inputs.every((input) => {
    if (input.length < 1) {
      isEmpty = true;
      return false;
    }
  });
  return !isEmpty;
};
