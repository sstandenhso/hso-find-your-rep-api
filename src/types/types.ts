// src/types/types.ts
export interface ZipSearchData {
  zipCode: string;
  territory: string;
  // ... any other properties in your JSON
}

export interface DataError {
  error: string;
}

export type SalesRep = {
  name: string;
  phone: string;
  email: string;
  ID: string;
};

export type State = {
   state: string,
   stateAbbreviation: string,
   supportRep: string,
   productRep: string,
   salesRep: string,
   groupPracticeRep: string
};

export type Data =  ZipSearchData | DataError | SalesRep | State;

export type TestData = {
    id: number;
    name: string;
  }[];
