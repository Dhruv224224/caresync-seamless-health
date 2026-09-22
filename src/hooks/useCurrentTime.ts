import { useState, useEffect } from "react";

export interface LiveTimeOptions {
  /**
   * Refresh interval in milliseconds.
   * Defaults to 1000ms (1 second) for digital clocks.
   * Can be set to 60000ms (1 minute) for less time-sensitive headers.
   */
  intervalMs?: number;
  /**
   * Optional custom locale (defaults to navigator language or 'en-US')
   */
  locale?: string;
  /**
   * Optional timeZone override (e.g. 'Asia/Kolkata', 'America/New_York').
   * If omitted, uses local browser time.
   */
  timeZone?: string;
}

export interface FormattedLiveTime {
  date: Date;
  timeString: string; // e.g. "09:41:20 PM" or "21:41:20"
  timeShort: string; // e.g. "09:41 PM"
  dateString: string; // e.g. "Tuesday, Sep 22, 2026"
  formattedTimestamp: string; // e.g. "Sep 22, 2026 · 09:41 PM"
  isoString: string;
}

/**
 * Shared, lightweight Live Current Time hook
 * Automatically updates time at the requested frequency and cleans up timer on unmount.
 */
export function useCurrentTime(options: LiveTimeOptions = {}): FormattedLiveTime {
  const { intervalMs = 1000, locale = "en-US", timeZone } = options;
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());

  useEffect(() => {
    // Initial sync
    setCurrentDate(new Date());

    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, intervalMs);

    return () => {
      clearInterval(timer);
    };
  }, [intervalMs]);

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    second: intervalMs < 10000 ? "2-digit" : undefined,
    hour12: true,
    ...(timeZone ? { timeZone } : {}),
  };

  const shortTimeOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    ...(timeZone ? { timeZone } : {}),
  };

  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(timeZone ? { timeZone } : {}),
  };

  const timeString = new Intl.DateTimeFormat(locale, timeOptions).format(currentDate);
  const timeShort = new Intl.DateTimeFormat(locale, shortTimeOptions).format(currentDate);
  const dateString = new Intl.DateTimeFormat(locale, dateOptions).format(currentDate);
  const formattedTimestamp = `${dateString} · ${timeShort}`;

  return {
    date: currentDate,
    timeString,
    timeShort,
    dateString,
    formattedTimestamp,
    isoString: currentDate.toISOString(),
  };
}

/**
 * Utility to format relative elapsed time dynamically from a given timestamp
 */
export function formatRelativeTime(timestamp: string | number | Date): string {
  const date = typeof timestamp === "string" || typeof timestamp === "number" ? new Date(timestamp) : timestamp;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (isNaN(diffInSeconds) || diffInSeconds < 0) {
    return "just now";
  }
  if (diffInSeconds < 45) {
    return "just now";
  }
  if (diffInSeconds < 90) {
    return "1 min ago";
  }
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} mins ago`;
  }
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return diffInHours === 1 ? "1 hour ago" : `${diffInHours} hours ago`;
  }
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return "yesterday";
  }
  return `${diffInDays} days ago`;
}
