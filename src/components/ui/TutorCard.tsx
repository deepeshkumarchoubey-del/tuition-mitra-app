import { useState } from 'react';
import { MapPin, Star, IndianRupee, User, CheckCircle, Heart, HeartOff, Clock } from 'lucide-react';
import type { Tutor } from '../../lib/supabase';
import Badge from './Badge';

interface TutorCardProps {
  tutor: Tutor;
  onViewProfile?: (tutor: Tutor) => void;
  onSave?: (tutor: Tutor) => void;
  onRemoveSave?: (tutor: Tutor) => void;
  isSaved?: boolean;
  showActions?: boolean;
  compact?: boolean;
}

export default function TutorCard({
  tutor,
  onViewProfile,
  onSave,
  onRemoveSave,
  isSaved = false,
  showActions = true,
  compact = false,
}: TutorCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`
        bg-white rounded-2xl border border-gray-100 shadow-sm
        transition-all duration-300 overflow-hidden
        ${isHovered ? 'shadow-lg border-gray-200 -translate-y-1' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`${compact ? 'p-4' : 'p-6'}`}>
        <div className="flex items-start gap-4">
          <div className={`
            ${compact ? 'w-12 h-12' : 'w-16 h-16'}
            bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl
            flex items-center justify-center flex-shrink-0 overflow-hidden
          `}>
            {tutor.profile_photo_url ? (
              <img
                src={tutor.profile_photo_url}
                alt={tutor.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className={`${compact ? 'w-6 h-6' : 'w-8 h-8'} text-primary-600`} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`${compact ? 'text-base' : 'text-lg'} font-semibold text-gray-900 truncate`}>
                {tutor.full_name}
              </h3>
              {tutor.is_verified && (
                <Badge variant="success" size="sm" icon={<CheckCircle className="w-3 h-3" />}>
                  Verified
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-500 truncate">{tutor.qualification}</p>

            {!compact && (
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium text-gray-700">
                    {tutor.rating > 0 ? tutor.rating.toFixed(1) : 'New'}
                  </span>
                  {tutor.total_reviews > 0 && (
                    <span className="text-xs text-gray-400">({tutor.total_reviews})</span>
                  )}
                </div>
                {tutor.experience_years > 0 && (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{tutor.experience_years} yrs exp</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className={`mt-4 space-y-2 ${compact ? 'mt-3' : ''}`}>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="truncate">{tutor.location}</span>
            {!tutor.is_available && (
              <Badge variant="warning" size="sm">Unavailable</Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <IndianRupee className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span>
              Rs {tutor.monthly_fees_min.toLocaleString()} - {tutor.monthly_fees_max.toLocaleString()}/month
            </span>
          </div>
        </div>

        <div className={`mt-4 ${compact ? 'mt-3' : ''}`}>
          <div className="flex flex-wrap gap-1.5">
            {tutor.subjects.slice(0, compact ? 2 : 3).map((subject) => (
              <Badge key={subject} variant="primary" size="sm">
                {subject}
              </Badge>
            ))}
            {tutor.subjects.length > (compact ? 2 : 3) && (
              <Badge variant="secondary" size="sm">
                +{tutor.subjects.length - (compact ? 2 : 3)}
              </Badge>
            )}
          </div>
        </div>

        <div className={`mt-3 ${compact ? 'mt-2' : ''}`}>
          <p className="text-xs text-gray-500 mb-1.5">Classes</p>
          <div className="flex flex-wrap gap-1.5">
            {tutor.classes.slice(0, compact ? 2 : 4).map((cls) => (
              <span
                key={cls}
                className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
              >
                {cls}
              </span>
            ))}
            {tutor.classes.length > (compact ? 2 : 4) && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">
                +{tutor.classes.length - (compact ? 2 : 4)}
              </span>
            )}
          </div>
        </div>

        {showActions && (
          <div className={`mt-4 flex gap-2 ${compact ? 'mt-3' : ''}`}>
            <button
              onClick={() => onViewProfile?.(tutor)}
              className={`
                flex-1 ${compact ? 'py-2 text-sm' : 'py-3 text-base'}
                bg-primary-600 text-white rounded-xl font-medium
                hover:bg-primary-700 active:bg-primary-800
                transition-colors duration-200
              `}
            >
              View Profile
            </button>
            {onSave && (
              <button
                onClick={() => isSaved ? onRemoveSave?.(tutor) : onSave?.(tutor)}
                className={`
                  ${compact ? 'w-10 h-10' : 'w-12 h-12'}
                  flex items-center justify-center rounded-xl
                  border-2 transition-colors duration-200
                  ${isSaved
                    ? 'border-red-200 bg-red-50 text-red-500 hover:bg-red-100'
                    : 'border-gray-200 bg-white text-gray-400 hover:border-primary-300 hover:text-primary-500'
                  }
                `}
              >
                {isSaved ? (
                  <HeartOff className="w-5 h-5 fill-current" />
                ) : (
                  <Heart className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}