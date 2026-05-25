import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-morocco-red to-morocco-green rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CH</span>
              </div>
              <span className="font-bold text-white text-lg">CentreHub Morocco</span>
            </div>
            <p className="text-sm text-gray-400">
              Discover and enroll in the best educational centers across Morocco.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/centers" className="hover:text-white transition-colors">Centers</Link></li>
              <li><Link to="/courses" className="hover:text-white transition-colors">Courses</Link></li>
              <li><Link to="/teachers" className="hover:text-white transition-colors">Teachers</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">For Partners</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/register" className="hover:text-white transition-colors">Register Center</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Become a Teacher</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="mailto:support@centrehub.ma" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} CentreHub Morocco. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
