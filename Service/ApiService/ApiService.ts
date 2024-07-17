import RequestService from "../DataService/DataService";

export default class ApiService {
    static async getApi (address:string , port:number,url:string )
    {
        let result  = await RequestService.requestJson<any>({url: `/main/getApi?address=${address}&port=${port}&url=${url}`,method:"GET",});
        return result;
    }   
}