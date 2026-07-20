const Category = require('../models/Category');

exports.getCategories = async (req, res, next) => {
  try {
    const { active } = req.query;
    const filter = {};
    if (active !== undefined) filter.isActive = active === 'true';
    const categories = await Category.find(filter).sort({ sortOrder: 1 }).populate('parent', 'name slug');
    res.json({ data: categories });
  } catch (err) {
    next(err);
  }
};

exports.getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug }).populate('parent', 'name slug');
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json({ data: category });
  } catch (err) {
    next(err);
  }
};

exports.getAllCategoriesAdmin = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ sortOrder: 1 }).populate('parent', 'name slug');
    res.json({ data: categories });
  } catch (err) {
    next(err);
  }
};

exports.reorderCategories = async (req, res, next) => {
  try {
    const { updates } = req.body;
    if (!Array.isArray(updates)) {
      return res.status(400).json({ error: 'Updates must be an array' });
    }

    const bulkOps = updates.map(({ id, sortOrder }) => ({
      updateOne: {
        filter: { _id: id },
        update: { sortOrder },
      },
    }));

    await Category.bulkWrite(bulkOps);
    res.json({ message: 'Categories reordered' });
  } catch (err) {
    next(err);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json({ data: category });
  } catch (err) {
    next(err);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json({ data: category });
  } catch (err) {
    next(err);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
};
