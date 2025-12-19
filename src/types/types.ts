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
  ID: number;
};

export type State = {
  state: String,
   stateAbbreviation: String,
   supportRep: number,
   productRep: number,
   salesRep: number,
   groupPracticeRep: number
};

export type Data =  ZipSearchData | DataError | SalesRep | State;

export type TestData = {
    id: number;
    name: string;
  }[];
