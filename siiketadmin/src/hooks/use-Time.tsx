import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

export function useTimeAgo(dateString: Date) {
  const [timeAgo, setTimeAgo] = useState("");

  useEffect(() => {
    function updateTime() {
      const date = new Date(dateString);
      // date.setHours(date.getHours() - 5);
      // date.setMinutes(date.getMinutes() - 30);
      setTimeAgo(formatDistanceToNow(date, { addSuffix: true }));
    }
    updateTime();

    const interval = setInterval(updateTime, 60 * 1000);
    return () => clearInterval(interval);
  }, [dateString]);

  return timeAgo;
}
