import mongoose from 'mongoose';

const centerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Center name is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    logo: {
      type: String,
      default: '',
    },
    coverImage: {
      type: String,
      default: '',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'Morocco' },
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    phone: String,
    email: String,
    website: String,
    subjects: [String],
    priceRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    teachers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
      },
    ],
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    invitationCode: {
      type: String,
      unique: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    popularity: {
      type: Number,
      default: 0,
    },
    revenue: {
      type: Number,
      default: 0,
    },
    openingHours: [
      {
        day: String,
        open: String,
        close: String,
      },
    ],
  },
  { timestamps: true }
);

centerSchema.index({ location: '2dsphere' });
centerSchema.index({ name: 'text', description: 'text', subjects: 'text' });

centerSchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

const Center = mongoose.model('Center', centerSchema);
export default Center;
