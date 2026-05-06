<template>
	<div class="q-pa-md">
		<div class="row items-center justify-between q-mb-lg">
			<div class="col-auto">
				<h2 class="text-h4 text-weight-bold q-ma-none">Your Orders</h2>
				<p class="text-body2 text-grey-7 q-mt-xs q-mb-none">
					Track and manage your order history
				</p>
			</div>
			<div class="col-auto">
				<q-chip
					v-if="!loading && orders.length > 0"
					color="primary"
					text-color="white"
					icon="shopping_bag">
					{{ filteredOrders.length }} / {{ pagination.total }} orders
				</q-chip>
			</div>
		</div>

		<!-- Analytics + Filters -->
		<div v-if="!loading && orders.length > 0" class="q-mb-lg">
			<div class="analytics-grid q-mb-md">
				<q-card flat bordered class="metric-card">
					<q-card-section>
						<div class="metric-label">Visible Orders</div>
						<div class="metric-value">{{ analytics.visibleOrders }}</div>
					</q-card-section>
				</q-card>
				<q-card flat bordered class="metric-card">
					<q-card-section>
						<div class="metric-label">Visible Spend</div>
						<div class="metric-value">Rs {{ formatPrice(analytics.visibleRevenue) }}</div>
					</q-card-section>
				</q-card>
				<q-card flat bordered class="metric-card">
					<q-card-section>
						<div class="metric-label">Delivered</div>
						<div class="metric-value">{{ analytics.deliveredCount }}</div>
					</q-card-section>
				</q-card>
				<q-card flat bordered class="metric-card">
					<q-card-section>
						<div class="metric-label">Cancelled</div>
						<div class="metric-value">{{ analytics.cancelledCount }}</div>
					</q-card-section>
				</q-card>
			</div>

			<q-card flat bordered class="filter-paper">
				<q-card-section>
					<div class="row items-center justify-between q-col-gutter-md q-row-gutter-sm">
						<div class="col-12 col-md-4">
							<q-input
								v-model="searchQuery"
								dense
								outlined
								clearable
								label="Search by Order ID or Address"
								placeholder="e.g. ORD-2026..."
								debounce="250">
								<template #prepend>
									<q-icon name="search" />
								</template>
							</q-input>
						</div>
						<div class="col-12 col-sm-6 col-md-2">
							<q-select
								v-model="statusFilter"
								:options="statusOptions"
								dense
								outlined
								emit-value
								map-options
								label="Status" />
						</div>
						<div class="col-12 col-sm-6 col-md-2">
							<q-select
								v-model="sortBy"
								:options="sortOptions"
								dense
								outlined
								emit-value
								map-options
								label="Sort" />
						</div>
						<div class="col-6 col-md-2">
							<q-input
								v-model.number="amountMin"
								type="number"
								dense
								outlined
								min="0"
								label="Min Amount" />
						</div>
						<div class="col-6 col-md-2">
							<q-input
								v-model.number="amountMax"
								type="number"
								dense
								outlined
								min="0"
								label="Max Amount" />
						</div>
						<div class="col-6 col-md-2">
							<q-input
								v-model="dateFrom"
								type="date"
								dense
								outlined
								label="From" />
						</div>
						<div class="col-6 col-md-2">
							<q-input
								v-model="dateTo"
								type="date"
								dense
								outlined
								label="To" />
						</div>
						<div class="col-12 col-md-2 flex items-center justify-end">
							<q-btn
								flat
								color="primary"
								icon="restart_alt"
								label="Reset"
								no-caps
								@click="resetFilters" />
						</div>
					</div>
				</q-card-section>
			</q-card>
		</div>

		<!-- Loading State -->
		<div v-if="loading" class="row justify-center q-py-xl">
			<div class="col-auto text-center">
				<q-spinner-dots size="50px" color="primary" />
				<div class="text-body1 q-mt-md text-grey-7">Loading your orders...</div>
			</div>
		</div>

		<!-- Empty State -->
		<div v-else-if="orders.length === 0" class="row justify-center q-py-xl">
			<div class="col-auto text-center">
				<q-icon name="shopping_cart" size="80px" color="grey-4" />
				<div class="text-h6 q-mt-md text-grey-7">No orders yet</div>
				<div class="text-body2 text-grey-6 q-mt-sm">
					Your order history will appear here once you make your first purchase
				</div>
			</div>
		</div>

		<div v-else-if="filteredOrders.length === 0" class="row justify-center q-py-xl">
			<div class="col-auto text-center">
				<q-icon name="filter_alt_off" size="72px" color="grey-5" />
				<div class="text-h6 q-mt-md text-grey-8">No orders match these filters</div>
				<div class="text-body2 text-grey-6 q-mt-sm q-mb-md">
					Try a different status, date range, or amount range
				</div>
				<q-btn color="primary" flat no-caps icon="refresh" label="Clear Filters" @click="resetFilters" />
			</div>
		</div>

		<!-- Orders List -->
		<div v-else class="q-gutter-md">
			<q-card
				v-for="(order, idx) in filteredOrders"
				:key="order.order_number + idx"
				flat
				bordered
				class="order-card">
				<q-card-section class="q-pa-md">
					<div class="row items-center justify-between">
						<!-- Order Info -->
						<div class="col-auto">
							<div class="row items-center q-gutter-sm q-mb-xs">
								<q-icon name="receipt_long" color="primary" size="20px" />
								<span class="text-subtitle1 text-weight-bold">
									{{ order.order_number }}
								</span>
							</div>

							<div class="row items-center q-gutter-sm q-mb-xs">
								<q-icon name="schedule" color="grey-6" size="16px" />
								<span class="text-body2 text-grey-7">
									{{ formatDate(order.created_at) }}
								</span>
							</div>

							<div class="row items-center q-gutter-sm">
								<q-icon name="location_on" color="grey-6" size="16px" />
								<span class="text-body2 text-grey-7">
									{{ formatShippingAddress(order.shipping_address) }}
								</span>
							</div>
						</div>

						<!-- Order Summary -->
						<div class="col-auto text-right">
							<div class="text-h6 text-weight-bold q-mb-xs">
								Rs {{ formatPrice(order.total) }}
							</div>

							<q-chip
								:color="getStatusColor(order.status)"
								:text-color="getStatusTextColor(order.status)"
								:icon="getStatusIcon(order.status)"
								size="sm"
								class="q-mb-sm">
								{{ getStatusLabel(order.status) }}
							</q-chip>

							<div>
								<q-btn
									color="primary"
									outline
									no-caps
									size="sm"
									icon="visibility"
									label="View Details"
									@click="viewOrder(order)" />
							</div>
						</div>
					</div>
				</q-card-section>
			</q-card>

			<!-- Pagination -->
			<div
				v-if="pagination.total > pagination.per_page"
				class="row justify-center q-mt-lg">
				<q-pagination
					v-model="pagination.current_page"
					:max="pagination.last_page"
					:max-pages="6"
					boundary-links
					@update:model-value="changePage"
					color="primary"
					size="md" />
			</div>
		</div>

		<!-- Order Detail Dialog -->
		<q-dialog v-model="showDetail" persistent>
			<q-card
				style="min-width: 400px; max-width: 800px"
				class="order-detail-card">
				<!-- Header -->
				<q-card-section class="bg-primary text-white">
					<div class="row items-center justify-between">
						<div class="col">
							<div class="text-h6 text-weight-bold">
								Order {{ detail.order_number }}
							</div>
							<div class="text-body2 opacity-80">
								Placed on {{ formatDate(detail.created_at) }}
							</div>
						</div>
						<div class="col-auto">
							<q-chip
								:color="getStatusColor(detail.status, true)"
								:text-color="getStatusTextColor(detail.status, true)"
								:icon="getStatusIcon(detail.status)"
								size="md">
								{{ getStatusLabel(detail.status) }}
							</q-chip>
						</div>
					</div>
				</q-card-section>

				<q-separator />

				<!-- Scrollable Body -->
				<div class="order-detail-body">
					<!-- Order Items -->
					<q-card-section class="q-pa-none">
						<div class="text-subtitle1 text-weight-medium q-pa-md q-pb-sm">
							<q-icon name="shopping_cart" class="q-mr-sm" />
							Order Items
						</div>

						<div v-if="getOrderItems(detail).length > 0" class="q-px-md">
							<q-list separator>
								<q-item
									v-for="item in getOrderItems(detail)"
									:key="item.product_id || item.id"
									class="q-px-none">
									<q-item-section>
										<q-item-label class="text-weight-medium">
											{{ item.name || item.product_name }}
										</q-item-label>
										<q-item-label caption>
											Quantity: {{ item.quantity }} × Rs
											{{ formatPrice(item.price) }}
										</q-item-label>
									</q-item-section>
									<q-item-section side>
										<q-item-label class="text-weight-bold">
											Rs {{ formatPrice(item.total) }}
										</q-item-label>
									</q-item-section>
								</q-item>
							</q-list>
						</div>

						<div v-else class="q-pa-md text-center text-grey-6">
							<q-icon name="inbox" size="40px" color="grey-4" />
							<div class="text-body2 q-mt-sm">
								No items available for this order
							</div>
						</div>
					</q-card-section>

					<q-separator />

					<!-- Order Summary -->
					<q-card-section>
						<div class="text-subtitle1 text-weight-medium q-mb-md">
							<q-icon name="receipt" class="q-mr-sm" />
							Order Summary
						</div>

						<div class="order-summary">
							<div class="row justify-between q-mb-sm">
								<span class="text-body2">Subtotal</span>
								<span class="text-body2"
									>Rs
									{{ formatPrice(detail.subtotal ?? detail.total ?? 0) }}</span
								>
							</div>
							<div class="row justify-between q-mb-sm">
								<span class="text-body2">Shipping</span>
								<span class="text-body2"
									>Rs {{ formatPrice(detail.shipping ?? 0) }}</span
								>
							</div>
							<div class="row justify-between q-mb-md">
								<span class="text-body2">Tax</span>
								<span class="text-body2"
									>Rs {{ formatPrice(detail.tax ?? 0) }}</span
								>
							</div>
							<q-separator class="q-mb-md" />
							<div class="row justify-between">
								<span class="text-h6 text-weight-bold">Total</span>
								<span class="text-h6 text-weight-bold text-primary">
									Rs {{ formatPrice(detail.total ?? 0) }}
								</span>
							</div>
						</div>
					</q-card-section>

					<!-- Shipping Address -->
					<q-card-section v-if="detail.shipping_address" class="q-pt-none">
						<div class="text-subtitle1 text-weight-medium q-mb-sm">
							<q-icon name="local_shipping" class="q-mr-sm" />
							Shipping Address
						</div>
						<q-card flat bordered class="bg-grey-1">
							<q-card-section class="q-pa-md">
								<div class="text-body2">
									{{ formatShippingAddress(detail.shipping_address) }}
								</div>
							</q-card-section>
						</q-card>
					</q-card-section>
				</div>

				<!-- Actions fixed at bottom -->
				<q-card-actions align="right" class="q-pa-md order-detail-actions">
					<q-btn
						flat
						label="Close"
						color="grey-7"
						@click="closeDetail"
						no-caps />
					<q-btn
						color="primary"
						label="Track Order"
						no-caps
						icon="track_changes"
						v-if="
							detail.status !== 'delivered' &&
							detail.status !== 'cancelled' &&
							detail.status !== 'refunded'
						" />
				</q-card-actions>
			</q-card>
		</q-dialog>
	</div>
</template>

<script setup>
	import { ref, computed, onMounted } from "vue";
	import ordersService from "@/services/orders";

	const orders = ref([]);
	const loading = ref(true);
	const showDetail = ref(false);
	const detail = ref({});
	const pagination = ref({
		current_page: 1,
		last_page: 1,
		per_page: 10,
		total: 0,
		next_page_url: null,
	});

	const searchQuery = ref("");
	const statusFilter = ref("all");
	const sortBy = ref("latest");
	const amountMin = ref(null);
	const amountMax = ref(null);
	const dateFrom = ref("");
	const dateTo = ref("");

	const statusOptions = [
		{ label: "All Statuses", value: "all" },
		{ label: "Processing", value: "processing" },
		{ label: "Shipped", value: "shipped" },
		{ label: "Delivered", value: "delivered" },
		{ label: "Cancelled", value: "cancelled" },
		{ label: "Refunded", value: "refunded" },
		{ label: "Disputed", value: "disputed" },
	];

	const sortOptions = [
		{ label: "Latest First", value: "latest" },
		{ label: "Oldest First", value: "oldest" },
		{ label: "Amount High to Low", value: "amount_desc" },
		{ label: "Amount Low to High", value: "amount_asc" },
	];

	const fetchOrders = async (page = 1) => {
		loading.value = true;
		try {
			const res = await ordersService.getOrders(page);
			if (res && res.success) {
				const payload = res.data || {};
				if (Array.isArray(payload.data)) {
					orders.value = payload.data;
					pagination.value.current_page = payload.current_page || page;
					pagination.value.last_page = payload.last_page || 1;
					pagination.value.per_page = payload.per_page || 10;
					pagination.value.total = payload.total || 0;
					pagination.value.next_page_url = payload.next_page_url || null;
				} else if (Array.isArray(res.data)) {
					orders.value = res.data;
				}
			}
		} catch (err) {
			console.error("fetchOrders error", err);
		} finally {
			loading.value = false;
		}
	};

	const viewOrder = async (order) => {
		if (order.items || order.order_items) {
			detail.value = {
				...order,
				items:
					order.items ||
					(order.order_items
						? order.order_items.map((item) => ({
								product_id: item.product_id,
								name: item.product_name || item.name,
								quantity: item.quantity,
								price: item.price,
								total: item.total,
						  }))
						: undefined),
				order_items: order.order_items || undefined,
			};
			showDetail.value = true;
			return;
		}

		try {
			const res = await ordersService.getOrder(order.id || order.order_number);
			if (res && res.success) {
				detail.value = res.data || {};
				showDetail.value = true;
			}
		} catch (err) {
			console.error("viewOrder error", err);
		}
	};

	const closeDetail = () => {
		showDetail.value = false;
		detail.value = {};
	};

	const changePage = (page) => {
		if (!page || page < 1) return;
		fetchOrders(page);
	};

	const normalizeStatus = (status) => String(status || "").toLowerCase().trim();

	const getOrderTimestamp = (order) => {
		const t = new Date(order?.created_at || 0).getTime();
		return Number.isFinite(t) ? t : 0;
	};

	const getOrderAmount = (order) => Number(order?.total ?? 0);

	const filteredOrders = computed(() => {
		const term = searchQuery.value.trim().toLowerCase();
		const min = amountMin.value == null || amountMin.value === "" ? null : Number(amountMin.value);
		const max = amountMax.value == null || amountMax.value === "" ? null : Number(amountMax.value);

		const fromTs = dateFrom.value ? new Date(`${dateFrom.value}T00:00:00`).getTime() : null;
		const toTs = dateTo.value ? new Date(`${dateTo.value}T23:59:59`).getTime() : null;

		const list = orders.value.filter((order) => {
			const status = normalizeStatus(order.status);
			if (statusFilter.value !== "all" && status !== statusFilter.value) return false;

			const amount = getOrderAmount(order);
			if (min != null && Number.isFinite(min) && amount < min) return false;
			if (max != null && Number.isFinite(max) && amount > max) return false;

			const createdAt = getOrderTimestamp(order);
			if (fromTs != null && createdAt < fromTs) return false;
			if (toTs != null && createdAt > toTs) return false;

			if (term) {
				const haystack = [
					order.order_number,
					formatShippingAddress(order.shipping_address),
					status,
				]
					.filter(Boolean)
					.join(" ")
					.toLowerCase();
				if (!haystack.includes(term)) return false;
			}

			return true;
		});

		return [...list].sort((a, b) => {
			switch (sortBy.value) {
				case "oldest":
					return getOrderTimestamp(a) - getOrderTimestamp(b);
				case "amount_desc":
					return getOrderAmount(b) - getOrderAmount(a);
				case "amount_asc":
					return getOrderAmount(a) - getOrderAmount(b);
				case "latest":
				default:
					return getOrderTimestamp(b) - getOrderTimestamp(a);
			}
		});
	});

	const analytics = computed(() => {
		const list = filteredOrders.value;
		return {
			visibleOrders: list.length,
			visibleRevenue: list.reduce((sum, o) => sum + getOrderAmount(o), 0),
			deliveredCount: list.filter((o) => normalizeStatus(o.status) === "delivered").length,
			cancelledCount: list.filter((o) => normalizeStatus(o.status) === "cancelled").length,
		};
	});

	const resetFilters = () => {
		searchQuery.value = "";
		statusFilter.value = "all";
		sortBy.value = "latest";
		amountMin.value = null;
		amountMax.value = null;
		dateFrom.value = "";
		dateTo.value = "";
	};

	// Utility Functions
	const formatDate = (iso) => {
		if (!iso) return "—";
		try {
			return new Date(iso).toLocaleDateString("en-US", {
				year: "numeric",
				month: "short",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			});
		} catch (e) {
			return iso;
		}
	};

	const formatPrice = (value) => {
		if (value == null) return "0";
		return Number(value).toLocaleString("en-US", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		});
	};

	const formatShippingAddress = (address) => {
		if (!address) return "—";
		if (Array.isArray(address)) {
			return address.filter(Boolean).join(", ");
		}
		if (typeof address === "object") {
			return [address.line1, address.city, address.postal_code, address.country]
				.filter(Boolean)
				.join(", ");
		}
		return String(address);
	};

	const getOrderItems = (orderDetail) => {
		return orderDetail.items && orderDetail.items.length
			? orderDetail.items
			: orderDetail.order_items || [];
	};

	// Status styling functions
	const getStatusColor = (status, isChip = false) => {
		const statusMap = {
			processing: "orange",
			shipped: "blue",
			delivered: "green",
			cancelled: "red",
			refunded: "purple",
			disputed: "deep-orange",
		};
		return statusMap[status] || "grey";
	};

	const getStatusTextColor = (status, isChip = false) => {
		return "white";
	};

	const getStatusIcon = (status) => {
		const iconMap = {
			processing: "hourglass_empty",
			shipped: "local_shipping",
			delivered: "check_circle",
			cancelled: "cancel",
			refunded: "undo",
			disputed: "report_problem",
		};
		return iconMap[status] || "help";
	};

	const getStatusLabel = (status) => {
		const labelMap = {
			processing: "Processing",
			shipped: "Shipped",
			delivered: "Delivered",
			cancelled: "Cancelled",
			refunded: "Refunded",
			disputed: "Disputed",
		};
		return labelMap[status] || status;
	};

	onMounted(fetchOrders);
</script>

<style scoped>
	.order-card {
		transition: all 0.3s ease;
		border-radius: 12px;
	}

	.analytics-grid {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 12px;
	}

	.metric-card {
		border-radius: 14px;
		background: linear-gradient(180deg, #ffffff 0%, #f7fafc 100%);
	}

	.metric-label {
		font-size: 12px;
		color: #64748b;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 700;
	}

	.metric-value {
		font-size: 24px;
		font-weight: 800;
		line-height: 1.2;
		color: #0f172a;
		margin-top: 8px;
	}

	.filter-paper {
		border-radius: 16px;
		background:
			radial-gradient(circle at top right, rgba(37, 99, 235, 0.08), transparent 45%),
			#ffffff;
		border-color: #dbe7ff;
	}

	.order-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
	}

	@media (max-width: 1024px) {
		.analytics-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 599px) {
		.analytics-grid {
			grid-template-columns: 1fr;
		}
	}

	.order-detail-card {
		border-radius: 16px;
		overflow: hidden;
		max-height: 90vh; /* ensures dialog fits viewport */
		display: flex;
		flex-direction: column;
	}

	.order-summary {
		background: rgba(0, 0, 0, 0.02);
		border-radius: 8px;
		padding: 16px;
	}

	.order-detail-body {
		overflow-y: auto;
		flex: 1 1 auto;
	}

	.order-detail-actions {
		flex-shrink: 0;
		border-top: 1px solid rgba(0, 0, 0, 0.05);
		background: #fff;
	}

	/* Custom scrollbar for dialog */
	.q-dialog__inner {
		scrollbar-width: thin;
		scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
	}

	.q-dialog__inner::-webkit-scrollbar {
		width: 6px;
	}

	.q-dialog__inner::-webkit-scrollbar-track {
		background: transparent;
	}

	.q-dialog__inner::-webkit-scrollbar-thumb {
		background-color: rgba(0, 0, 0, 0.2);
		border-radius: 3px;
	}
</style>
