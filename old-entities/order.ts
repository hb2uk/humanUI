import { z } from 'zod';

// Order item schema
export const orderItemSchema = z.object({
  id: z.string().optional(),
  productId: z.string().min(1, 'Product ID is required'),
  productName: z.string().min(1, 'Product name is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().positive('Unit price must be positive'),
  totalPrice: z.number().positive('Total price must be positive'),
  customizations: z.array(z.object({
    type: z.string(),
    name: z.string(),
    price: z.number(),
  })).default([]),
  notes: z.string().optional(),
});

// Order schema
export const orderSchema = z.object({
  id: z.string().optional(),
  orderNumber: z.string().min(1, 'Order number is required'),
  customerId: z.string().min(1, 'Customer ID is required'),
  customerName: z.string().min(1, 'Customer name is required'),
  customerPhone: z.string().optional(),
  customerEmail: z.string().email('Invalid email').optional(),
  status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled']).default('pending'),
  orderType: z.enum(['pickup', 'delivery']).default('pickup'),
  items: z.array(orderItemSchema).min(1, 'Order must have at least one item'),
  subtotal: z.number().positive('Subtotal must be positive'),
  discount: z.number().min(0, 'Discount cannot be negative').default(0),
  tax: z.number().min(0, 'Tax cannot be negative').default(0),
  total: z.number().positive('Total must be positive'),
  paymentMethod: z.enum(['cash', 'promptpay', 'linepay', 'credit_card']).default('cash'),
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']).default('pending'),
  deliveryAddress: z.string().optional(),
  deliveryNotes: z.string().optional(),
  estimatedPickupTime: z.date().optional(),
  actualPickupTime: z.date().optional(),
  organizationId: z.string().min(1, 'Organization is required'),
  storeId: z.string().min(1, 'Store is required'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Create order schema (without id and timestamps)
export const createOrderSchema = orderSchema.omit({
  id: true,
  orderNumber: true,
  createdAt: true,
  updatedAt: true,
});

// Update order schema (all fields optional except id)
export const updateOrderSchema = orderSchema.partial().extend({
  id: z.string().min(1, 'Order ID is required'),
});

// Order list query schema
export const orderListQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled']).optional(),
  orderType: z.enum(['pickup', 'delivery']).optional(),
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
  customerId: z.string().optional(),
  organizationId: z.string().optional(),
  storeId: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  sortBy: z.enum(['orderNumber', 'createdAt', 'total', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Order status update schema
export const orderStatusUpdateSchema = z.object({
  id: z.string().min(1, 'Order ID is required'),
  status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled']),
  notes: z.string().optional(),
});

// Export types
export type Order = z.infer<typeof orderSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;
export type CreateOrder = z.infer<typeof createOrderSchema>;
export type UpdateOrder = z.infer<typeof updateOrderSchema>;
export type OrderListQuery = z.infer<typeof orderListQuerySchema>;
export type OrderStatusUpdate = z.infer<typeof orderStatusUpdateSchema>; 