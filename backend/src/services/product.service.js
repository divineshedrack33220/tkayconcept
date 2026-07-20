const Product = require('../models/Product');
const AppError = require('../errors/AppError');

class ProductService {
  async findById(id) {
    return Product.findById(id);
  }

  async findActiveByIds(ids) {
    return Product.find({ _id: { $in: ids }, isActive: true }).lean();
  }

  async decrementStockAtomic(productId, quantity, session) {
    const result = await Product.findOneAndUpdate(
      {
        _id: productId,
        stock: { $gte: quantity },
      },
      {
        $inc: { stock: -quantity },
      },
      {
        new: true,
        ...(session ? { session } : {}),
      }
    );

    if (!result) {
      const product = await Product.findById(productId).lean();
      const name = product ? product.name : productId;
      const available = product ? product.stock : 0;
      throw new AppError(
        `Insufficient stock for ${name}. Available: ${available}`,
        400
      );
    }

    return result;
  }

  async incrementStock(productId, quantity) {
    return Product.findByIdAndUpdate(
      productId,
      { $inc: { stock: quantity } },
      { new: true }
    );
  }

  async decrementVariantStock(productId, variantName, variantValue, quantity, session) {
    const product = await Product.findById(productId);
    if (!product) throw new AppError('Product not found', 404);

    const variant = product.variants.find((v) => v.name === variantName);
    if (!variant) throw new AppError(`Variant "${variantName}" not found`, 404);

    const option = variant.options.find((o) => o.value === variantValue);
    if (!option) throw new AppError(`Variant option "${variantValue}" not found`, 404);

    if (option.stock < quantity) {
      throw new AppError(
        `Insufficient stock for ${product.name} (${variantName}: ${variantValue}). Available: ${option.stock}`,
        400
      );
    }

    option.stock -= quantity;
    await product.save(session ? { session } : {});
    return product;
  }

  async incrementVariantStock(productId, variantName, variantValue, quantity) {
    const product = await Product.findById(productId);
    if (!product) return;

    const variant = product.variants.find((v) => v.name === variantName);
    if (!variant) return;

    const option = variant.options.find((o) => o.value === variantValue);
    if (!option) return;

    option.stock += quantity;
    await product.save();
  }

  async validateStockForOrder(items, productMap) {
    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new AppError(`Product not found: ${item.productId}`, 400);
      }

      if (item.variant && Object.keys(item.variant).length > 0) {
        const variantName = Object.keys(item.variant)[0];
        const variantValue = item.variant[variantName];
        const variant = product.variants.find((v) => v.name === variantName);
        if (!variant) {
          throw new AppError(`Variant "${variantName}" not found on ${product.name}`, 400);
        }
        const option = variant.options.find((o) => o.value === variantValue);
        if (!option) {
          throw new AppError(`Variant option "${variantValue}" not found on ${product.name}`, 400);
        }
        if (option.stock < item.quantity) {
          throw new AppError(
            `Insufficient stock for ${product.name} (${variantName}: ${variantValue}). Available: ${option.stock}`,
            400
          );
        }
      } else {
        if (product.stock < item.quantity) {
          throw new AppError(
            `Insufficient stock for ${product.name}. Available: ${product.stock}`,
            400
          );
        }
      }
    }
  }
}

module.exports = new ProductService();
