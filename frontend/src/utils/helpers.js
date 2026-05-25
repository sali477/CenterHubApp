export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => reject(error),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
};

export const formatDistance = (km) => {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
};

export const SUBJECTS = [
  'Programming',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Languages',
  'English',
  'French',
  'Arabic',
  'Business',
  'Design',
  'Music',
  'Art',
  'Test Preparation',
];

export const ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  CENTER_OWNER: 'center_owner',
  ADMIN: 'admin',
};

export const formatPrice = (price) => {
  if (price === 0) return 'Free';
  return `${price} MAD`;
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-MA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-MA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getInitials = (name) => {
  return name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';
};

export const calculateProgress = (enrollment) => {
  return enrollment?.progress?.percentage || 0;
};
