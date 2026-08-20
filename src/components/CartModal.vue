<template>
	<q-dialog v-model="showCartModal" persistent>
		<q-card class="cart-modal" style="width: 400px; max-width: 90vw">
			<q-card-section class="bg-primary text-white">
				<div class="text-h6">Shopping Cart</div>
				<q-btn
					flat
					round
					dense
					icon="close"
					class="absolute-top-right q-ma-sm"
					@click="closeModal" />
			</q-card-section>

			<q-card-section class="q-pa-none">
				<div v-if="cartStore.totalItems === 0" class="text-center q-pa-xl">
					<q-icon name="shopping_cart" size="64px" color="grey-4" />
					<div class="text-grey-6 q-mt-md">Your cart is empty</div>
					<q-btn
						color="primary"
						label="Continue Shopping"
						class="q-mt-md"
						@click="closeModal" />
				</div>

				<q-list v-else bordered separator>
					<q-item v-for="item in itemsRef" :key="item.id" class="q-pa-md">
						<q-item-section avatar>
							<q-img
								:src="resolveImageUrl(item.image)"
								:alt="item.title"
								width="60px"
								height="60px"
								style="border-radius: 8px" />
						</q-item-section>

						<q-item-section>
							<q-item-label class="text-weight-bold">{{
								item.title
							}}</q-item-label>
							<q-item-label caption>{{ item.brand }}</q-item-label>
							<q-item-label class="text-primary text-weight-bold"
								>${{ item.price }}</q-item-label
							>
						</q-item-section>

						<q-item-section side>
							<div class="row items-center">
								<q-btn
									dense
									flat
									icon="remove"
									size="sm"
									@click="updateQuantity(item.id, item.quantity - 1)"
									:disable="item.quantity <= 1" />
								<span class="q-mx-sm">{{ item.quantity }}</span>
								<q-btn
									dense
									flat
									icon="add"
									size="sm"
									@click="updateQuantity(item.id, item.quantity + 1)" />
							</div>
							<q-btn
								dense
								flat
								icon="delete"
								color="negative"
								size="sm"
								class="q-mt-xs"
								@click="removeFromCart(item.id)" />
						</q-item-section>
					</q-item>
				</q-list>
			</q-card-section>

			<q-card-section v-if="cartStore.totalItems > 0" class="bg-grey-2">
				<div class="row justify-between items-center q-mb-md">
					<div class="text-h6">Total:</div>
					<div class="text-h6 text-primary">
						${{ cartStore.totalPrice.toFixed(2) }}
					</div>
				</div>

				<div class="row q-gutter-sm">
					<q-btn
						color="primary"
						label="Checkout"
						class="col"
						@click="proceedToCheckout" />
					<q-btn
						color="grey"
						label="Continue Shopping"
						class="col"
						@click="closeModal" />
				</div>
			</q-card-section>
		</q-card>
	</q-dialog>
</template>

<script setup>
	import { ref, watch, onMounted, nextTick, computed } from "vue";
	import { useCartStore } from "../stores/cart";
	import { useQuasar } from "quasar";
	import { useAuthStore } from '@/stores/auth'

	const $q = useQuasar();
	const cartStore = useCartStore();
	const showCartModal = ref(false);
	const forceRenderKey = ref(0);
	const authStore = useAuthStore();

	// derive items from store and also listen to changeTick to force updates
	const itemsRef = computed(() => {
		// touch changeTick so updates to it force recompute
		// eslint-disable-next-line no-unused-expressions
		cartStore.changeTick;
		return cartStore.cartItems;
	});

	// image helpers (robust)
	function resolveImageUrl(u) {
		if (!u) return "https://cdn.quasar.dev/img/boy-avatar.png";
		if (typeof u !== "string")
			return "https://cdn.quasar.dev/img/boy-avatar.png";
		const s = u.trim();
		if (!s) return "https://cdn.quasar.dev/img/boy-avatar.png";
		if (/^https?:\/\//i.test(s)) return s;

		let apiBase = "/api";
		try {
			apiBase = import.meta?.env?.VITE_API_BASE_URL || window.__API_BASE_URL__ || apiBase;
		} catch (_) {}
		const baseUrl = String(apiBase).replace(/\/api\/?$/, "").replace(/\/$/, "");

		if (s.startsWith("/")) return `${baseUrl}/${s.replace(/^\/+/, "")}`;
		if (/^(storage|uploads|public)\//i.test(s) || s.includes("storage/")) {
			return `${baseUrl}/${s.replace(/^\/+/, "")}`;
		}
		return `${baseUrl}/storage/${s.replace(/^\/+/, "")}`;
	}

	const debugLog = () => {};

	const props = defineProps({
		modelValue: {
			type: Boolean,
			default: false,
		},
	});

	const emit = defineEmits(["update:modelValue"]);

	watch(
		() => props.modelValue,
		(newVal) => {
			showCartModal.value = newVal;
			if (newVal) {
				debugLog("Modal opened, cart items:", cartStore.cartItems);
				debugLog("Total items:", cartStore.totalItems);
			}
		}
	);

	watch(showCartModal, (newVal) => {
		emit("update:modelValue", newVal);
	});

	// Watch for cart changes and force re-render
	watch(
		() => cartStore.cartItems,
		(newItems, oldItems) => {
			debugLog("Cart items changed, forcing re-render", {
				oldItems: oldItems,
				newItems: newItems,
				totalItems: cartStore.totalItems,
				itemCount: cartStore.itemCount,
			});

			// Force re-render by updating the key
			forceRenderKey.value++;

			// Also trigger a manual check for modal updates
			if (showCartModal.value) {
				debugLog("Modal is open, checking for updates...");
				nextTick(() => {
					debugLog("Modal re-rendered with latest cart data");
					// Additional check to ensure the modal has the latest data
					debugLog("Current cart items in modal watch:", cartStore.cartItems);
				});
			}
		},
		{ deep: true }
	);

	// Watch for total items changes with immediate trigger
	watch(
		() => cartStore.totalItems,
		(newTotal, oldTotal) => {
			debugLog("Total items changed", { old: oldTotal, new: newTotal });
		},
		{ immediate: true }
	);

	// Watch for item count changes
	watch(
		() => cartStore.itemCount,
		(newCount, oldCount) => {
			debugLog("Item count changed", { old: oldCount, new: newCount });
		},
		{ immediate: true }
	);

	const closeModal = () => {
		showCartModal.value = false;
	};

	const updateQuantity = (productId, quantity) => {
		cartStore.updateQuantity(productId, quantity);
	};

	const removeFromCart = (productId) => {
		// If user is authenticated, syncRemove will update server and refetch canonical cart
		if (
			cartStore &&
			cartStore.fetchRemoteCart &&
			typeof cartStore.syncRemove === "function" &&
			authStore?.token
		) {
			cartStore
				.syncRemove(productId)
				.then(() => {
					if (cartStore.totalItems === 0)
						$q.notify({ type: "info", message: "Cart is now empty" });
				})
				.catch(() => {
					$q.notify({ type: "negative", message: "Remove failed" });
				});
		} else {
			cartStore.removeFromCart(productId);
			if (cartStore.totalItems === 0) {
				$q.notify({ type: "info", message: "Cart is now empty" });
			}
		}
	};

	const proceedToCheckout = () => {
		$q.notify({ type: "info", message: "Checkout functionality coming soon!" });
		closeModal();
	};

	// Debug method to check current state
	const debugModalState = () => {
		debugLog("=== MODAL STATE DEBUG ===");
		debugLog("Modal visible:", showCartModal.value);
		debugLog("Cart items in store:", cartStore.cartItems);
		debugLog("Total items:", cartStore.totalItems);
		debugLog("Force render key:", forceRenderKey.value);
		debugLog("=== END DEBUG ===");
	};

	// Expose debug method for testing
	defineExpose({
		debugModalState,
	});
</script>

<style scoped>
	.cart-modal {
		border-radius: 12px;
		overflow: hidden;
	}

	.q-item {
		transition: background-color 0.2s ease;
	}

	.q-item:hover {
		background-color: #f8f9fa;
	}
</style>
