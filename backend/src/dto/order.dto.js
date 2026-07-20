class OrderDTO {
  static toResponse(order) {
    return {
      id: order._id,
      orderNumber: order.orderNumber,
      user: order.user,
      items: order.items.map((item) => ({
        product: item.product,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        variant: item.variant,
        image: item.image,
      })),
      shippingAddress: order.shippingAddress,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      tax: order.tax,
      discount: order.discount,
      total: order.total,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      trackingNumber: order.trackingNumber,
      trackingUrl: order.trackingUrl,
      carrier: order.carrier,
      notes: order.notes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  static toPaginatedResponse({ data, total, page, limit, totalPages }) {
    return {
      data: data.map((order) => this.toResponse(order)),
      total,
      page,
      limit,
      totalPages,
    };
  }
}

module.exports = OrderDTO;
