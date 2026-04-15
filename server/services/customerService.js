// Models
import mongoose from "mongoose";
import Customer from "#models/Customer.js";

// Constants
import { ErrorMessages, DefaultPagination } from "#constants/generalConstants.js";
import { HttpStatus } from "#constants/httpConstants.js";

// Utils
import { AppError } from "#utils/errorUtils.js";

/**
 * Search customers for a given user by name or phone
 */
async function searchCustomers(userId, { q = "", page = 1, pageSize = DefaultPagination.PAGE_SIZE } = {}) {
  const skip = (Number(page) - 1) * Number(pageSize);
  const query = { userId };

  if (q) {
    query.$or = [
      { name: { $regex: q, $options: "i" } },
      { phone: { $regex: q, $options: "i" } },
    ];
  }

  const [data, total] = await Promise.all([
    Customer.find(query).sort({ name: 1 }).skip(skip).limit(Number(pageSize)).lean(),
    Customer.countDocuments(query),
  ]);

  return {
    data,
    pagination: {
      total,
      page: Number(page),
      pageSize: Number(pageSize),
      hasNext: skip + data.length < total,
    },
  };
}

/**
 * Upsert customer — if phone exists for user, update; else create
 */
async function upsertCustomer(userId, { name, phone, email, locations }) {
  const customer = await Customer.findOneAndUpdate(
    { userId, phone },
    { $set: { name, email, locations } },
    { upsert: true, new: true, runValidators: true }
  );
  return customer;
}

/**
 * Get single customer by id (must belong to user)
 */
async function getCustomerById(userId, customerId) {
  const customer = await Customer.findOne({ _id: customerId, userId }).lean();
  if (!customer) throw new AppError(ErrorMessages.CUSTOMER_NOT_FOUND, HttpStatus.NOT_FOUND);
  return customer;
}

/**
 * Update customer details by ID
 */
async function updateCustomer(userId, customerId, data) {
  const customer = await Customer.findOneAndUpdate(
    { _id: customerId, userId },
    { $set: data },
    { new: true, runValidators: true }
  ).lean();
  
  if (!customer) throw new AppError(ErrorMessages.CUSTOMER_NOT_FOUND, HttpStatus.NOT_FOUND);
  return customer;
}

/**
 * Delete customer by ID - check for associated jobs first
 */
async function deleteCustomer(userId, customerId) {
  const Job = mongoose.model("Job");
  const jobCount = await Job.countDocuments({ customerId });
  if (jobCount > 0) {
    throw new AppError(`Cannot delete customer with ${jobCount} associated jobs.`, HttpStatus.BAD_REQUEST);
  }

  const customer = await Customer.findOneAndDelete({ _id: customerId, userId });
  if (!customer) throw new AppError(ErrorMessages.CUSTOMER_NOT_FOUND, HttpStatus.NOT_FOUND);
  return customer;
}

const CustomerService = {
  searchCustomers,
  upsertCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerById,
};

export default CustomerService;
