import { configureStore } from "@reduxjs/toolkit"
import { authApi } from "./api/authApi"
import { employeesApi } from "./api/employeesApi"
import { shiftTemplateApi } from "./api/shiftTemplateApi"

const middlewares = [
  authApi.middleware,
  employeesApi.middleware,
  shiftTemplateApi.middleware,
]

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [employeesApi.reducerPath]: employeesApi.reducer,
    [shiftTemplateApi.reducerPath]: shiftTemplateApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(middlewares),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
