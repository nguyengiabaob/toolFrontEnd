import axios, { AxiosRequestConfig } from "axios";
import queryString from "query-string";

interface IRequestOptions {
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    url: string;
    data?: any;
    isDownload?: true;
  }

export default class RequestService {
    static async requestJson<T>(opts: IRequestOptions) : Promise<Result<T>>
    {
        let axiosResult = null;
        let result = null;
        try {
          const baseUrl = "";
          const Url = baseUrl + opts.url;
          opts.url = Url; // Allow requests also for the Node.
          const processQuery = (url: string, data: any): string => {
            if (data) {
              return `${url}?${queryString.stringify(data)}`;
            }
            return url;
          };
    
          const axiosRequestConfig: AxiosRequestConfig = {};
    
          axiosRequestConfig.headers = {
            ...axiosRequestConfig.headers,
            Accept: "application/json",
            "Content-Type": "application/json; charset=UTF-8",
          };
        
          //#region Check antiforgery
          if (
            opts.method === "POST" ||
            opts.method === "PUT" ||
            opts.method === "DELETE"
          ) {
            if (sessionStorage.getItem("X-XSRF-TOKEN") === null) {
              const response = await fetch("/api/antiforgery/token", {
                method: "GET",
                headers: axiosRequestConfig.headers as HeadersInit,
              });
              if (response.ok) {
                sessionStorage.setItem("X-XSRF-TOKEN", await response.json());
              }
            }
            axiosRequestConfig.headers = {
              ...axiosRequestConfig.headers,
              "X-XSRF-TOKEN": sessionStorage.getItem("X-XSRF-TOKEN") ?? "",
            };
          }
        
          //#endregion
    
          try {
            switch (opts.method) {
              case "GET":
                axiosResult = await axios.get(processQuery(opts.url, opts.data), {
                  headers: axiosRequestConfig.headers,
                  responseType: opts.isDownload === true ? "blob" : "json",
                });
                break;
              case "POST":
                axiosResult = await axios.post(opts.url, opts.data, {
                  headers: axiosRequestConfig.headers,
                });
                break;
              case "PUT":
                  axiosResult = await axios.put(opts.url, opts.data, {
                  headers: axiosRequestConfig.headers,
                });
                break;
              case "PATCH":
                axiosResult = await axios.patch(opts.url, opts.data, {
                  headers: axiosRequestConfig.headers,
                });
                break;
              case "DELETE":
                axiosResult = await axios.delete(
                  processQuery(opts.url, opts.data),
                  {
                    headers: axiosRequestConfig.headers,
                  }
                );
                break;
            }
          
    
            result = new Result<T>(
              axiosResult.data ,
              axiosResult.status,
              axiosResult.data.errors && axiosResult.data.errors.length > 0
                ? [...axiosResult.data.errors]
                : null
            );
          } catch (error: any) {
            if (error.message === "Network Error") {
            //   this.errorConfirm();
            }
            result = new Result<T>(
              error,
              error.response.status,
              error.response.data
            );
          }
    
          // if (result.hasErrors) {
          //   showErrors(...result.errors);
          // }
        } catch (error: any) {
          if (
            !error.response ||
            error.response.status === 302 ||
            error.response.status === 0
          ) {
            
            // window.location.reload();
          }
    
          result = new Result<T>(error, error.response.status, "loi truy xuat");
        }
        return result;
    }
}

class Result<T> {
   
    public data: T;
    public errors: any[];
    public status : any; 
    public get hasErrors(): boolean {
      return (
        this.errors !== null &&
        Array.isArray(this.errors) &&
        this.errors.length > 0
      );
    }
  
    constructor(value: T,status:any, ...errors: any[]) {
      this.data = value;
      this.errors = errors[0] === undefined || errors[0] === null ? [] : errors;
      this.status =status
    }
  }