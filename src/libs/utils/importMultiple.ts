export const importMultiple = (files: string[]) =>
  Promise.all(files.map((file) => import(file)));
