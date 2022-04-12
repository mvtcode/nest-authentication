import { hash, compare } from 'bcrypt';

export const hashPassword = (password: string) : Promise<string> => {
  const saltRounds = 10;
  return hash(password, saltRounds);
};

export const comparePassword = (password: string, hash: string) : Promise<boolean> => {
  return compare(password, hash);
};
