import { configureStore } from "@reduxjs/toolkit"
import { authApi } from "./api/authApi"
import { employeeApi } from "./api/employeeApi"
import { shiftTemplateApi } from "./api/shiftTemplateApi"
import { workerShiftApi } from "./api/workerShiftApi"

const middlewares = [
  authApi.middleware,
  employeeApi.middleware,
  shiftTemplateApi.middleware,
  workerShiftApi.middleware,
]

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [employeeApi.reducerPath]: employeeApi.reducer,
    [shiftTemplateApi.reducerPath]: shiftTemplateApi.reducer,
    [workerShiftApi.reducerPath]: workerShiftApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(middlewares),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
