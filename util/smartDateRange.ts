import { isRtl } from "./knownLocales";

function _formatYearByLocale(date: Date, locale: string) {
  switch (locale) {
    case "en":
      return `${date.getFullYear()}`;
    case "ja":
    case "zh":
      // Japanese and Chinese: YYYY年
      return `${date.getFullYear()}年`;
    case "ko":
      // Korean: YYYY년
      return `${date.getFullYear()}년`;
    case "ru":
      // Russian: YYYY г.
      return `${date.getDate()} г.`;
    default:
      // Rest of the LTR world: YYYY
      return `${date.getFullYear()}`;
  }
}

function _justShowYear(date: Date) {
  return (
    date.getMonth() === 0 &&
    date.getDate() === 1 &&
    date.getHours() === 0 &&
    date.getMinutes() === 0 &&
    date.getSeconds() === 0
  );
}

function _rangeJustShowYear(startDate: Date, endDate: Date) {
  return _justShowYear(startDate) && _justShowYear(endDate);
}

export function smartDateRange(
  startDate: string,
  endDate: string | null = null,
  locale: string
) {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;

  // Options to format month and day as per locale
  const monthOptions = { month: "short" };
  const fullDateOptions = { month: "short", day: "numeric", year: "numeric" };

  // RTL strings need special hanlding in interpolation - check in order to manually override
  const localeIsRtl = isRtl(locale);

  const startMonth = start.toLocaleDateString(
    locale,
    monthOptions as Intl.DateTimeFormatOptions
  );

  // Check if start and end dates are the same day
  if (
    end &&
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate()
  ) {
    // Format as "Feb 2, 2024" (single date)
    if (localeIsRtl) {
      // LTR overrides to force interpolated order
      return `${start.getDate()} \u200E${startMonth} \u200E${start.getFullYear()}`;
    } else {
      return start.toLocaleDateString(
        locale,
        fullDateOptions as Intl.DateTimeFormatOptions
      );
    }
  }

  if (
    end &&
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth()
  ) {
    // Start and end dates are within the same month and year
    // Format as concisely as possible, exL "Feb 2 - 3, 2024", in the specified locale
    // Handle specially by locale for date ranges within same month
    if (localeIsRtl) {
      // DD-DD MMM YYYY
      // LTR overrides to force interpolated order for RTL strings
      return `${start.getDate()}-${end.getDate()} \u200E${startMonth} \u200E${start.getFullYear()}`;
    } else {
      switch (locale) {
        case "en":
          return `${startMonth} ${start.getDate()}-${end.getDate()}, ${start.getFullYear()}`;
        case "ja":
        case "zh":
          // Japanese and Chinese: YYYY年MM月DD~DD日
          return `${_formatYearByLocale(
            start,
            locale
          )}${startMonth}${start.getDate()}~${end.getDate()}日`;
        case "ko":
          // Korean: YYYY년 MM월 DD~DD일
          return `${_formatYearByLocale(
            start,
            locale
          )}년${" "}${startMonth}${start.getDate()}~${end.getDate()}일`;
        case "ru":
          return `${start.getDate()}-${end.getDate()} ${startMonth} ${_formatYearByLocale(
            start,
            locale
          )}`;
        default:
          // Rest of the LTR world: DD-DD MMM YYYY
          return `${start.getDate()}-${end.getDate()} ${startMonth} ${start.getFullYear()}`;
      }
    }
  } else if (end) {
    const endMonth = end.toLocaleDateString(
      locale,
      monthOptions as Intl.DateTimeFormatOptions
    );
    // Different month and year case
    if (localeIsRtl) {
      // RTL: LTR overrides to force interpolated order for RTL strings
      if (_rangeJustShowYear(start, end)) {
        return `\u200E${start.getFullYear()} - \u200E${end.getFullYear()}`;
      } else {
        return `${start.getDate()} \u200E${startMonth} \u200E${start.getFullYear()} - ${end.getDate()} \u200E${endMonth} \u200E${end.getFullYear()}`;
      }
    } else {
      // LTR
      if (_rangeJustShowYear(start, end)) {
        return `${_formatYearByLocale(start, locale)} - ${_formatYearByLocale(
          end,
          locale
        )}`;
      }
      return `${start.toLocaleDateString(
        locale,
        fullDateOptions as Intl.DateTimeFormatOptions
      )} - ${end.toLocaleDateString(
        locale,
        fullDateOptions as Intl.DateTimeFormatOptions
      )}`;
    }
  } else {
    // If it's Jan 1st without time, just return the year
    if (_justShowYear(start)) {
      return _formatYearByLocale(start, locale);
    }
    // Single date without an end date
    if (localeIsRtl) {
      // LTR overrides to force interpolated order for RTL strings
      return `${start.getDate()} \u200E${startMonth} \u200E${start.getFullYear()}`;
    }
    return start.toLocaleDateString(
      locale,
      fullDateOptions as Intl.DateTimeFormatOptions
    );
  }
}
