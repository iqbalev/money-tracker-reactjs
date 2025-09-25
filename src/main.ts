import { MoneyTracker } from "./MoneyTracker";
import { UserInterface } from "./UserInterface";

const moneyTracker: MoneyTracker = new MoneyTracker();
moneyTracker
  .loadState()
  .then(() => {
    const userInterface: UserInterface = new UserInterface(moneyTracker);
    userInterface.renderUI();
  })
  .catch((e) => console.error("Failed to load data:", e));
