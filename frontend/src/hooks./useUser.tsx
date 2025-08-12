import { useGetCurrentUserQuery } from "../redux/api/authApi"

export default function useUser() {
  const { data, isError } = useGetCurrentUserQuery()
  const currentUser = isError ? undefined : data

  return currentUser
}
