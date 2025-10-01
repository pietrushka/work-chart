import computeManagementEvents from "./computeManagementEvents"

describe("computeManagementEvents", () => {
  test("placeholder", () => {
    const result = computeManagementEvents({
      shiftTemplates: [],
      workerShifts: [],
      rangeStart: new Date(),
      rangeEnd: new Date(),
    })
    expect(result).toEqual({})
  })
})
