export interface Timer {
  id: any,
  elapsedSeconds: number,
  elapsedMinutes: number,
  isLive: boolean,
  isPaused: boolean,
  dateStarted: Date,
  dateEnded: Date
}
