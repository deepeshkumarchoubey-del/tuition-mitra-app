export const SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'Hindi',
  'Science',
  'Social Studies',
  'History',
  'Geography',
  'Computer Science',
  'Economics',
  'Accountancy',
  'Business Studies',
  'Sanskrit',
  'Environmental Studies',
  'Art & Craft',
  'Music',
  'Dance',
] as const;

export const CLASSES = [
  'Nursery',
  'LKG',
  'UKG',
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11',
  'Class 12',
] as const;

export const LANGUAGES = [
  'English',
  'Hindi',
  'Bengali',
  'Tamil',
  'Telugu',
  'Marathi',
  'Gujarati',
  'Kannada',
  'Malayalam',
  'Punjabi',
  'Urdu',
  'Odia',
  'Assamese',
] as const;

export const QUALIFICATIONS = [
  'Class 12',
  'Graduate',
  'Post Graduate',
  'PhD',
  'B.Ed',
  'D.El.Ed',
  'Diploma',
] as const;

export const GENDERS = ['Male', 'Female', 'Other'] as const;

export const REQUEST_STATUSES = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  accepted: { label: 'Accepted', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
  completed: { label: 'Completed', color: 'bg-blue-100 text-blue-800' },
} as const;