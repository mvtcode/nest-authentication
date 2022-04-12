const prefix = 'user';

export const getKeyUserInfoById = (id: string) : string => {
  return `${prefix}_id_${id}`;
}
