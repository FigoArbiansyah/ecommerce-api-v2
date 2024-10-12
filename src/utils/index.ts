export type methodType = Response | any | void;

export const _parseInt = (_value: string | number) => {
  return parseInt(_value as string, 10);
}
