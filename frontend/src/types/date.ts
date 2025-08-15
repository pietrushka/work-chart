// Week starts on Monday
export const WEEK_STARTS_ON = 1 as const

export type View = "month" | "week" | "day"

export type IRange = {
  rangeStart: Date
  rangeEnd: Date
}
