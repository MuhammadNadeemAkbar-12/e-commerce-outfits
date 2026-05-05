<template>
	<div class="order-management-container">
		<!-- Enhanced Header with Glassmorphism -->
		<div class="header-section">
			<div class="header-content">
				<div class="header-left">
					<h1 class="main-title">
						<q-icon name="inventory" class="title-icon" />
						Order Management
					</h1>
					<p class="subtitle">
						Track, manage and fulfill customer orders with ease
					</p>

					<!-- Statistics Cards -->
					<div class="stats-grid">
						<div class="stat-card">
							<div class="stat-number">{{ totalOrders }}</div>
							<div class="stat-label">Total Orders</div>
						</div>
						<div
							class="stat-card"
							v-for="stat in statusCounts"
							:key="stat.status">
							<div
								class="stat-number"
								:style="{ color: getStatusColor(stat.status) }">
								{{ stat.count }}
							</div>
							<div class="stat-label">{{ stat.statusLabel }}</div>
						</div>
					</div>
				</div>

				<div class="header-actions">
					<q-btn-group flat class="action-group">
						<q-btn
							flat
							icon="refresh"
							@click="fetchOrders()"
							:loading="loading"
							class="action-btn">
							<q-tooltip>Refresh Orders</q-tooltip>
						</q-btn>
						<q-btn flat icon="download" @click="exportCSV" class="action-btn">
							<q-tooltip>Export CSV</q-tooltip>
						</q-btn>
						<q-btn
							flat
							icon="filter_list"
							@click="showFilters = !showFilters"
							class="action-btn">
							<q-tooltip>Toggle Filters</q-tooltip>
						</q-btn>
					</q-btn-group>
				</div>
			</div>
		</div>

		<!-- Enhanced Search and Filters -->
		<q-slide-transition>
			<div v-show="showFilters || search" class="filters-section">
				<div class="filters-container">
					<div class="search-container">
						<q-input
							v-model="search"
							placeholder="Search orders, customers, or order numbers..."
							outlined
							dense
							debounce="300"
							clearable
							@update:model-value="onSearch"
							class="search-input">
							<template v-slot:prepend>
								<q-icon name="search" />
							</template>
						</q-input>
					</div>

					<div class="filter-controls">
						<q-select
							v-model="statusFilter"
							:options="['All', ...statusOptions]"
							label="Filter by Status"
							outlined
							dense
							clearable
							@update:model-value="onFilter"
							class="filter-select">
							<template v-slot:prepend>
								<q-icon name="tune" />
							</template>
						</q-select>

						<q-select
							v-model="sortBy"
							:options="sortOptions"
							label="Sort Orders"
							outlined
							dense
							@update:model-value="onSort"
							class="filter-select">
							<template v-slot:prepend>
								<q-icon name="sort" />
							</template>
						</q-select>

						<q-select
							v-model="dateRange"
							:options="dateRangeOptions"
							label="Date Range"
							outlined
							dense
							clearable
							@update:model-value="onDateFilter"
							class="filter-select">
							<template v-slot:prepend>
								<q-icon name="date_range" />
							</template>
						</q-select>
					</div>
				</div>
			</div>
		</q-slide-transition>

		<!-- Enhanced Orders Table/Cards -->
		<div class="orders-section">
			<!-- Desktop Table View -->
			<q-card class="orders-table-card desktop-only" flat>
				<q-table
					:rows="pagedOrders"
					:columns="enhancedColumns"
					:loading="loading"
					:pagination="pagination"
					@request="onRequest"
					row-key="id"
					flat
					:rows-per-page-options="[10, 25, 50]"
					:no-data-label="noDataLabel"
					:no-results-label="noResultsLabel"
					class="orders-table">
					<template v-slot:body-cell-order_info="props">
						<q-td :props="props">
							<div class="order-info-cell">
								<div class="order-number">{{ props.row.order_number }}</div>
								<div class="order-date">
									{{ formatDate(props.row.created_at) }}
								</div>
							</div>
						</q-td>
					</template>

					<template v-slot:body-cell-customer="props">
						<q-td :props="props">
							<div class="customer-info">
								<q-avatar
									size="40px"
									:style="{ background: avatarGradient(props.row.customer) }"
									text-color="white"
									class="customer-avatar">
									{{ initials(props.row.customer) }}
								</q-avatar>
								<div class="customer-details">
									<div class="customer-name">{{ props.row.customer }}</div>
									<div class="customer-email">
										{{ props.row.raw?.user?.email }}
									</div>
								</div>
							</div>
						</q-td>
					</template>

					<template v-slot:body-cell-items="props">
						<q-td :props="props">
							<div class="items-preview">
								<div class="items-images">
									<div
										v-for="(item, i) in (props.row.items || []).slice(0, 3)"
										:key="i"
										class="item-image"
										:style="{ zIndex: 3 - i }">
										<q-avatar size="32px" class="product-thumb">
											<img
												:src="resolveImageUrl(item.image)"
												:alt="item.product_name" />
										</q-avatar>
									</div>
								</div>
								<div class="items-info">
									<div class="items-count">
										{{ (props.row.items || []).length }} items
									</div>
									<div class="items-value">
										${{ formatPrice(props.row.amount) }}
									</div>
								</div>
							</div>
						</q-td>
					</template>

					<template v-slot:body-cell-status="props">
						<q-td :props="props">
							<q-chip
								:color="getStatusColor(props.row.status)"
								text-color="white"
								:label="props.row.status.toUpperCase()"
								size="sm"
								class="status-chip" />
						</q-td>
					</template>

					<template v-slot:body-cell-actions="props">
						<q-td :props="props">
							<div class="action-buttons">
								<q-btn
									round
									flat
									size="sm"
									color="primary"
									icon="visibility"
									@click="openOrder(props.row)"
									class="action-btn">
									<q-tooltip>View Details</q-tooltip>
								</q-btn>

								<q-btn-dropdown
									round
									flat
									size="sm"
									icon="more_vert"
									class="action-btn">
									<q-list dense>
										<q-item
											v-if="props.row.status === 'processing'"
											clickable
											@click="confirmShip(props.row)">
											<q-item-section avatar>
												<q-icon name="local_shipping" color="blue" />
											</q-item-section>
											<q-item-section>Mark as Shipped</q-item-section>
										</q-item>

										<q-item
											v-if="
												['processing', 'shipped'].includes(props.row.status)
											"
											clickable
											@click="confirmCancel(props.row)">
											<q-item-section avatar>
												<q-icon name="cancel" color="negative" />
											</q-item-section>
											<q-item-section>Cancel Order</q-item-section>
										</q-item>

										<q-item
											v-if="props.row.status === 'delivered'"
											clickable
											@click="confirmReturn(props.row)">
											<q-item-section avatar>
												<q-icon name="assignment_return" color="orange" />
											</q-item-section>
											<q-item-section>Process Return</q-item-section>
										</q-item>

										<q-separator />

										<q-item clickable @click="copyOrderNumber(props.row)">
											<q-item-section avatar>
												<q-icon name="content_copy" />
											</q-item-section>
											<q-item-section>Copy Order #</q-item-section>
										</q-item>
									</q-list>
								</q-btn-dropdown>
							</div>
						</q-td>
					</template>
				</q-table>
			</q-card>

			<!-- Mobile Cards View -->
			<div class="mobile-orders mobile-only">
				<q-card
					v-for="order in pagedOrders"
					:key="order.id"
					class="order-card"
					@click="openOrder(order)">
					<q-card-section class="order-card-header">
						<div class="order-main-info">
							<div class="order-number-mobile">{{ order.order_number }}</div>
							<q-chip
								:color="getStatusColor(order.status)"
								text-color="white"
								:label="order.status.toUpperCase()"
								size="sm" />
						</div>
						<div class="order-amount-mobile">
							${{ formatPrice(order.amount) }}
						</div>
					</q-card-section>

					<q-separator />

					<q-card-section class="order-card-body">
						<div class="customer-row-mobile">
							<q-avatar
								size="36px"
								:style="{ background: avatarGradient(order.customer) }"
								text-color="white">
								{{ initials(order.customer) }}
							</q-avatar>
							<div class="customer-info-mobile">
								<div class="customer-name-mobile">{{ order.customer }}</div>
								<div class="customer-email-mobile">
									{{ order.raw?.user?.email }}
								</div>
							</div>
						</div>

						<div class="order-meta-mobile">
							<div class="meta-item">
								<q-icon name="schedule" size="16px" />
								<span>{{ formatDate(order.created_at) }}</span>
							</div>
							<div class="meta-item">
								<q-icon name="inventory_2" size="16px" />
								<span>{{ (order.items || []).length }} items</span>
							</div>
						</div>
					</q-card-section>

					<q-card-actions class="order-card-actions">
						<q-btn
							flat
							color="primary"
							size="sm"
							@click.stop="openOrder(order)">
							View Details
						</q-btn>
						<q-space />
						<q-btn
							v-if="order.status === 'processing'"
							flat
							color="blue"
							size="sm"
							@click.stop="confirmShip(order)">
							Ship
						</q-btn>
						<q-btn
							v-if="['processing', 'shipped'].includes(order.status)"
							flat
							color="negative"
							size="sm"
							@click.stop="confirmCancel(order)">
							Cancel
						</q-btn>
					</q-card-actions>
				</q-card>
			</div>

			<!-- Enhanced Pagination -->
			<div class="pagination-section">
				<q-pagination
					v-model="pagination.page"
					:max="maxPage"
					:max-pages="6"
					color="primary"
					size="md"
					class="pagination-control" />
			</div>
		</div>

		<!-- Enhanced Order Details Drawer -->
		<q-drawer v-model="drawer" side="right" :width="600" class="order-drawer">
			<div class="drawer-header">
				<div class="drawer-title-section">
					<q-avatar
						size="56px"
						:style="{ background: avatarGradient(selectedOrder?.customer) }"
						text-color="white"
						v-if="selectedOrder">
						{{ initials(selectedOrder.customer) }}
					</q-avatar>
					<div class="drawer-title-info" v-if="selectedOrder">
						<h3 class="drawer-title">{{ selectedOrder.order_number }}</h3>
						<p class="drawer-subtitle">{{ selectedOrder.customer }}</p>
						<q-chip
							:color="getStatusColor(selectedOrder.status)"
							text-color="white"
							:label="selectedOrder.status.toUpperCase()"
							size="md" />
					</div>
				</div>

				<div class="drawer-actions">
					<q-btn
						round
						flat
						icon="refresh"
						@click="fetchOrderDetails(selectedOrder?.id)"
						:loading="loading" />
					<q-btn round flat icon="close" @click="drawer = false" />
				</div>
			</div>

			<q-scroll-area style="height: calc(100vh - 120px)">
				<div class="drawer-content" v-if="selectedOrder">
					<!-- Order Summary -->
					<div class="detail-section">
						<h4 class="section-title">
							<q-icon name="receipt" />
							Order Summary
						</h4>
						<div class="summary-grid">
							<div class="summary-item">
								<span class="summary-label">Subtotal</span>
								<span class="summary-value"
									>${{ formatPrice(selectedOrder.raw?.subtotal) }}</span
								>
							</div>
							<div class="summary-item">
								<span class="summary-label">Shipping</span>
								<span class="summary-value"
									>${{ formatPrice(selectedOrder.raw?.shipping) }}</span
								>
							</div>
							<div class="summary-item">
								<span class="summary-label">Tax</span>
								<span class="summary-value"
									>${{ formatPrice(selectedOrder.raw?.tax) }}</span
								>
							</div>
							<div class="summary-item total-row">
								<span class="summary-label">Total</span>
								<span class="summary-value total-amount"
									>${{ formatPrice(selectedOrder.amount) }}</span
								>
							</div>
						</div>
					</div>

					<!-- Customer Information -->
					<div class="detail-section">
						<h4 class="section-title">
							<q-icon name="person" />
							Customer Information
						</h4>
						<div class="customer-detail-card">
							<div class="customer-detail-row">
								<span class="detail-label">Name</span>
								<span class="detail-value">{{ selectedOrder.customer }}</span>
							</div>
							<div class="customer-detail-row">
								<span class="detail-label">Email</span>
								<span class="detail-value">{{
									selectedOrder.raw?.user?.email
								}}</span>
							</div>
							<div class="customer-detail-row">
								<span class="detail-label">Phone</span>
								<span class="detail-value">{{
									extractPhone(selectedOrder.raw?.shipping_address)
								}}</span>
							</div>
						</div>
					</div>

					<!-- Shipping Address -->
					<div class="detail-section">
						<h4 class="section-title">
							<q-icon name="location_on" />
							Shipping Address
						</h4>
						<div class="address-card">
							{{ formatAddress(selectedOrder.raw?.shipping_address) }}
						</div>
					</div>

					<!-- Items -->
					<div class="detail-section">
						<h4 class="section-title">
							<q-icon name="inventory_2" />
							Order Items
						</h4>
						<div class="items-list">
							<div
								v-for="(item, idx) in selectedOrder.items"
								:key="idx"
								class="item-card">
								<q-avatar size="56px" class="item-image">
									<img
										:src="resolveImageUrl(item.image)"
										:alt="item.product_name" />
								</q-avatar>
								<div class="item-details">
									<div class="item-name">
										{{ item.product_name || item.name }}
									</div>
									<div class="item-meta">
										<span class="item-price">${{ item.price }}</span>
										<span class="item-separator">×</span>
										<span class="item-quantity">{{ item.quantity }}</span>
									</div>
								</div>
								<div class="item-total">
									${{
										formatPrice(
											Number(item.total || item.price * item.quantity)
										)
									}}
								</div>
							</div>
						</div>
					</div>

					<!-- Order Timeline -->
					<div class="detail-section">
						<h4 class="section-title">
							<q-icon name="timeline" />
							Order Timeline
						</h4>
						<q-timeline dense class="order-timeline">
							<q-timeline-entry
								v-for="(event, i) in selectedOrder.timeline"
								:key="i"
								:title="event.title.toUpperCase()"
								:subtitle="formatDateTime(event.time)"
								:icon="getTimelineIcon(event.title)"
								:color="getStatusColor(event.title)">
								<div class="timeline-desc">
									{{ event.desc || getStatusDescription(event.title) }}
								</div>
							</q-timeline-entry>
						</q-timeline>
					</div>

					<!-- Action Buttons -->
					<div class="drawer-footer-actions">
						<q-btn
							v-if="selectedOrder.status === 'processing'"
							unelevated
							color="primary"
							icon="local_shipping"
							label="Mark as Shipped"
							@click="confirmShip(selectedOrder)"
							class="action-button" />

						<q-btn
							v-if="['processing', 'shipped'].includes(selectedOrder.status)"
							unelevated
							color="negative"
							icon="cancel"
							label="Cancel Order"
							@click="confirmCancel(selectedOrder)"
							class="action-button" />

						<q-btn
							v-if="selectedOrder.status === 'delivered'"
							unelevated
							color="orange"
							icon="assignment_return"
							label="Process Return"
							@click="confirmReturn(selectedOrder)"
							class="action-button" />
					</div>
				</div>
			</q-scroll-area>
		</q-drawer>

		<!-- Enhanced Confirmation Dialog -->
		<q-dialog v-model="confirmDialog.show">
			<q-card class="confirm-dialog-card">
				<q-card-section class="confirm-header">
					<q-icon
						:name="confirmDialog.icon"
						:color="confirmDialog.actionColor"
						size="48px" />
					<h3 class="confirm-title">{{ confirmDialog.title }}</h3>
				</q-card-section>

				<q-card-section>
					<p class="confirm-message">{{ confirmDialog.message }}</p>
				</q-card-section>

				<q-card-actions class="confirm-actions">
					<q-btn
						flat
						label="Cancel"
						color="grey-7"
						v-close-popup
						class="cancel-btn" />
					<q-btn
						unelevated
						:label="confirmDialog.actionLabel"
						:color="confirmDialog.actionColor"
						:icon="confirmDialog.icon"
						@click="confirmDialog.action && confirmDialog.action()"
						v-close-popup
						class="confirm-btn" />
				</q-card-actions>
			</q-card>
		</q-dialog>
	</div>
</template>

<script setup>
	import { ref, computed, watch, onMounted } from "vue";
	import { useQuasar } from "quasar";
	import axios from "@/api/axios";

	// State
	const $q = useQuasar();
	const loading = ref(false);
	const orders = ref([]);
	const search = ref("");
	const statusFilter = ref(null);
	const sortBy = ref("Newest");
	const dateRange = ref(null);
	const showFilters = ref(false);
	const selected = ref([]);
	const drawer = ref(false);
	const selectedOrder = ref(null);

	const pagination = ref({
		page: 1,
		rowsPerPage: 10,
		sortBy: "created_at",
		descending: true,
	});

	// Enhanced columns for desktop table
	const enhancedColumns = [
		{
			name: "order_info",
			label: "Order",
			field: "order_number",
			sortable: true,
			align: "left",
		},
		{
			name: "customer",
			label: "Customer",
			field: "customer",
			sortable: true,
			align: "left",
		},
		{
			name: "items",
			label: "Items",
			field: "items",
			sortable: false,
			align: "left",
		},
		{
			name: "status",
			label: "Status",
			field: "status",
			sortable: true,
			align: "center",
		},
		{
			name: "actions",
			label: "Actions",
			field: "actions",
			align: "center",
		},
	];

	const statusOptions = [
		"pending",
		"processing",
		"shipped",
		"delivered",
		"cancelled",
		"returned",
		"disputed",
		"refunded",
	];

	const sortOptions = [
		"Newest",
		"Oldest",
		"Amount (High-Low)",
		"Amount (Low-High)",
	];

	const dateRangeOptions = [
		"Today",
		"Yesterday",
		"Last 7 days",
		"Last 30 days",
		"Last 90 days",
	];

	const noDataLabel =
		"No orders found. Orders will appear here once customers place them.";
	const noResultsLabel =
		"No orders match your current search and filter criteria.";

	// Image handling
	const placeholderImage = "https://cdn.quasar.dev/img/boy-avatar.png";

	function resolveImageUrl(url) {
		if (!url || typeof url !== "string") return placeholderImage;

		const cleanUrl = url.trim();
		if (!cleanUrl) return placeholderImage;

		if (/^https?:\/\//i.test(cleanUrl)) return cleanUrl;

		const baseUrl = "http://13.60.188.147/";
		const cleanPath = cleanUrl.replace(/^\/+/, "");

		if (/^(storage|uploads|public|images?)\//i.test(cleanPath)) {
			return baseUrl + cleanPath;
		}

		return baseUrl + "storage/" + cleanPath;
	}

	// Order mapping function
	function mapOrderForTable(order) {
		return {
			id: order.id,
			order_number: order.order_number,
			customer: order.user?.name || order.user?.email || "Anonymous Customer",
			amount: Number(order.total || order.subtotal || 0),
			status: order.status,
			created_at: order.created_at,
			placed: order.created_at
				? new Date(order.created_at).toLocaleString()
				: "",
			items: order.items || [],
			timeline: (order.meta?.admin_updates || []).map((update, index) => ({
				title: update.status,
				time: update.changed_at,
				desc: `Order status changed to ${update.status}`,
				icon: getTimelineIcon(update.status),
				color: getStatusColor(update.status),
			})),
			raw: order,
		};
	}

	// API Functions
	async function fetchOrders(page = 1) {
		loading.value = true;
		try {
			const response = await axios.get(`/seller/orders?page=${page}`);
			if (response?.data?.success && response.data.data) {
				const payload = response.data.data;
				const ordersList = Array.isArray(payload)
					? payload
					: payload.data || [];
				orders.value = ordersList.map(mapOrderForTable);

				if (!Array.isArray(payload)) {
					pagination.value.page = payload.current_page || page;
					pagination.value.rowsPerPage =
						payload.per_page || pagination.value.rowsPerPage;
				}
			} else {
				orders.value = [];
				$q.notify({
					type: "negative",
					message: response?.data?.message || "Failed to load orders",
				});
			}
		} catch (error) {
			$q.notify({
				type: "negative",
				message:
					error?.response?.data?.message ||
					"Network error while fetching orders",
			});
		} finally {
			loading.value = false;
		}
	}

	async function fetchOrderDetails(id) {
		if (!id) return;

		loading.value = true;
		try {
			const response = await axios.get(`/seller/orders/${id}`);
			if (response?.data?.success && response.data.data) {
				selectedOrder.value = mapOrderForTable(response.data.data);
				drawer.value = true;
			} else {
				$q.notify({
					type: "negative",
					message: response?.data?.message || "Failed to load order details",
				});
			}
		} catch (error) {
			$q.notify({
				type: "negative",
				message:
					error?.response?.data?.message ||
					"Network error while fetching order details",
			});
		} finally {
			loading.value = false;
		}
	}

	async function updateOrderStatus(orderId, status) {
		loading.value = true;
		try {
			const response = await axios.patch(`/seller/orders/${orderId}/status`, {
				status,
			});
			if (response?.data?.success) {
				await fetchOrders(pagination.value.page);
				if (selectedOrder.value && selectedOrder.value.id === orderId) {
					await fetchOrderDetails(orderId);
				}
				$q.notify({
					type: "positive",
					message: `Order successfully updated to ${status}`,
				});
			} else {
				$q.notify({
					type: "negative",
					message: response?.data?.message || "Failed to update order status",
				});
			}
		} catch (error) {
			$q.notify({
				type: "negative",
				message:
					error?.response?.data?.message ||
					"Network error while updating order",
			});
		} finally {
			loading.value = false;
		}
	}

	async function returnOrderApi(orderId) {
		loading.value = true;
		try {
			const response = await axios.patch(`/seller/orders/${orderId}/return`);
			if (response?.data?.success) {
				await fetchOrders(pagination.value.page);
				if (selectedOrder.value && selectedOrder.value.id === orderId) {
					await fetchOrderDetails(orderId);
				}
				$q.notify({
					type: "positive",
					message: "Order successfully marked as returned",
				});
			} else {
				$q.notify({
					type: "negative",
					message: response?.data?.message || "Failed to process return",
				});
			}
		} catch (error) {
			$q.notify({
				type: "negative",
				message:
					error?.response?.data?.message ||
					"Network error while processing return",
			});
		} finally {
			loading.value = false;
		}
	}

	// UI Helper Functions
	function getStatusColor(status) {
		const colors = {
			pending: "#f59e0b",
			processing: "#3b82f6",
			shipped: "#8b5cf6",
			delivered: "#10b981",
			cancelled: "#ef4444",
			returned: "#f97316",
			disputed: "#dc2626",
			refunded: "#06b6d4",
		};
		return colors[status] || "#6b7280";
	}

	function getTimelineIcon(status) {
		const icons = {
			pending: "schedule",
			processing: "hourglass_empty",
			shipped: "local_shipping",
			delivered: "check_circle",
			cancelled: "cancel",
			returned: "assignment_return",
			disputed: "report_problem",
			refunded: "money_off",
		};
		return icons[status] || "circle";
	}

	function getStatusDescription(status) {
		const descriptions = {
			pending: "Order received and awaiting processing",
			processing: "Order is being prepared for shipment",
			shipped: "Order has been shipped to customer",
			delivered: "Order successfully delivered to customer",
			cancelled: "Order was cancelled",
			returned: "Customer returned the order",
			disputed: "Order is under dispute review",
			refunded: "Order amount has been refunded",
		};
		return descriptions[status] || "Status updated";
	}

	function avatarGradient(name) {
		if (!name) return "linear-gradient(45deg, #6b7280, #9ca3af)";

		const gradients = [
			"linear-gradient(45deg, #ef4444, #f97316)",
			"linear-gradient(45deg, #3b82f6, #8b5cf6)",
			"linear-gradient(45deg, #10b981, #06b6d4)",
			"linear-gradient(45deg, #f59e0b, #eab308)",
			"linear-gradient(45deg, #ec4899, #f43f5e)",
			"linear-gradient(45deg, #8b5cf6, #a855f7)",
		];

		return gradients[name.charCodeAt(0) % gradients.length];
	}

	function initials(name) {
		if (!name) return "U";
		return name
			.split(" ")
			.map((n) => n[0])
			.slice(0, 2)
			.join("")
			.toUpperCase();
	}

	function formatPrice(value) {
		return Number(value || 0).toLocaleString(undefined, {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		});
	}

	function formatDate(dateString) {
		if (!dateString) return "N/A";
		return new Date(dateString).toLocaleDateString();
	}

	function formatDateTime(dateString) {
		if (!dateString) return "N/A";
		return new Date(dateString).toLocaleString();
	}

	function formatAddress(address) {
		if (!address) return "No address provided";

		if (Array.isArray(address)) {
			return address.filter(Boolean).join(", ");
		}

		if (typeof address === "object") {
			return [address.line1, address.city, address.postal_code, address.country]
				.filter(Boolean)
				.join(", ");
		}

		return String(address);
	}

	function extractPhone(address) {
		if (!address) return "N/A";

		if (Array.isArray(address)) {
			const phoneEntry = address.find(
				(item) => typeof item === "string" && item.includes("Phone:")
			);
			return phoneEntry ? phoneEntry.replace("Phone:", "").trim() : "N/A";
		}

		return address.phone || "N/A";
	}

	// Filtering and Sorting
	const filteredOrders = computed(() => {
		let result = [...orders.value];

		// Search filter
		if (search.value) {
			const searchTerm = search.value.toLowerCase();
			result = result.filter(
				(order) =>
					(order.order_number || "").toLowerCase().includes(searchTerm) ||
					(order.customer || "").toLowerCase().includes(searchTerm) ||
					(order.raw?.user?.email || "").toLowerCase().includes(searchTerm)
			);
		}

		// Status filter
		if (statusFilter.value && statusFilter.value !== "All") {
			result = result.filter((order) => order.status === statusFilter.value);
		}

		// Date range filter
		if (dateRange.value) {
			const now = new Date();
			const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

			result = result.filter((order) => {
				if (!order.created_at) return false;
				const orderDate = new Date(order.created_at);

				switch (dateRange.value) {
					case "Today":
						return orderDate >= today;
					case "Yesterday":
						const yesterday = new Date(today);
						yesterday.setDate(yesterday.getDate() - 1);
						return orderDate >= yesterday && orderDate < today;
					case "Last 7 days":
						const week = new Date(today);
						week.setDate(week.getDate() - 7);
						return orderDate >= week;
					case "Last 30 days":
						const month = new Date(today);
						month.setDate(month.getDate() - 30);
						return orderDate >= month;
					case "Last 90 days":
						const quarter = new Date(today);
						quarter.setDate(quarter.getDate() - 90);
						return orderDate >= quarter;
					default:
						return true;
				}
			});
		}

		// Sorting
		switch (sortBy.value) {
			case "Oldest":
				result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
				break;
			case "Amount (High-Low)":
				result.sort((a, b) => (b.amount || 0) - (a.amount || 0));
				break;
			case "Amount (Low-High)":
				result.sort((a, b) => (a.amount || 0) - (b.amount || 0));
				break;
			case "Newest":
			default:
				result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
				break;
		}

		return result;
	});

	const pagedOrders = computed(() => {
		const start = (pagination.value.page - 1) * pagination.value.rowsPerPage;
		const end = start + pagination.value.rowsPerPage;
		return filteredOrders.value.slice(start, end);
	});

	const maxPage = computed(() =>
		Math.ceil(filteredOrders.value.length / pagination.value.rowsPerPage)
	);

	const totalOrders = computed(() => orders.value.length);

	const statusCounts = computed(() => {
		const counts = {};
		orders.value.forEach((order) => {
			counts[order.status] = (counts[order.status] || 0) + 1;
		});

		return Object.entries(counts).map(([status, count]) => ({
			status,
			count,
			statusLabel: status.charAt(0).toUpperCase() + status.slice(1),
		}));
	});

	// Event Handlers
	function onRequest(props) {
		pagination.value = props.pagination;
		fetchOrders(props.pagination.page);
	}

	function onSearch() {
		pagination.value.page = 1;
	}

	function onFilter() {
		pagination.value.page = 1;
	}

	function onSort() {
		pagination.value.page = 1;
	}

	function onDateFilter() {
		pagination.value.page = 1;
	}

	function openOrder(order) {
		if (order?.id) {
			fetchOrderDetails(order.id);
		}
	}

	// Confirmation Dialogs
	const confirmDialog = ref({
		show: false,
		title: "",
		message: "",
		actionLabel: "",
		actionColor: "",
		icon: "",
		action: null,
	});

	function confirmShip(order) {
		confirmDialog.value = {
			show: true,
			title: "Ship Order",
			message: `Mark order ${order.order_number} as shipped? This will notify the customer with tracking information.`,
			actionLabel: "Ship Order",
			actionColor: "primary",
			icon: "local_shipping",
			action: () => updateOrderStatus(order.id, "shipped"),
		};
	}

	function confirmCancel(order) {
		confirmDialog.value = {
			show: true,
			title: "Cancel Order",
			message: `Cancel order ${order.order_number}? This action cannot be undone and the customer will be notified.`,
			actionLabel: "Cancel Order",
			actionColor: "negative",
			icon: "cancel",
			action: () => updateOrderStatus(order.id, "cancelled"),
		};
	}

	function confirmReturn(order) {
		confirmDialog.value = {
			show: true,
			title: "Process Return",
			message: `Process return for order ${order.order_number}? This will initiate the return workflow.`,
			actionLabel: "Process Return",
			actionColor: "orange",
			icon: "assignment_return",
			action: () => returnOrderApi(order.id),
		};
	}

	function copyOrderNumber(order) {
		const orderNumber = order.order_number || `#${order.id}`;
		navigator.clipboard?.writeText(orderNumber);
		$q.notify({
			type: "positive",
			message: "Order number copied to clipboard",
			icon: "content_copy",
		});
	}

	function exportCSV() {
		if (!orders.value.length) {
			$q.notify({
				type: "warning",
				message: "No orders to export",
			});
			return;
		}

		const csvData = orders.value.map((order) => ({
			"Order Number": order.order_number,
			Customer: order.customer,
			Email: order.raw?.user?.email || "",
			Status: order.status,
			Amount: order.amount,
			"Items Count": (order.items || []).length,
			Created: order.created_at,
			Address: formatAddress(order.raw?.shipping_address),
		}));

		const headers = Object.keys(csvData[0]);
		const csvContent = [
			headers.join(","),
			...csvData.map((row) =>
				headers
					.map((header) => `"${String(row[header]).replace(/"/g, '""')}"`)
					.join(",")
			),
		].join("\n");

		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const link = document.createElement("a");
		const url = URL.createObjectURL(blob);
		link.setAttribute("href", url);
		link.setAttribute(
			"download",
			`orders_export_${new Date().toISOString().split("T")[0]}.csv`
		);
		link.style.visibility = "hidden";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);

		$q.notify({
			type: "positive",
			message: "Orders exported successfully",
			icon: "download",
		});
	}

	// Watchers
	watch(
		() => pagination.value.page,
		(newPage) => {
			fetchOrders(newPage);
		}
	);

	// Lifecycle
	onMounted(() => {
		fetchOrders();
	});
</script>

<style scoped>
	/* Global Styles */
	.order-management-container {
		min-height: 100vh;
		background: #f8fafc;
		padding: 28px 24px;
	}

	/* Header Section */
	.header-section {
		background: #ffffff;
		border-radius: 14px;
		border: 1px solid #e2e8f0;
		box-shadow: 0 1px 6px rgba(0,0,0,0.06);
		padding: 24px 28px;
		margin-bottom: 20px;
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 24px;
		flex-wrap: wrap;
	}

	.header-left {
		flex: 1;
		min-width: 280px;
	}

	.main-title {
		font-size: 1.75rem;
		font-weight: 700;
		color: #0f172a;
		margin: 0 0 4px 0;
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.title-icon {
		font-size: 1.75rem;
		color: #6366f1;
	}

	.subtitle {
		color: #64748b;
		font-size: 0.9rem;
		margin: 0 0 20px 0;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
		gap: 12px;
		margin-top: 16px;
	}

	.stat-card {
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 10px;
		padding: 16px;
		text-align: center;
	}

	.stat-card:hover {
		background: #f1f5f9;
	}

	.stat-number {
		font-size: 1.6rem;
		font-weight: 700;
		color: #0f172a;
		margin-bottom: 2px;
	}

	.stat-label {
		font-size: 0.78rem;
		color: #64748b;
		font-weight: 500;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.action-group {
		background: #f1f5f9;
		border-radius: 10px;
		border: 1px solid #e2e8f0;
	}

	.action-btn {
		color: #475569;
		background: transparent;
		padding: 8px;
		border-radius: 8px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}
	.action-btn .q-icon,
	.action-btn svg {
		color: inherit !important;
	}
	.action-btn:hover {
		background: #e2e8f0;
	}

	/* Filters Section */
	.filters-section {
		margin-bottom: 24px;
	}

	.filters-container {
		background: #ffffff;
		border-radius: 12px;
		padding: 20px;
		border: 1px solid #e2e8f0;
		box-shadow: 0 1px 4px rgba(0,0,0,0.05);
	}

	.search-container {
		margin-bottom: 20px;
	}

	.search-input {
		width: 100%;
		max-width: 500px;
	}

	.filter-controls {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 16px;
	}

	.filter-select {
		min-width: 200px;
	}

	/* Orders Section */
	.orders-section {
		margin-bottom: 24px;
	}

	.orders-table-card {
		max-height: calc(100vh - 340px);
		overflow: auto;
	}

	.orders-table-card {
		background: #ffffff;
		border-radius: 14px;
		border: 1px solid #e2e8f0;
		box-shadow: 0 1px 6px rgba(0,0,0,0.06);
		overflow: auto;
	}

	.orders-table {
		border-radius: 20px;
	}

	/* Table Cell Styles */
	.order-info-cell {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.order-number {
		font-weight: 700;
		color: #1e293b;
		font-size: 0.95rem;
	}

	.order-date {
		font-size: 0.8rem;
		color: #64748b;
	}

	.customer-info {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.customer-avatar {
		border: 2px solid rgba(255, 255, 255, 0.3);
	}

	.customer-details {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.customer-name {
		font-weight: 600;
		color: #1e293b;
		font-size: 0.9rem;
	}

	.customer-email {
		font-size: 0.8rem;
		color: #64748b;
	}

	.items-preview {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.items-images {
		display: flex;
		position: relative;
	}

	.item-image {
		margin-left: -8px;
		border: 2px solid white;
		border-radius: 50%;
		position: relative;
	}

	.item-image:first-child {
		margin-left: 0;
	}

	.product-thumb img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 50%;
	}

	.items-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.items-count {
		font-size: 0.85rem;
		color: #64748b;
	}

	.items-value {
		font-weight: 600;
		color: #059669;
		font-size: 0.9rem;
	}

	.status-chip {
		font-weight: 600;
		letter-spacing: 0.5px;
	}

	.action-buttons {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.action-btn {
		transition: all 0.2s ease;
		color: #1f2937;
	}

	.action-btn:hover {
		background: #e2e8f0;
	}

	/* Mobile Cards */
	.mobile-only {
		display: none;
	}

	.mobile-orders {
		display: grid;
		gap: 16px;
	}

	.order-card {
		background: #ffffff;
		border-radius: 12px;
		border: 1px solid #e2e8f0;
		cursor: pointer;
	}

	.order-card:hover {
		box-shadow: 0 4px 16px rgba(0,0,0,0.08);
	}

	.order-card-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		padding: 20px;
	}

	.order-main-info {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.order-number-mobile {
		font-weight: 700;
		color: #1e293b;
		font-size: 1.1rem;
	}

	.order-amount-mobile {
		font-weight: 700;
		color: #059669;
		font-size: 1.2rem;
	}

	.order-card-body {
		padding: 0 20px 20px 20px;
	}

	.customer-row-mobile {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 16px;
	}

	.customer-info-mobile {
		flex: 1;
	}

	.customer-name-mobile {
		font-weight: 600;
		color: #1e293b;
	}

	.customer-email-mobile {
		font-size: 0.85rem;
		color: #64748b;
		margin-top: 2px;
	}

	.order-meta-mobile {
		display: flex;
		gap: 20px;
		margin-top: 12px;
	}

	.meta-item {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 0.85rem;
		color: #64748b;
	}

	.order-card-actions {
		padding: 16px 20px;
		background: rgba(248, 250, 252, 0.5);
	}

	/* Drawer Styles */
	.order-drawer {
		border-top-left-radius: 20px;
		border-bottom-left-radius: 20px;
	}

	/* ensure drawer does not block background scroll and sits above content but allows underlying scroll */
	.order-drawer {
		z-index: 1020;
	}

	.drawer-header {
		background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
		color: white;
		padding: 24px;
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 16px;
	}

	.drawer-title-section {
		display: flex;
		align-items: center;
		gap: 16px;
		flex: 1;
	}

	.drawer-title-info {
		flex: 1;
	}

	.drawer-title {
		font-size: 1.4rem;
		font-weight: 700;
		margin: 0 0 4px 0;
		color: white;
	}

	.drawer-subtitle {
		font-size: 0.9rem;
		color: rgba(255, 255, 255, 0.8);
		margin: 0 0 12px 0;
	}

	.drawer-actions {
		display: flex;
		gap: 8px;
	}

	.drawer-content {
		padding: 24px;
	}

	.detail-section {
		margin-bottom: 32px;
	}

	.section-title {
		font-size: 1.2rem;
		font-weight: 600;
		color: #1e293b;
		margin: 0 0 16px 0;
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.summary-grid {
		background: #f8fafc;
		border-radius: 12px;
		padding: 20px;
		border: 1px solid #e2e8f0;
	}

	.summary-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px 0;
	}

	.summary-item:not(:last-child) {
		border-bottom: 1px solid #e2e8f0;
	}

	.summary-label {
		color: #64748b;
		font-weight: 500;
	}

	.summary-value {
		font-weight: 600;
		color: #1e293b;
	}

	.total-row {
		border-top: 2px solid #3b82f6;
		margin-top: 8px;
		padding-top: 16px;
		font-size: 1.1rem;
	}

	.total-amount {
		color: #059669;
		font-size: 1.2rem;
	}

	.customer-detail-card {
		background: #f8fafc;
		border-radius: 12px;
		padding: 20px;
		border: 1px solid #e2e8f0;
	}

	.customer-detail-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px 0;
	}

	.customer-detail-row:not(:last-child) {
		border-bottom: 1px solid #e2e8f0;
	}

	.detail-label {
		color: #64748b;
		font-weight: 500;
	}

	.detail-value {
		font-weight: 600;
		color: #1e293b;
	}

	.address-card {
		background: #f8fafc;
		border-radius: 12px;
		padding: 20px;
		border: 1px solid #e2e8f0;
		font-weight: 500;
		color: #1e293b;
		line-height: 1.5;
	}

	.items-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.item-card {
		background: #f8fafc;
		border-radius: 12px;
		padding: 16px;
		border: 1px solid #e2e8f0;
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.item-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 8px;
	}

	.item-details {
		flex: 1;
	}

	.item-name {
		font-weight: 600;
		color: #1e293b;
		margin-bottom: 4px;
	}

	.item-meta {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 0.9rem;
		color: #64748b;
	}

	.item-price {
		font-weight: 500;
	}

	.item-separator {
		color: #94a3b8;
	}

	.item-quantity {
		font-weight: 500;
	}

	.item-total {
		font-weight: 700;
		color: #059669;
		font-size: 1.1rem;
	}

	.order-timeline {
		background: #f8fafc;
		border-radius: 12px;
		padding: 20px;
		border: 1px solid #e2e8f0;
	}

	.timeline-desc {
		font-size: 0.85rem;
		color: #64748b;
		margin-top: 4px;
	}

	.drawer-footer-actions {
		display: flex;
		gap: 12px;
		margin-top: 32px;
		padding-top: 24px;
		border-top: 1px solid #e2e8f0;
	}

	.action-button {
		flex: 1;
		padding: 12px 24px;
		border-radius: 12px;
		font-weight: 600;
		text-transform: none;
		letter-spacing: 0.5px;
	}

	/* Pagination */
	.pagination-section {
		display: flex;
		justify-content: center;
		margin-top: 32px;
	}

	.pagination-control {
		background: #ffffff;
		border-radius: 12px;
		padding: 10px 20px;
		border: 1px solid #e2e8f0;
	}

	/* Dialog Styles */
	.confirm-dialog-card {
		min-width: 400px;
		border-radius: 20px;
		overflow: hidden;
	}

	.confirm-header {
		background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
		color: white;
		text-align: center;
		padding: 32px 24px 24px 24px;
	}

	.confirm-title {
		font-size: 1.3rem;
		font-weight: 600;
		margin: 12px 0 0 0;
	}

	.confirm-message {
		font-size: 1rem;
		line-height: 1.5;
		color: #374151;
		margin: 0;
		text-align: center;
	}

	.confirm-actions {
		padding: 24px;
		gap: 12px;
	}

	.cancel-btn {
		flex: 1;
		padding: 12px;
		border-radius: 12px;
	}

	.confirm-btn {
		flex: 1;
		padding: 12px;
		border-radius: 12px;
		font-weight: 600;
	}

	/* Responsive Design */
	@media (max-width: 1024px) {
		.desktop-only {
			display: none !important;
		}

		.mobile-only {
			display: block !important;
		}

		.header-content {
			flex-direction: column;
			align-items: stretch;
		}

		.stats-grid {
			grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
		}

		.filter-controls {
			grid-template-columns: 1fr;
		}

		.drawer-header {
			flex-direction: column;
			align-items: stretch;
			gap: 16px;
		}

		.drawer-title-section {
			flex-direction: column;
			align-items: center;
			text-align: center;
		}

		.drawer-actions {
			justify-content: center;
		}
	}

	@media (max-width: 640px) {
		.order-management-container {
			padding: 16px;
		}

		.main-title {
			font-size: 1.4rem;
		}

		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.filters-container {
			padding: 16px;
		}

		.drawer-content {
			padding: 16px;
		}

		.confirm-dialog-card {
			min-width: 300px;
			margin: 16px;
		}

		.drawer-footer-actions {
			flex-direction: column;
		}
	}

	/* Animation Classes */
	.q-table tbody tr {
		transition: all 0.2s ease;
	}

	.q-table tbody tr:hover {
		background: rgba(59, 130, 246, 0.05) !important;
		transform: scale(1.01);
	}

	/* Custom Scrollbar */
	.q-scrollarea__thumb {
		background: rgba(59, 130, 246, 0.3);
		border-radius: 4px;
	}

	.q-scrollarea__thumb:hover {
		background: rgba(59, 130, 246, 0.5);
	}
</style>
