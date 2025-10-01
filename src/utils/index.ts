import type { Currency, DateAndTime, Locale } from "../types";

export function formatCurrency(
  amount: number,
  locale: Locale,
  currency: Currency
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(amount);
}

export function formatDateAndTime(
  date: Date,
  locale: Locale
): DateAndTime | string {
  const formattedDate = new Intl.DateTimeFormat(locale, {
    dateStyle: "short",
  }).format(date);
  const formattedTime = new Intl.DateTimeFormat(locale, {
    timeStyle: "short",
  }).format(date);

  return {
    date: formattedDate,
    time: formattedTime,
  };
}

// export function capitalizeFirstWord(text: string) {
//   return text.charAt(0).toUpperCase() + text.slice(1);
// }

// export function saveToLocalStorage(key: string, value: object): void {
//   localStorage.setItem(key, JSON.stringify(value));
//   console.log("Data saved!");
// }

// export function loadFromLocalStorage(key: string) {
//   const data = localStorage.getItem(key);
//   if (data) {
//     const parsedData = JSON.parse(data);
//     console.log(`Saved data loaded!`);
//     return parsedData;
//   } else {
//     console.log("No saved data found!");
//     return undefined;
//   }
// }

// export function removeFromLocalStorage(key: string) {
//   localStorage.removeItem(key);
//   console.log("Saved data cleared!");
// }
