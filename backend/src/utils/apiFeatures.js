export class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search', 'lat', 'lng', 'radius', 'distance', 'rating', 'price', 'subject', 'popularity'];
    excludedFields.forEach((field) => delete queryObj[field]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  search(searchFields = ['name', 'description']) {
    if (this.queryString.search) {
      const searchRegex = { $regex: this.queryString.search, $options: 'i' };
      const orConditions = searchFields.map((field) => ({ [field]: searchRegex }));
      this.query = this.query.find({ $or: orConditions });
    }
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    this.page = page;
    this.limit = limit;
    return this;
  }

  nearLocation(lat, lng, radiusKm = 50) {
    if (lat && lng) {
      this.query = this.query.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(lng), parseFloat(lat)],
            },
            $maxDistance: radiusKm * 1000,
          },
        },
      });
    }
    return this;
  }
}

export default APIFeatures;
