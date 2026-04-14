import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const customerApi = createApi({
  reducerPath: "customerApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/customers",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),

  endpoints: (builder) => ({
    // Stats
    getCustomerStats: builder.query({
      query: () => "/stats",
    }),

    // Customer List
    getCustomers: builder.query({
      query: ({ page = 1, search = "" }) =>
        `?page=${page}&limit=5&search=${search}`,
    }),

    // Single Customer
    getCustomerById: builder.query({
      query: (id) => `/${id}`,
    }),
  }),
});

export const {
  useGetCustomerStatsQuery,
  useGetCustomersQuery,
  useGetCustomerByIdQuery,
} = customerApi;
