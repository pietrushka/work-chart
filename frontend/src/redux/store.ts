import { configureStore } from "@reduxjs/toolkit"
import { authApi } from "./api/authApi"
import { employeesApi } from "./api/employeesApi"

const middlewares = [authApi.middleware, employeesApi.middleware]

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [employeesApi.reducerPath]: employeesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(middlewares),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
