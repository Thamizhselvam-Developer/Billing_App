export interface Product {
  id: string;
  name: string;
  name_english: string;
  weight: string;
  price: number;

}
export interface AddProduct{
  id?:number
  name: string;
  name_english: string;
  weight?: string;
  price: number;
}