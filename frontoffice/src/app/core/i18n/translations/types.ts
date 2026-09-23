import { fr } from './fr';

type DeepStrings<T> = { [K in keyof T]: T[K] extends string ? string : DeepStrings<T[K]> };

/** Every language must provide exactly the keys of the French dictionary. */
export type Translations = DeepStrings<typeof fr>;
