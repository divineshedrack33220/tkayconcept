const Category = require('../models/Category');
const { calculatePagination } = require('../utils/helpers');

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ parent: null, isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .populate('children');

    res.json({ data: categories });
  } catch (error) {
    next(error);
  }
};

exports.getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug }).populate('children');
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json({ data: category });
  } catch (error) {
    next(error);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const { name, description, image, parent, sortOrder, seoTitle, seoDescription } = req.body;

    const existing = await Category.findOne({ name });
    if (existing) {
      return res.status(409).json({ message: 'Category with this name already exists' });
    }

    if (parent) {
      const parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        return res.status(400).json({ message: 'Parent category not found' });
      }
    }

    const category = await Category.create({
      name,
      description,
      image,
      parent: parent || null,
      sortOrder: sortOrder || 0,
      seoTitle,
      seoDescription,
    });

    res.status(201).json({ data: category, message: 'Category created successfully' });
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const { name, description, image, parent, sortOrder, isActive, seoTitle, seoDescription } = req.body;

    if (name) {
      const existing = await Category.findOne({ name, _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(409).json({ message: 'Category with this name already exists' });
      }
    }

    if (parent && parent === req.params.id) {
      return res.status(400).json({ message: 'Category cannot be its own parent' });
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, image, parent, sortOrder, isActive, seoTitle, seoDescription },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ data: category, message: 'Category updated successfully' });
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const children = await Category.find({ parent: category._id });
    if (children.length > 0) {
      return res.status(400).json({ message: 'Cannot delete category with subcategories. Remove subcategories first.' });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.getAllCategoriesAdmin = async (req, res, next) => {
  try {
    const categories = await Category.find()
      .sort({ sortOrder: 1, name: 1 })
      .populate('parent', 'name');
    res.json({ data: categories });
  } catch (error) {
    next(error);
  }
};

exports.reorderCategories = async (req, res, next) => {
  try {
    const { orders } = req.body;
    if (!Array.isArray(orders)) {
      return res.status(400).json({ message: 'Orders must be an array' });
    }

    const bulkOps = orders.map(({ id, sortOrder }) => ({
      updateOne: {
        filter: { _id: id },
        update: { sortOrder },
      },
    }));

    await Category.bulkWrite(bulkOps);
    res.json({ message: 'Categories reordered successfully' });
  } catch (error) {
    next(error);
  }
};
