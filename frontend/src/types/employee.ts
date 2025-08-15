export type Employee = {
  id: string
  first_name: string
  last_name: string
  role: string
  email: string
  position?: string
}

export type EmployeeFormValues = Omit<Employee, "id">

export type AddEmployeePayload = EmployeeFormValues

export type GetEmployeesResponse = {
  items: Employee[]
}

export type UpdateEmployeePayload = Employee
