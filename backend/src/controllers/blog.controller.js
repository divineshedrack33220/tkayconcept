const BlogPost = require('../models/BlogPost');

const getPublishedPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 9, category, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = { status: 'published' };
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
      ];
    }

    const [posts, total] = await Promise.all([
      BlogPost.find(query)
        .select('-content')
        .populate('author', 'firstName lastName avatar')
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      BlogPost.countDocuments(query),
    ]);

    res.json({
      data: posts,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    next(error);
  }
};

const getPostBySlug = async (req, res, next) => {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug, status: 'published' })
      .populate('author', 'firstName lastName avatar');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.views += 1;
    await post.save();

    res.json({ data: post });
  } catch (error) {
    next(error);
  }
};

const getAllPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, status, category } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
      ];
    }

    const [posts, total] = await Promise.all([
      BlogPost.find(query)
        .populate('author', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      BlogPost.countDocuments(query),
    ]);

    res.json({
      data: posts,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    next(error);
  }
};

const createPost = async (req, res, next) => {
  try {
    const post = await BlogPost.create(req.body);
    res.status(201).json({ data: post });
  } catch (error) {
    next(error);
  }
};

const updatePost = async (req, res, next) => {
  try {
    const post = await BlogPost.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json({ data: post });
  } catch (error) {
    next(error);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const post = await BlogPost.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json({ message: 'Post deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublishedPosts,
  getPostBySlug,
  getAllPosts,
  createPost,
  updatePost,
  deletePost,
};
