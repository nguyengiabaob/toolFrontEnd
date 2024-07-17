import React from "react";
import ApiService from "../../Service/ApiService/ApiService";

const Page = () => {
  const getApi = (address: string, port: number, url: string) => {
    let request = ApiService.getApi(address, port, url);
  };
  return <div></div>;
};

export default Page;
