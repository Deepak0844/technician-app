// Services
import CustomerService from "#services/customerService.js";

// Constants
import { SuccessMessages } from "#constants/generalConstants.js";
import { HttpStatus } from "#constants/httpConstants.js";

// Middleware
import asyncHandler from "#middlewares/asyncHandler.js";

// Utils
import ResponseUtils from "#utils/responseUtils.js";

/**
 * @desc    Search customers
 * @route   GET /api/v1/customers/search
 * @access  Private
 */
export const searchCustomers = asyncHandler(async (req, res) => {
  const { q, page, pageSize } = req.query;
  const result = await CustomerService.searchCustomers(req.user._id, { q, page, pageSize });
  return ResponseUtils.success(res, result, HttpStatus.OK, SuccessMessages.CUSTOMERS_LOADED);
});

/**
 * @desc    Upsert customer (create or update by phone)
 * @route   POST /api/v1/customers/upsert
 * @access  Private
 */
export const upsertCustomer = asyncHandler(async (req, res) => {
  const customer = await CustomerService.upsertCustomer(req.user._id, req.body);
  return ResponseUtils.success(res, customer, HttpStatus.OK, SuccessMessages.CUSTOMER_CREATED);
});

/**
 * @desc    Get customer by ID
 * @route   GET /api/v1/customers/:id
 * @access  Private
 */
export const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await CustomerService.getCustomerById(req.user._id, req.params.id);
  return ResponseUtils.success(res, customer, HttpStatus.OK, SuccessMessages.CUSTOMER_LOADED);
});

/**
 * @desc    Update customer
 * @route   PATCH /api/v1/customers/:id
 * @access  Private
 */
export const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await CustomerService.updateCustomer(req.user._id, req.params.id, req.body);
  return ResponseUtils.success(res, customer, HttpStatus.OK, SuccessMessages.CUSTOMER_UPDATED);
});

/**
 * @desc    Delete customer
 * @route   DELETE /api/v1/customers/:id
 * @access  Private
 */
export const deleteCustomer = asyncHandler(async (req, res) => {
  await CustomerService.deleteCustomer(req.user._id, req.params.id);
  return ResponseUtils.success(res, null, HttpStatus.OK, SuccessMessages.CUSTOMER_DELETED);
});
