import { useTranslation } from "@/contexts/TranslationContext";
import { Link } from "@tanstack/react-router";

function Navigation() {
  const { translate } = useTranslation();

  return (
    <nav>
      <Link to="/" className="link dashboard">
        {translate("dashboard")}
      </Link>

      <Link to="/transactions" className="link transactions">
        {translate("transactions")}
      </Link>

      <Link to="/settings" className="link settings">
        {translate("settings")}
      </Link>
    </nav>
  );
}

export default Navigation;
