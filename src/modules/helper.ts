export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(amount);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
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
