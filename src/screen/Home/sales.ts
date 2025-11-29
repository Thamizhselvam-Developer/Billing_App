import { API_URL } from "@env";
import axios from "axios";

export const salesData= async ()=>{
    try{
const response = await axios.get(`${API_URL}api/report/daily"`);

console.log(response.data);
    }catch(err){
console.log(err)
    }
}