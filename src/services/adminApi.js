import axios from "@/api/axios";

class AdminService {
  // =========================
  // Customers
  // =========================

  async getAdminCustomers(params = {}) {
    try {
      const response = await axios.get("/admin/customers", { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch customers",
        error,
      };
    }
  }

  async getCustomerDetails(customerId) {
    try {
      const response = await axios.get(`/admin/customers/${customerId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch customer details",
        error,
      };
    }
  }

  async createAdminCustomer(payload) {
    try {
      const response = await axios.post('/admin/customers', payload);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create customer',
        error,
      };
    }
  }

  async updateAdminCustomer(customerId, payload) {
    try {
      const response = await axios.patch(`/admin/customers/${customerId}`, payload);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update customer',
        error,
      };
    }
  }

  async deleteAdminCustomer(customerId) {
    try {
      const response = await axios.delete(`/admin/customers/${customerId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete customer',
        error,
      };
    }
  }

  async updateCustomerStatus(customerId, status) {
    try {
      const block = status === "blocked";
      const response = await axios.patch(
        `/admin/customers/${customerId}/block?block=${block}`
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to update customer status",
        error,
      };
    }
  }

  async getUsersByStatus(status) {
    try {
      const response = await axios.get("/admin/customers", {
        params: { status },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch users by status",
        error,
      };
    }
  }

  async searchCustomers(searchQuery, params = {}) {
    try {
      const response = await axios.get("/admin/customers", {
        params: { ...params, search: searchQuery },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to search customers",
        error,
      };
    }
  }

  // =========================
  // Sellers
  // =========================

  async getAdminSellers(params = {}) {
    try {
      const response = await axios.get("/admin/sellers", { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch sellers",
        error,
      };
    }
  }

  async getSellerDetails(sellerId) {
    try {
      const response = await axios.get(`/admin/sellers/${sellerId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch seller details",
        error,
      };
    }
  }

  async createAdminSeller(payload) {
    try {
      const response = await axios.post('/admin/sellers', payload);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create seller',
        error,
      };
    }
  }

  async updateAdminSeller(sellerId, payload) {
    try {
      const response = await axios.patch(`/admin/sellers/${sellerId}`, payload);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update seller',
        error,
      };
    }
  }

  async deleteAdminSeller(sellerId) {
    try {
      const response = await axios.delete(`/admin/sellers/${sellerId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete seller',
        error,
      };
    }
  }

  async updateSellerStatus(sellerId, status) {
    try {
      const response = await axios.put(`/admin/sellers/${sellerId}/status`, {
        status,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to update seller status",
        error,
      };
    }
  }

  async approveSeller(sellerId, approve = true) {
    try {
      const response = await axios.patch(
        `/admin/sellers/${sellerId}/approve?approve=${approve}`
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to approve seller",
        error,
      };
    }
  }

  async blockSeller(sellerId, block = true) {
    try {
      const response = await axios.patch(
        `/admin/sellers/${sellerId}/block?block=${block}`
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to update seller block status",
        error,
      };
    }
  }

  async getSellersByStatus(status) {
    try {
      const response = await axios.get("/admin/sellers", {
        params: { status },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch sellers by status",
        error,
      };
    }
  }

  async searchSellers(searchQuery, params = {}) {
    try {
      const response = await axios.get("/admin/sellers", {
        params: { ...params, search: searchQuery },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to search sellers",
        error,
      };
    }
  }

  // =========================
  // Orders
  // =========================

  async getAdminOrders(params = {}) {
    try {
      const response = await axios.get("/admin/orders", { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch orders",
        error,
      };
    }
  }

  async getAdminOrder(orderId) {
    try {
      const response = await axios.get(`/admin/orders/${orderId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch order details",
        error,
      };
    }
  }

  async updateAdminOrder(orderId, orderData) {
    try {
      const response = await axios.patch(`/admin/orders/${orderId}`, orderData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update order",
        error,
      };
    }
  }

  async processAdminRefund(orderId, refundData) {
    try {
      const response = await axios.post(
        `/admin/orders/${orderId}/refund`,
        refundData
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to process refund",
        error,
      };
    }
  }

  async bulkUpdateOrders(orderIds, updateData) {
    try {
      const response = await axios.patch("/admin/orders/bulk/update", {
        order_ids: orderIds,
        ...updateData,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to bulk update orders",
        error,
      };
    }
  }

  async disputeOrder(orderId, disputeData) {
    try {
      const response = await axios.patch(
        `/admin/orders/${orderId}/dispute`,
        disputeData
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to dispute order",
        error,
      };
    }
  }

  async returnOrder(orderId, reason) {
    try {
      const response = await axios.patch(`/admin/orders/${orderId}/returned`, {
        status: "returned",
        reason,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to return order",
        error,
      };
    }
  }

  async blockOrder(orderId, block = true, reason = "") {
    try {
      const response = await axios.patch(`/admin/orders/${orderId}/block`, {
        block,
        reason,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to block/unblock order",
        error,
      };
    }
  }

  async blockOrdersBulk(orderIds, reason = "") {
    try {
      const response = await axios.patch("/admin/orders/bulk/update", {
        order_ids: orderIds,
        status: "blocked",
        reason,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to block orders",
        error,
      };
    }
  }

  async unblockOrdersBulk(orderIds, reason = "") {
    try {
      const response = await axios.patch("/admin/orders/bulk/update", {
        order_ids: orderIds,
        status: "active",
        reason,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to unblock orders",
        error,
      };
    }
  }

  // =========================
  // Products
  // =========================

  async getSellerProducts(sellerId, params = {}) {
    try {
      const response = await axios.get(`/admin/sellers/${sellerId}/products`, {
        params,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch seller products",
        error,
      };
    }
  }

  async getAllProducts(params = {}) {
    try {
      const response = await axios.get("/admin/products", { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch all products",
        error,
      };
    }
  }

  async createAdminProduct(payload) {
    try {
      const response = await axios.post('/admin/products', payload);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create product',
        error,
      };
    }
  }

  async updateAdminProduct(productId, payload) {
    try {
      const response = await axios.patch(`/admin/products/${productId}`, payload);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update product',
        error,
      };
    }
  }

  async approveProduct(productId) {
    try {
      const response = await axios.patch(
        `/admin/products/${productId}/approve`
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to approve product",
        error,
      };
    }
  }

  async rejectProduct(productId) {
    try {
      const response = await axios.patch(`/admin/products/${productId}/reject`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to reject product",
        error,
      };
    }
  }

  async blockProduct(productId, block = true) {
    try {
      const response = await axios.patch(
        `/admin/products/${productId}/block?block=${block}`
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to block product",
        error,
      };
    }
  }

  async unblockProduct(productId) {
    try {
      const response = await axios.patch(
        `/admin/products/${productId}/block?block=false`
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to unblock product",
        error,
      };
    }
  }

  async deleteProduct(productId) {
    try {
      const response = await axios.delete(`/admin/products/${productId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete product",
        error,
      };
    }
  }

  async approveProductsBulk(productIds) {
    try {
      const response = await axios.patch("/admin/products/bulk/approve", {
        ids: productIds,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to approve products",
        error,
      };
    }
  }

  async rejectProductsBulk(productIds) {
    try {
      const response = await axios.patch("/admin/products/bulk/reject", {
        ids: productIds,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to reject products",
        error,
      };
    }
  }

  async deleteProductsBulk(productIds) {
    try {
      const response = await axios.delete("/admin/products/bulk/delete", {
        data: { ids: productIds },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete products",
        error,
      };
    }
  }

  async blockProductsBulk(productIds) {
    try {
      const results = await Promise.allSettled(
        productIds.map((id) => this.blockProduct(id, true))
      );

      const successful = results.filter(
        (result) => result.status === "fulfilled" && result.value.success
      );
      const failed = results.filter(
        (result) => result.status === "rejected" || !result.value.success
      );

      return {
        success: failed.length === 0,
        data: {
          successful: successful.length,
          failed: failed.length,
          total: productIds.length,
        },
        message:
          failed.length > 0
            ? `Failed to block ${failed.length} product(s)`
            : `Successfully blocked ${successful.length} product(s)`,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to block products",
        error,
      };
    }
  }

  async unblockProductsBulk(productIds) {
    try {
      const results = await Promise.allSettled(
        productIds.map((id) => this.unblockProduct(id))
      );

      const successful = results.filter(
        (result) => result.status === "fulfilled" && result.value.success
      );
      const failed = results.filter(
        (result) => result.status === "rejected" || !result.value.success
      );

      return {
        success: failed.length === 0,
        data: {
          successful: successful.length,
          failed: failed.length,
          total: productIds.length,
        },
        message:
          failed.length > 0
            ? `Failed to unblock ${failed.length} product(s)`
            : `Successfully unblocked ${successful.length} product(s)`,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to unblock products",
        error,
      };
    }
  }

  // =========================
  // Dashboard Stats
  // =========================

  async getDashboardStats() {
    try {
      const response = await axios.get("/admin/dashboard/stats");
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch dashboard stats",
        error,
      };
    }
  }

  // =========================
  // System Backup
  // =========================

  async exportSystemBackup() {
    try {
      const response = await axios.get("/admin/system/backup/export", {
        responseType: "blob",
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to export backup",
        error,
      };
    }
  }

  // =========================
  // Categories
  // =========================

  async getSellerCategories() {
    try {
      const response = await axios.get("/admin/sellers/categories");
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch seller categories",
        error,
      };
    }
  }
}

export default new AdminService();
