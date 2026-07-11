const BlogPost = require('../models/BlogPost');

// GET /api/blog - Public: published posts
const getPublishedPosts = async (req, res) => {
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
    console.error('Get blog posts error:', error);
    res.status(500).json({ message: 'Failed to fetch blog posts' });
  }
};

// GET /api/blog/:slug - Public: single post by slug
const getPostBySlug = async (req, res) => {
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
    console.error('Get blog post error:', error);
    res.status(500).json({ message: 'Failed to fetch blog post' });
  }
};

// GET /api/blog/admin/all - Admin: all posts
const getAllPosts = async (req, res) => {
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
    console.error('Admin get posts error:', error);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
};

// POST /api/blog/admin - Admin: create post
const createPost = async (req, res) => {
  try {
    const post = await BlogPost.create(req.body);
    res.status(201).json({ data: post });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Failed to create post' });
  }
};

// PUT /api/blog/admin/:id - Admin: update post
const updatePost = async (req, res) => {
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
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Failed to update post' });
  }
};

// DELETE /api/blog/admin/:id - Admin: delete post
const deletePost = async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json({ message: 'Post deleted' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Failed to delete post' });
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
