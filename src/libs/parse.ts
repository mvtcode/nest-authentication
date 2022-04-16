export const parseJson = (obj: string): any => {
  try {
    if (!obj) return null;
    return JSON.parse(obj);
  } catch (e) {
    return null;
  }
};
