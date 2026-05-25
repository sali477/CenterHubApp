import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiStar, FiMapPin, FiCheckCircle } from 'react-icons/fi';
import { formatPrice } from '../../utils/helpers';

const CenterCard = ({ center, index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={`/centers/${center._id}`} className="card block hover:shadow-md transition-shadow group">
        <div className="relative h-40 bg-gradient-to-br from-primary-500 to-primary-700">
          {center.coverImage ? (
            <img src={center.coverImage} alt={center.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-white text-4xl font-bold opacity-50">
                {center.name?.charAt(0)}
              </span>
            </div>
          )}
          {center.isVerified && (
            <span className="absolute top-3 right-3 badge-verified flex items-center gap-1">
              <FiCheckCircle /> Verified
            </span>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-start gap-3">
            {center.logo ? (
              <img src={center.logo} alt="" className="w-10 h-10 rounded-lg object-cover -mt-8 border-2 border-white shadow" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-primary-100 -mt-8 border-2 border-white shadow flex items-center justify-center text-primary-600 font-bold">
                {center.name?.charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                {center.name}
              </h3>
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                <FiMapPin className="flex-shrink-0" />
                <span className="truncate">{center.address?.city || 'Morocco'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1">
              <FiStar className="text-yellow-400 fill-yellow-400" />
              <span className="font-medium text-sm">{center.rating?.toFixed(1) || '0.0'}</span>
              <span className="text-gray-400 text-sm">({center.numReviews || 0})</span>
            </div>
            <span className="text-sm font-medium text-primary-600">
              {center.priceRange?.min > 0
                ? `${formatPrice(center.priceRange.min)}+`
                : 'View courses'}
            </span>
          </div>

          {center.subjects?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {center.subjects.slice(0, 3).map((subject) => (
                <span key={subject} className="badge bg-gray-100 text-gray-600">
                  {subject}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default CenterCard;
