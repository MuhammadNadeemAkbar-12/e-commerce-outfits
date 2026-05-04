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
			:class="['seller-drawer', { 'mobile-light': isMobile }]"
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
								:size="collapsed ? 44 : 48"
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
						<div v-if="!collapsed" class="q-mt-sm footer-actions">
							<q-btn
								unelevated
								color="primary"
								class="w-full back-btn"
								icon="home"
								label="Back to Home"
								@click="toHome" />
						</div>

						<!-- collapsed footer: show compact Home icon when collapsed -->
						<div v-else class="collapsed-footer-actions q-mt-sm">
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

	const $q = useQuasar();
	const router = useRouter();
	const route = useRoute();
	const userStore = useUserStore();

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
		() => userStore?.role || safeGet("userRole", "Seller")
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
	const menu = [
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
		{ to: "/seller/reports", icon: "bar_chart", label: "Reports" },
		{ to: "/seller/audit-logs", icon: "history", label: "Audit Logs" },
		{ to: "/seller/profile", icon: "person", label: "Profile" },
	];

	function isActive(item) {
		return route.path.startsWith(item.to);
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
		/* local color variables for easier tweaking */
		--sb-primary-1: 6 86% 40%;
		--sb-primary-2: 205 95% 50%;
		--glass-alpha: 0.06;
		--muted-white: rgba(255, 255, 255, 0.92);
		--muted-white-2: rgba(255, 255, 255, 0.82);
	}

	/* wrapper holds decorative background */
	.seller-sidebar-wrap {
		position: relative;
		z-index: 30;
		--shadow-strong: 0 18px 48px rgba(2, 6, 23, 0.22);
		padding-left: 6px; /* small inset so card shadow is visible on left */
	}

	/* mobile open button */
	.mobile-open-btn {
		position: fixed;
		left: 12px;
		top: 12px;
		z-index: 120;
		box-shadow: 0 8px 22px rgba(2, 6, 23, 0.14);
		background: #fff;
		color: #0b63d6;
		transition: none;
	}
	:deep(body.q-dark) .mobile-open-btn {
		background: rgba(255, 255, 255, 0.06);
		color: #cfe6ff;
	}

	/* decorative background behind sidebar (subtle, premium) */
	.sidebar-bg {
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 340px;
		background: radial-gradient(
				circle at 18% 20%,
				rgba(255, 255, 255, 0.03),
				transparent 18%
			),
			linear-gradient(
				180deg,
				hsla(var(--sb-primary-1) / 0.95),
				hsla(var(--sb-primary-2) / 0.93)
			);
		filter: blur(30px);
		transform: translateX(-44px);
		pointer-events: none;
		z-index: 1;
		border-right: 1px solid rgba(255, 255, 255, 0.03);
		opacity: 0.95;
	}

	/* drawer styling */
	.seller-drawer {
		background: linear-gradient(
			180deg,
			rgba(3, 105, 161, 0.98) 0%,
			rgba(22, 116, 250, 0.96) 100%
		);
		color: #fff;
		transition: width 180ms ease, box-shadow 180ms ease;
		box-shadow: none;
		border-right: 0;
		overflow: visible; /* allow outer shadow */
		position: relative;
		backdrop-filter: blur(6px);
		will-change: width, transform;
		padding: 8px 0; /* make space for card margin */
	}

	/* inner layout */
	.inner {
		display: flex;
		flex-direction: column;
		height: 100%;
		position: relative;
	}

	/* visual card which contains the sidebar content */
	.drawer-card {
		background: linear-gradient(
			180deg,
			rgba(255, 255, 255, 0.02),
			rgba(255, 255, 255, 0.01)
		);
		border-radius: 12px;
		padding: 8px 8px;
		margin: 6px 8px;
		box-shadow: 0 14px 40px rgba(2, 6, 23, 0.18);
		border: 1px solid rgba(255, 255, 255, 0.04);
		display: flex;
		flex-direction: column;
		height: calc(100% - 12px);
		overflow: hidden;
	}

	/* brand */
	.brand {
		align-items: center;
		gap: 12px;
		padding-top: 6px;
		padding-bottom: 6px;
	}
	.brand-avatar {
		border-radius: 12px;
		box-shadow: 0 12px 28px rgba(2, 6, 23, 0.18);
		display: flex;
		align-items: center;
		justify-content: center;
		color: #fff;
	}
	.brand-title {
		font-weight: 800;
		font-size: 1rem;
		letter-spacing: 0.2px;
		color: var(--muted-white);
	}
	.brand-sub {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.82);
		margin-top: -2px;
	}

	/* toggle */
	.toggle-btn {
		color: rgba(255, 255, 255, 0.96);
	}
	.toggle-btn .q-icon {
		color: var(--muted-white) !important;
	}

	/* menu */
	.menu-list {
		margin-top: 10px;
		padding: 4px;
		overflow: auto;
	}
	.menu-item {
		border-radius: 10px;
		margin: 6px;
		cursor: pointer;
		padding: 8px 6px;
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.menu-item:hover,
	.menu-item:focus-within {
		background: rgba(255, 255, 255, 0.02);
	}

	/* enhanced hover / active visuals */
	.menu-item:hover,
	.menu-item:focus-within {
		background: linear-gradient(
			90deg,
			rgba(255, 255, 255, 0.03),
			rgba(255, 255, 255, 0.02)
		);
		transform: translateX(3px);
		box-shadow: 0 6px 18px rgba(2, 6, 23, 0.06);
	}

	.menu-item.q-item--active {
		background: linear-gradient(
			90deg,
			rgba(255, 255, 255, 0.06),
			rgba(255, 255, 255, 0.03)
		);
		box-shadow: 0 12px 30px rgba(2, 6, 23, 0.14);
	}
	.menu-item.q-item--active {
		background: linear-gradient(
			90deg,
			rgba(255, 255, 255, 0.04),
			rgba(255, 255, 255, 0.02)
		);
		box-shadow: 0 10px 22px rgba(2, 6, 23, 0.12);
	}

	/* icon wrapper to center inside collapsed mode and to show active indicator */
	.icon-wrap {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		border-radius: 10px;
	}
	.menu-icon {
		font-size: 20px;
		color: rgba(255, 255, 255, 0.95);
	}
	.active-indicator {
		position: absolute;
		left: -12px;
		width: 6px;
		height: 26px;
		border-radius: 8px;
		background: linear-gradient(
			180deg,
			rgba(255, 255, 255, 0.98),
			rgba(255, 255, 255, 0.85)
		);
		box-shadow: 0 8px 20px rgba(2, 6, 23, 0.18);
		transition: height 180ms ease, background 180ms ease, left 140ms ease;
	}

	/* text */
	.menu-text {
		padding-left: 6px;
	}

	/* badge */
	.menu-badge {
		margin-left: 8px;
		padding: 6px 10px;
		border-radius: 999px;
		font-weight: 800;
		font-size: 12px;
		box-shadow: 0 8px 20px rgba(2, 6, 23, 0.12);
		color: white !important;
		background: rgba(255, 255, 255, 0.12) !important;
	}

	/* user footer */
	.footer {
		padding-top: 12px;
	}
	.user-row {
		align-items: center;
		gap: 10px;
	}
	.user-avatar {
		box-shadow: 0 8px 24px rgba(2, 6, 23, 0.12);
		font-weight: 700;
	}
	.user-name {
		font-weight: 700;
		color: var(--muted-white);
	}
	.user-role {
		color: rgba(255, 255, 255, 0.82);
		font-size: 12px;
	}

	/* profile button */
	.profile-wrap {
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.profile-btn {
		color: rgba(255, 255, 255, 0.95);
	}
	.footer-actions {
		margin-top: 10px;
	}
	.collapsed-footer-actions {
		display: flex;
		justify-content: center;
		margin-top: 10px;
	}

	/* back button pill styling */
	.back-btn {
		border-radius: 999px;
		height: 44px;
		font-weight: 700;
		box-shadow: 0 8px 18px rgba(2, 6, 23, 0.12);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
	}
	.back-btn .q-icon {
		margin-right: 6px;
	}

	/* collapsed adjustments */
	.seller-drawer[style*="width: 84px"] .menu-item {
		justify-content: center;
		padding-left: 6px;
		padding-right: 6px;
	}
	.seller-drawer[style*="width: 84px"] .brand-text,
	.seller-drawer[style*="width: 84px"] .user-meta,
	.seller-drawer[style*="width: 84px"] .footer-actions {
		display: none;
	}

	/* ensure icons visible and crisp */
	.menu-icon,
	.q-btn .q-icon,
	.brand-avatar .q-icon,
	.user-avatar .q-icon {
		color: var(--muted-white) !important;
		fill: currentColor !important;
		stroke: currentColor !important;
		transition: transform 160ms ease, color 160ms ease;
	}

	.menu-item:hover .menu-icon,
	.menu-item.q-item--active .menu-icon {
		transform: translateX(2px) scale(1.03);
		color: #fff !important;
	}

	/* responsive tweaks */
	@media (max-width: 900px) {
		.seller-sidebar-wrap .sidebar-bg {
			width: 180px;
			transform: translateX(-20px);
			filter: blur(22px);
		}
		.menu-icon {
			font-size: 22px;
		}
		.brand-sub {
			display: none;
		}
	}

	/* Mobile light mode so white text is not on white background */
	@media (max-width: 900px) {
		.seller-drawer.mobile-light {
			/* light glass background */
			background: rgba(255, 255, 255, 0.9) !important;
			backdrop-filter: blur(8px);
			color: #1e293b !important;
		}

		.seller-drawer.mobile-light .drawer-card {
			background: linear-gradient(
					180deg,
					rgba(255, 255, 255, 0.95),
					rgba(245, 247, 250, 0.92)
				),
				linear-gradient(
					180deg,
					rgba(255, 255, 255, 0.95),
					rgba(245, 247, 250, 0.92)
				);
			border: 1px solid rgba(0, 0, 0, 0.06);
			box-shadow: 0 8px 28px rgba(0, 0, 0, 0.15);
		}

		/* Text */
		.seller-drawer.mobile-light .brand-title,
		.seller-drawer.mobile-light .brand-sub,
		.seller-drawer.mobile-light .menu-label,
		.seller-drawer.mobile-light .menu-item .q-item__label,
		.seller-drawer.mobile-light .user-name,
		.seller-drawer.mobile-light .user-role,
		.seller-drawer.mobile-light .menu-badge {
			color: #1e293b !important;
		}

		/* Icons */
		.seller-drawer.mobile-light .menu-icon,
		.seller-drawer.mobile-light .q-icon,
		.seller-drawer.mobile-light .brand-avatar .q-icon,
		.seller-drawer.mobile-light .user-avatar .q-icon {
			color: #0f5298 !important;
			fill: currentColor !important;
		}

		/* Active menu item */
		.seller-drawer.mobile-light .menu-item.q-item--active {
			background: linear-gradient(90deg, #e2ecf9, #dde7f4);
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
		}
		.seller-drawer.mobile-light .active-indicator {
			background: #0f5298;
			box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
		}

		/* Toggle / buttons */
		.seller-drawer.mobile-light .toggle-btn,
		.seller-drawer.mobile-light .profile-btn,
		.seller-drawer.mobile-light .back-btn,
		.seller-drawer.mobile-light .collapsed-footer-actions .q-btn {
			color: #0f5298 !important;
		}

		/* Avatar text stays white on gradient */
		.seller-drawer.mobile-light .user-avatar,
		.seller-drawer.mobile-light .brand-avatar {
			color: #fff !important;
		}
	}
</style>
