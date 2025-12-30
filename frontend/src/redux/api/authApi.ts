import { baseApi } from "./baseApi";
import {
  RegisterPayload,
  LoginPayload,
  ActivateAccountPayload,
} from "../../types/auth";
import { MessageResponse } from "../../types/common";

type CurrentUserResponse = {
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  company: {
    id: string;
    name: string;
  };
};

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentUser: builder.query<CurrentUserResponse, void>({
      query: () => ({
        url: "/auth/me",
        method: "GET",
      }),
      providesTags: ["CurrentUser"],
    }),
    register: builder.mutation<MessageResponse, RegisterPayload>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
    }),
    login: builder.mutation<MessageResponse, LoginPayload>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      invalidatesTags: ["CurrentUser"],
    }),
    activateAccount: builder.mutation<MessageResponse, ActivateAccountPayload>({
      query: (body) => ({
        url: "/auth/activate-account",
        method: "POST",
        body,
      }),
    }),
    logout: builder.mutation<MessageResponse, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        console.log("Logout successful, resetting auth state");
        dispatch(baseApi.util.resetApiState());
      },
    }),
  }),
});

export const {
  useGetCurrentUserQuery,
  useRegisterMutation,
  useLoginMutation,
  useActivateAccountMutation,
  useLogoutMutation,
} = authApi;
