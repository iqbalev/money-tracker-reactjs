export type DateComponents = {
  day: string;
  month: string;
  year: string;
  hour: string;
  minute: string;
};

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(amount);
}

export function formatDate(
  date: Date,
  locale: string = "id-ID",
  outputStyle: "full" | "components" = "full"
): DateComponents | string {
  const formatter = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  if (outputStyle === "components") {
    const dateComponents: DateComponents = {
      day: "",
      month: "",
      year: "",
      hour: "",
      minute: "",
    };

    for (const obj of formatter.formatToParts(date)) {
      if (obj.type !== "literal") {
        dateComponents[obj.type as keyof typeof dateComponents] = obj.value;
      }
    }

    return dateComponents;
  }

  return formatter.format(date);
}

export function capitalizeFirstWord(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function saveToLocalStorage(key: string, value: object): void {
  localStorage.setItem(key, JSON.stringify(value));
  console.log("Data saved!");
}

export function loadFromLocalStorage(key: string) {
  const data = localStorage.getItem(key);
  if (data) {
    const parsedData = JSON.parse(data);
    console.log(`Saved data loaded!`);
    return parsedData;
  } else {
    console.log("No saved data found!");
    return undefined;
  }
}

export function removeFromLocalStorage(key: string) {
  localStorage.removeItem(key);
  console.log("Saved data cleared!");
}
