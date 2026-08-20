<template>
	<div
		class="seller-sidebar-wrap"
		role="navigation"
		aria-label="Seller sidebar">
		<!-- decorative background behind sidebar -->
		<div
			class="sidebar-bg"
			aria-hidden="true"
			v-show="!isMobile || drawer"></div>

		<!-- mobile open button -->
		<q-btn
			v-if="isMobile"
			class="mobile-open-btn"
			dense
			fab
			icon="menu"
			aria-label="Open menu"
			@click="drawer = true" />

		<q-drawer
			v-model="drawer"
			side="left"
			:width="drawerWidth"
			bordered
			:class="[
				'seller-drawer',
				{
					'seller-drawer--dark': $q.dark.isActive,
					'seller-drawer--light': !$q.dark.isActive,
					'mobile-light': isMobile && !$q.dark.isActive,
				},
			]"
			:behavior="isMobile ? 'mobile' : 'desktop'"
			:overlay="isMobile"
			:swipe-close="false"
			:swipe-to-open="false"
			@update:model-value="onDrawerModelUpdate">
			<!-- add a card container so edges are rounded and content sits in a card -->
			<div class="inner q-pa-sm flex flex-col h-full" :style="{ zIndex: 2 }">
				<div class="drawer-card">
					<!-- Brand -->
					<div class="brand row items-center q-px-sm q-py-xs">
						<div class="brand-left row items-center gap-3">
							<q-avatar
								:size="collapsed ? '44px' : '48px'"
								class="brand-avatar"
								:style="avatarStyle">
								<q-icon name="storefront" />
							</q-avatar>

							<div v-if="!collapsed" class="brand-text">
								<div class="brand-title">Seller Panel</div>
								<div class="brand-sub">Manage your store</div>
							</div>
						</div>

						<div class="ml-auto actions">
							<LowStockAlertsMenu
								v-if="userRole === 'manager'"
								:compact="collapsed && !isMobile"
								role="manager" />
							<q-btn
								dense
								flat
								round
								:icon="collapsed ? 'chevron_right' : 'chevron_left'"
								class="toggle-btn"
								@click="toggle"
								:aria-label="collapsed ? 'Expand' : 'Collapse'" />
						</div>
					</div>

					<q-separator spaced />

					<!-- Menu -->
					<q-list padding class="menu-list" :style="{ zIndex: 2 }">
						<q-item
							v-for="item in menu"
							:key="item.to"
							clickable
							:active="isActive(item)"
							@click="go(item)"
							class="menu-item"
							:dense="collapsed"
							tabindex="0">
							<q-item-section avatar>
								<div class="icon-wrap" :title="collapsed ? item.label : ''">
									<q-icon :name="item.icon" class="menu-icon" />
									<div
										v-if="isActive(item)"
										class="active-indicator"
										aria-hidden="true"></div>
								</div>
							</q-item-section>

							<q-item-section v-if="!collapsed || isMobile" class="menu-text">
								<q-item-label class="menu-label">{{ item.label }}</q-item-label>
								<q-item-label caption v-if="item.caption">{{
									item.caption
								}}</q-item-label>
							</q-item-section>

							<q-badge
								v-if="item.badge && !collapsed"
								:color="item.badgeColor || 'primary'"
								class="menu-badge">
								{{ item.badge }}
							</q-badge>

							<q-tooltip v-if="collapsed">{{ item.label }}</q-tooltip>
						</q-item>
					</q-list>

					<!-- Footer / user -->
					<div class="mt-auto q-pa-sm footer" :style="{ zIndex: 2 }">
						<q-separator spaced />
						<div v-if="!collapsed" class="q-mt-sm footer-actions flex flex-col gap-2">
							<!-- Dark mode toggle -->
							<q-btn
								unelevated
								:color="$q.dark.isActive ? 'yellow-8' : 'blue-grey-7'"
								class="w-full"
								:icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
								:label="$q.dark.isActive ? 'Light Mode' : 'Dark Mode'"
								@click="toggleDark"
								dense
							/>
							<q-btn
								unelevated
								color="negative"
								class="w-full logout-btn"
								icon="logout"
								label="Logout"
								@click="handleLogout" />
							<q-btn
								unelevated
								color="primary"
								class="w-full back-btn"
								icon="home"
								label="Back to Home"
								@click="toHome" />
						</div>

						<!-- collapsed footer: show compact icons when collapsed -->
						<div v-else class="collapsed-footer-actions q-mt-sm flex flex-col items-center gap-2">
							<q-btn
								dense
								unelevated
								:color="$q.dark.isActive ? 'yellow-8' : 'blue-grey-7'"
								:icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
								@click="toggleDark"
								round
							/>
							<q-btn
								dense
								unelevated
								color="negative"
								icon="logout"
								@click="handleLogout"
								round
							/>
							<q-btn
								dense
								unelevated
								color="primary"
								icon="home"
								@click="toHome"
								round />
						</div>
					</div>
				</div>
			</div>
		</q-drawer>
	</div>
</template>

<script setup>
	import { ref, computed, watch, onMounted, onUnmounted } from "vue";
	import { useRouter, useRoute } from "vue-router";
	import { useQuasar } from "quasar";
	import { useUserStore } from "@/stores/user";
	import { useAuthStore } from "@/stores/auth";
	import LowStockAlertsMenu from "@/components/common/LowStockAlertsMenu.vue";

	const $q = useQuasar();
	const router = useRouter();
	const route = useRoute();
	const userStore = useUserStore();
	const authStore = useAuthStore();

	// UI state
	const drawer = ref(true);
	const collapsed = ref(false);
	const width = ref(260);
	const compactBreakpoint = 900;

	// Use Quasar screen (reactive) for responsiveness
	const isMobile = computed(() => {
		return $q && $q.screen
			? $q.screen.width < compactBreakpoint || $q.screen.lt.md
			: window.innerWidth < compactBreakpoint;
	});

	// computed drawer width
	const drawerWidth = computed(() => {
		if (isMobile.value) {
			const w = ($q && $q.screen && $q.screen.width) || window.innerWidth;
			return drawer.value ? Math.min(Math.floor(w * 0.86), 360) : 84;
		}
		return collapsed.value ? 84 : width.value;
	});

	// persist collapse preference
	const COLLAPSE_KEY = "sellerSidebarCollapsed";
	function saveCollapsed(v) {
		try {
			localStorage.setItem(COLLAPSE_KEY, v ? "1" : "0");
		} catch (e) {}
	}
	function loadCollapsed() {
		try {
			const v = localStorage.getItem(COLLAPSE_KEY);
			if (v === "1") return true;
			if (v === "0") return false;
		} catch (e) {}
		return null;
	}

	// safe localStorage access
	function safeGet(key, def = null) {
		try {
			if (typeof window === "undefined" || !window.localStorage) return def;
			return localStorage.getItem(key) ?? def;
		} catch (e) {
			return def;
		}
	}
	function safeGetNumber(key, def = 0) {
		const v = safeGet(key, null);
		return v == null ? def : Number(v);
	}

	// user
	const userName = computed(
		() => userStore?.name || safeGet("userName", "Seller")
	);
	const userRole = computed(
		() => userStore?.role || authStore.role || safeGet("role", safeGet("userRole", "manager"))
	);
	const initials = computed(() => {
		const n = userName.value || "S";
		return n
			.split(" ")
			.map((s) => s[0])
			.slice(0, 2)
			.join("")
			.toUpperCase();
	});
	const avatarStyle = computed(() => {
		const seed = (userName.value?.charCodeAt(0) || 40) % 360;
		return {
			background: `linear-gradient(135deg, hsl(${seed} 75% 48%), hsl(${
				(seed + 40) % 360
			} 70% 44%))`,
			color: "#fff",
		};
	});

	// menu
	const managerMenu = [
		{ to: "/seller/dashboard", icon: "dashboard", label: "Dashboard" },
		{ to: "/seller/products", icon: "inventory_2", label: "Products" },
		{
			to: "/seller/orders",
			icon: "assignment",
			label: "Orders",
			badge: safeGetNumber("sellerOrdersCount") || null,
			badgeColor: "accent",
		},
		{ to: "/seller/stock", icon: "inventory", label: "Update Stock" },
		{ to: "/seller/invoices", icon: "receipt_long", label: "Invoices" },
		{ to: "/seller/stock-ledger", icon: "trending_up", label: "Stock Ledger" },
		{ to: "/seller/returns", icon: "keyboard_return", label: "Returns" },
		{ to: "/seller/customers", icon: "people", label: "Customers" },
		{ to: "/seller/suppliers", icon: "local_shipping", label: "Suppliers" },
		{ to: "/seller/purchases", icon: "add_shopping_cart", label: "Purchases" },
		{ to: "/seller/reports", icon: "bar_chart", label: "Reports" },
		{ to: "/seller/profile", icon: "person", label: "Profile" },
	];
	const salesmanMenu = [
		{ to: "/sales/invoices", icon: "receipt_long", label: "Invoices" },
		{ to: "/sales/returns", icon: "keyboard_return", label: "Returns" },
		{ to: "/sales/customers", icon: "people", label: "Customers" },
	];
	const menu = computed(() => userRole.value === "salesman" ? salesmanMenu : managerMenu);

	function isActive(item) {
		if (!item?.to) return false;
		return route.path === item.to || route.path.startsWith(`${item.to}/`);
	}
	function go(item) {
		if (item.to) {
			router.push(item.to);
			if (isMobile.value) drawer.value = false;
		}
	}
	function toggle() {
		if (isMobile.value) {
			drawer.value = !drawer.value;
		} else {
			collapsed.value = !collapsed.value;
			saveCollapsed(collapsed.value);
		}
	}
	function toHome() {
		router.push("/");
	}
	function goToProfile() {
		router.push("/seller/profile");
	}
	function toggleDark() {
		$q.dark.toggle();
	}
	async function handleLogout() {
		try {
			await authStore.logout();
			router.push("/");
		} catch (error) {
			console.error("Seller logout failed", error);
		}
	}

	// ensure drawer only toggles on explicit user action
	function onDrawerModelUpdate(val) {
		drawer.value = Boolean(val);
		if (isMobile.value) {
			collapsed.value = !drawer.value;
		}
	}

	// keyboard: close drawer on Escape when mobile for accessibility
	function handleKeydown(e) {
		if (e.key === "Escape" && isMobile.value && drawer.value) {
			drawer.value = false;
		}
	}

	watch(
		isMobile,
		(mobile) => {
			const persisted = loadCollapsed();
			if (!mobile) {
				drawer.value = true;
				collapsed.value = persisted === null ? false : persisted;
				width.value = collapsed.value ? 84 : 260;
			} else {
				drawer.value = false;
				collapsed.value = true;
				width.value = 84;
			}
		},
		{ immediate: true }
	);

	// close drawer on navigation if mobile
	watch(
		() => route.path,
		() => {
			if (isMobile.value) drawer.value = false;
		}
	);

	onMounted(() => {
		width.value = collapsed.value ? 84 : 260;
		document.addEventListener("keydown", handleKeydown);
	});

	onUnmounted(() => {
		document.removeEventListener("keydown", handleKeydown);
	});
</script>

<style scoped>
	:root {
		--muted-white: rgba(255, 255, 255, 0.92);
		--muted-white-2: rgba(255, 255, 255, 0.72);
	}

	/* wrapper holds decorative background */
	.seller-sidebar-wrap {
		position: relative;
		z-index: 30;
	}

	/* mobile open button */
	.mobile-open-btn {
		position: fixed;
		left: 12px;
		top: 12px;
		z-index: 120;
		box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
		background: #1e293b;
		color: #a5b4fc;
	}

	/* decorative background — kept minimal, just a blur accent */
	.sidebar-bg {
		display: none;
	}

	/* ── DRAWER ─────────────────────────────────────────────── */
	.seller-drawer {
		background: #0f172a;
		color: #e2e8f0;
		border-right: 1px solid rgba(255, 255, 255, 0.05);
		box-shadow: 4px 0 28px rgba(0, 0, 0, 0.28);
		transition: width 180ms ease;
		will-change: width, transform;
	}

	/* inner layout */
	.inner {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	/* card that wraps all content */
	.drawer-card {
		display: flex;
		flex-direction: column;
		height: 100%;
		padding: 0 8px 8px;
	}

	/* ── BRAND ───────────────────────────────────────────────── */
	.brand {
		align-items: center;
		gap: 12px;
		padding: 20px 8px 12px;
	}
	.brand-avatar {
		border-radius: 14px;
		box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
		flex-shrink: 0;
		background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
	}
	.brand-avatar .q-icon {
		font-size: 26px;
		color: #fff !important;
	}
	.brand-title {
		font-weight: 700;
		font-size: 0.95rem;
		letter-spacing: 0.1px;
		color: #f1f5f9;
		line-height: 1.2;
	}
	.brand-sub {
		font-size: 0.7rem;
		color: #64748b;
		margin-top: 1px;
	}
	.toggle-btn {
		color: #64748b !important;
	}
	.toggle-btn:hover {
		color: #a5b4fc !important;
		background: rgba(165, 180, 252, 0.08) !important;
	}

	/* ── SEPARATOR ───────────────────────────────────────────── */
	:deep(.q-separator) {
		background: rgba(255, 255, 255, 0.06) !important;
	}

	/* ── MENU LIST ───────────────────────────────────────────── */
	.menu-list {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		padding: 4px 0;
		scrollbar-width: thin;
		scrollbar-color: rgba(255,255,255,0.08) transparent;
	}
	.menu-list::-webkit-scrollbar { width: 4px; }
	.menu-list::-webkit-scrollbar-track { background: transparent; }
	.menu-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }

	.menu-item {
		border-radius: 10px;
		margin: 2px 4px;
		padding: 6px 8px;
		min-height: 44px;
		cursor: pointer;
		color: #cbd5e1;
	}
	.menu-item:hover,
	.menu-item:focus-within {
		background: rgba(255, 255, 255, 0.07);
		color: #f1f5f9;
	}

	/* ACTIVE item */
	.menu-item.q-item--active {
		background: linear-gradient(90deg, rgba(99, 102, 241, 0.22), rgba(99, 102, 241, 0.1));
		color: #a5b4fc !important;
		box-shadow: none;
	}

	/* ── ICON WRAP ───────────────────────────────────────────── */
	.icon-wrap {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: 9px;
		background: rgba(255, 255, 255, 0.04);
		flex-shrink: 0;
	}
	.menu-item:hover .icon-wrap,
	.menu-item:focus-within .icon-wrap {
		background: rgba(255, 255, 255, 0.07);
	}
	.menu-item.q-item--active .icon-wrap {
		background: rgba(99, 102, 241, 0.28);
	}

	.menu-icon {
		font-size: 19px;
		color: #64748b;
	}
	.menu-item:hover .menu-icon,
	.menu-item:focus-within .menu-icon {
		color: #cbd5e1 !important;
	}
	.menu-item.q-item--active .menu-icon {
		color: #a5b4fc !important;
	}

	/* active left bar */
	.active-indicator {
		position: absolute;
		left: -10px;
		width: 3px;
		height: 20px;
		border-radius: 8px;
		background: #6366f1;
		box-shadow: 0 0 8px rgba(99, 102, 241, 0.6);
	}

	/* ── MENU TEXT ───────────────────────────────────────────── */
	.menu-text {
		padding-left: 10px;
	}
	.menu-label {
		font-size: 0.85rem;
		font-weight: 500;
		color: inherit;
		line-height: 1.3;
	}
	.menu-item.q-item--active .menu-label {
		font-weight: 600;
	}

	/* badge */
	.menu-badge {
		margin-left: 6px;
		font-size: 10px;
		font-weight: 700;
		border-radius: 999px;
		padding: 2px 7px;
		background: #6366f1 !important;
		color: #fff !important;
	}

	/* ── FOOTER ─────────────────────────────────────────────── */
	.footer {
		padding: 8px 4px 4px;
	}
	.footer-actions { margin-top: 6px; }
	.collapsed-footer-actions {
		display: flex;
		justify-content: center;
		margin-top: 6px;
	}

	/* back button */
	.logout-btn {
		border-radius: 10px;
		height: 40px;
		font-weight: 600;
		font-size: 0.8rem;
	}

	.back-btn {
		border-radius: 10px;
		height: 42px;
		font-weight: 600;
		font-size: 0.8rem;
		letter-spacing: 0.5px;
		background: linear-gradient(90deg, #6366f1, #7c3aed) !important;
		color: #fff !important;
		box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35) !important;
	}
	.back-btn:hover {
		box-shadow: 0 6px 18px rgba(99, 102, 241, 0.45) !important;
	}

	/* collapsed adjustments */
	.seller-drawer[style*="width: 84px"] .menu-item {
		justify-content: center;
		padding: 4px;
	}
	.seller-drawer[style*="width: 84px"] .brand-text,
	.seller-drawer[style*="width: 84px"] .user-meta,
	.seller-drawer[style*="width: 84px"] .footer-actions {
		display: none;
	}

	/* ── LIGHT THEME OVERRIDES ──────────────────────────────── */
	.seller-drawer--light {
		background: #ffffff !important;
		color: #1e293b !important;
		border-right: 1px solid #e2e8f0;
		box-shadow: 4px 0 24px rgba(15, 23, 42, 0.08);
	}
	.seller-drawer--light :deep(.q-separator) {
		background: #e2e8f0 !important;
	}
	.seller-drawer--light .brand-title {
		color: #1e293b;
	}
	.seller-drawer--light .brand-sub {
		color: #64748b;
	}
	.seller-drawer--light .toggle-btn {
		color: #64748b !important;
	}
	.seller-drawer--light .menu-item {
		color: #334155;
	}
	.seller-drawer--light .menu-item:hover,
	.seller-drawer--light .menu-item:focus-within {
		background: #f1f5f9;
		color: #0f172a;
	}
	.seller-drawer--light .menu-item.q-item--active {
		background: #eef2ff;
		color: #4f46e5 !important;
	}
	.seller-drawer--light .icon-wrap {
		background: #f1f5f9;
	}
	.seller-drawer--light .menu-item:hover .icon-wrap,
	.seller-drawer--light .menu-item:focus-within .icon-wrap {
		background: #e2e8f0;
	}
	.seller-drawer--light .menu-item.q-item--active .icon-wrap {
		background: #e0e7ff;
	}
	.seller-drawer--light .menu-icon {
		color: #64748b !important;
	}
	.seller-drawer--light .menu-item:hover .menu-icon,
	.seller-drawer--light .menu-item:focus-within .menu-icon {
		color: #1e293b !important;
	}
	.seller-drawer--light .menu-item.q-item--active .menu-icon {
		color: #4f46e5 !important;
	}
	.seller-drawer--light .active-indicator {
		background: #4f46e5;
		box-shadow: 0 0 6px rgba(79, 70, 229, 0.4);
	}

	/* ── MOBILE ──────────────────────────────────────────────── */
	@media (max-width: 900px) {
		.seller-drawer.mobile-light {
			background: #ffffff !important;
			color: #1e293b !important;
		}
		.seller-drawer.mobile-light .back-btn {
			background: #315f55 !important;
		}
	}

	/* Premium StyleHub palette overrides */
	.sidebar-bg { background: #edf0eb !important; }
	.drawer-card { border-radius: 0 !important; background: transparent !important; box-shadow: none !important; }
	.seller-drawer { border-right-color: rgba(24,33,29,.1) !important; }
	.seller-drawer--dark { background: #17241f !important; }
	.seller-drawer--light { background: #fbfcfa !important; border-right-color: #dfe4de !important; box-shadow: 7px 0 28px rgba(24,33,29,.075); }
	.brand-avatar { background: #315f55 !important; color: #fff !important; box-shadow: none !important; }
	.brand-title { letter-spacing: -.02em; }
	.seller-drawer--light .brand-title { color: #18211d; }
	.seller-drawer--light .brand-sub { color: #6d7871; }
	.seller-drawer--light .menu-item { color: #435048; }
	.seller-drawer--light .menu-item:hover,
	.seller-drawer--light .menu-item:focus-within { background: #edf2ef; color: #244a42; }
	.seller-drawer--light .menu-item.q-item--active { background: #e3ece7; color: #315f55 !important; }
	.seller-drawer--light .icon-wrap { background: #f0f2ee; }
	.seller-drawer--light .menu-item:hover .icon-wrap,
	.seller-drawer--light .menu-item:focus-within .icon-wrap,
	.seller-drawer--light .menu-item.q-item--active .icon-wrap { background: #d9e6df; }
	.seller-drawer--light .menu-icon,
	.seller-drawer--light .menu-item:hover .menu-icon,
	.seller-drawer--light .menu-item:focus-within .menu-icon,
	.seller-drawer--light .menu-item.q-item--active .menu-icon { color: #315f55 !important; }
	.seller-drawer--light .active-indicator { background: #987454; box-shadow: none; }
	.back-btn { background: #315f55 !important; box-shadow: none !important; }
	.back-btn:hover { background: #244a42 !important; box-shadow: none !important; }
	.mobile-open-btn { background: #315f55 !important; color: #fff !important; box-shadow: 0 8px 22px rgba(36,74,66,.22) !important; }
</style>
