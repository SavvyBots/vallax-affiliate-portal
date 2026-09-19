import { BaseRecord, CreateParams, CreateResponse, DataProvider, DeleteOneParams, DeleteOneResponse, GetListParams, GetListResponse, GetOneParams, GetOneResponse, UpdateParams, UpdateResponse } from "node_modules/@refinedev/core/dist";


const API_URL = "https://api.fake-rest.refine.dev";

export const userProvider: DataProvider = {

  getOne: async () => {
    const response = await fetch(`${API_URL}/me/`);

    if (response.status < 200 || response.status > 299) throw response;

    const data = await response.json();

    return { data };

  },

  getApiUrl:() => API_URL,
  create: function <TData extends BaseRecord = BaseRecord, TVariables = {}>(params: CreateParams<TVariables>): Promise<CreateResponse<TData>> {
    throw new Error("Function not implemented.");
  },
  update: function <TData extends BaseRecord = BaseRecord, TVariables = {}>(params: UpdateParams<TVariables>): Promise<UpdateResponse<TData>> {
    throw new Error("Function not implemented.");
  },
  deleteOne: function <TData extends BaseRecord = BaseRecord, TVariables = {}>(params: DeleteOneParams<TVariables>): Promise<DeleteOneResponse<TData>> {
    throw new Error("Function not implemented.");
  },

  getList: function <TData extends BaseRecord = BaseRecord>(params: GetListParams): Promise<GetListResponse<TData>> {
    throw new Error("Function not implemented.");
  },
}
