import { configureStore } from "@reduxjs/toolkit"
import { authApi } from "./api/authApi"

const middlewares = [authApi.middleware]

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(middlewares),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
