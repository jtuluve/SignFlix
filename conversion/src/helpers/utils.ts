export const timeStringToSeconds = (timeString: string): number => {
  if (typeof timeString !== "string") return timeString;
  const [hours, minutes, seconds] = timeString.split(":");
  const [sec, ms] = seconds.split(",");
  return (
    Number.parseInt(hours) * 3600 +
    Number.parseInt(minutes) * 60 +
    Number.parseInt(sec) +
    Number.parseInt(ms) / 1000
  );
};
