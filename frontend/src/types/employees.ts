export type GetEmployeesResponse = {
  employees: Employee[]
}

type Employee = {
  id: number
  firstName: string
  lastName: string
  position: string
  email: string
}

export type AddEmployeePayload = Omit<Employee, "id">
