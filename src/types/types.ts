// src/types/types.ts
export interface ZipSearchData {
  zipCode: string;
  territory: string;
  // ... any other properties in your JSON
}

export interface DataError {
  error: string;
}

export type SalesRepData = {
  territory: string;
  salesRepName: string;
  salesRepEmailAddress: string;
  salesRepPhoneNumber: string;
};