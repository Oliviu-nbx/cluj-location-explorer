
import { Link } from "react-router-dom";
import { CATEGORY_LABELS } from "@/types/location";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-display font-bold mb-4">Cluj Compass</h3>
            <p className="text-gray-300 mb-4">
              Your ultimate guide to exploring Cluj-Napoca, Romania. Discover the best hotels, restaurants, bars, nightclubs, and tourist attractions.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-display font-bold mb-4">Explore</h3>
            <ul className="space-y-2">
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <li key={key}>
                  <Link to={`/category/${key}`} className="text-gray-300 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-display font-bold mb-4">Contact</h3>
            <p className="text-gray-300">
              <strong>Email:</strong> info@clujcompass.ro
              <br />
              <strong>Address:</strong> Cluj-Napoca, Romania
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-gray-400 text-sm">
          <p>&copy; {year} Cluj Compass. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
