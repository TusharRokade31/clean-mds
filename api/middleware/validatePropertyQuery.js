// controllers/propertyController.js
import Property from '../models/Property.js';

export const getProperties = async (req, res) => {
  try {
    const {
      city,
      checkin,
      checkout,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 10,
      searchText,
    } = req.query;

    const query = {};

    // City filter
    if (city) {
      query['address.city'] = { $regex: city, $options: 'i' };
    }

    // Price filter
    if (minPrice !== undefined && maxPrice !== undefined) {
      query.price = { $gte: minPrice, $lte: maxPrice };
    }

    // Availability filter (example)
    if (checkin && checkout) {
      query.unavailableDates = {
        $not: {
          $elemMatch: {
            $gte: new Date(checkin),
            $lte: new Date(checkout),
          },
        },
      };
    }

    // Text search
    if (searchText) {
      query.$text = { $search: searchText };
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: order === 'asc' ? 1 : -1 };

    const properties = await Property.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Property.countDocuments(query);

    res.status(200).json({
      data: properties,
      meta: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
