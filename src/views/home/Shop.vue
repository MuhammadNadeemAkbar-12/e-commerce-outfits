<template>
	<q-page
		class="bg-gradient-to-br from-gray-50 to-white min-h-screen flex flex-col">
		<!-- HERO / NEW COLLECTIONS -->
		<section class="w-full bg-white py-16">
			<div class="max-w-7xl mx-auto px-4">
				<div class="text-center mb-12">
					<h1
						class="text-5xl md:text-6xl font-serif font-extrabold tracking-tight mb-4 text-gray-900 drop-shadow-lg">
						New Collections
					</h1>
					<p class="max-w-2xl mx-auto text-lg text-gray-600 mb-8">
						Discover the latest arrivals and timeless classics. Crafted with
						premium materials and designed for those who appreciate style,
						comfort, and quality.
					</p>
				</div>
				<div class="grid grid-cols-1 md:grid-cols-3 gap-10">
					<div
						v-for="item in heroCollections"
						:key="item.id"
						class="group bg-gradient-to-br from-gray-100 to-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden relative">
						<q-img
							:src="item.image"
							:alt="item.title"
							class="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-500"
							style="border-radius: 1.5rem 1.5rem 0 0"
							:ratio="4 / 5">
							<div
								class="absolute top-4 left-4 bg-white/80 px-4 py-1 rounded-full text-xs font-semibold text-gray-700 shadow">
								NEW
							</div>
						</q-img>
						<div class="p-6 flex flex-col gap-2">
							<div class="flex items-center gap-2">
								<span
									class="uppercase text-xs font-bold tracking-widest text-primary-700"
									>{{ item.tag }}</span
								>
								<q-badge
									v-if="item.limited"
									color="deep-orange"
									label="Limited"
									class="ml-2" />
							</div>
							<div
								class="font-serif text-2xl font-bold text-gray-900 mb-1 group-hover:text-primary-700 transition">
								{{ item.title }}
							</div>
							<div class="text-gray-500 text-base mb-3">{{ item.desc }}</div>
							<q-btn
								unelevated
								color="primary"
								class="w-max px-6 py-2 rounded-full font-semibold tracking-wide shadow hover:scale-105 transition"
								label="DISCOVER NOW"
								@click="discover(item)" />
						</div>
						<div
							class="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-primary-400 via-primary-200 to-primary-400 opacity-0 group-hover:opacity-100 transition"></div>
					</div>
				</div>
			</div>
		</section>

		<!-- FEATURES -->
		<section class="w-full bg-white py-12 border-b">
			<div
				class="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
				<div
					v-for="feature in features"
					:key="feature.title"
					class="flex flex-col items-center group">
					<q-icon
						:name="feature.icon"
						size="38px"
						class="mb-3 text-primary-700 group-hover:text-primary-900 transition" />
					<div class="font-semibold mb-1 text-gray-900">
						{{ feature.title }}
					</div>
					<div class="text-xs text-gray-500">{{ feature.desc }}</div>
				</div>
			</div>
		</section>

		<!-- CATEGORY HIGHLIGHTS -->
		<section class="w-full bg-gradient-to-br from-gray-50 to-white py-14">
			<div
				class="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-10">
				<div
					v-for="cat in categories"
					:key="cat.title"
					class="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden group">
					<q-img
						:src="cat.image"
						:alt="cat.title"
						class="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
						style="border-radius: 1.5rem 1.5rem 0 0" />
					<div class="p-6 flex-1 flex flex-col justify-between">
						<div>
							<div class="font-serif text-xl font-bold mb-1 text-gray-900">
								{{ cat.title }}
							</div>
							<div class="text-gray-500 text-base mb-2">{{ cat.desc }}</div>
						</div>
						<q-btn
							flat
							color="primary"
							:label="cat.cta"
							class="px-0 mt-2 font-semibold"
							@click="goToCategory(cat)" />
					</div>
				</div>
			</div>
		</section>

		<!-- NEW ARRIVALS -->
		<section class="w-full bg-white py-14">
			<div class="max-w-7xl mx-auto px-4">
				<div class="flex justify-between items-center mb-8">
					<h2
						class="text-2xl md:text-3xl font-serif font-bold tracking-wide text-gray-900">
						Our New Arrivals
					</h2>
					<router-link
						to="/shop"
						class="text-xs text-primary font-semibold uppercase tracking-wider hover:underline"
						>View All Products</router-link
					>
				</div>
				<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
					<div
						v-for="product in newArrivals"
						:key="product.id"
						class="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow group hover:shadow-xl transition flex flex-col overflow-hidden">
						<q-img
							:src="product.image"
							:alt="product.title"
							class="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-500"
							style="border-radius: 1rem 1rem 0 0" />
						<div class="p-5 flex-1 flex flex-col justify-between">
							<div>
								<div class="font-serif text-lg font-bold mb-1 text-gray-900">
									{{ product.title }}
								</div>
								<div class="text-gray-500 text-sm mb-2">
									{{ product.brand }}
								</div>
								<div class="flex items-center gap-2 mb-2">
									<q-rating
										:model-value="product.rating"
										max="5"
										size="18px"
										color="amber"
										readonly />
									<span class="text-xs text-gray-400"
										>({{ product.reviews }})</span
									>
								</div>
							</div>
							<div class="flex items-center justify-between mt-2">
								<div class="font-bold text-lg text-primary">
									{{ formatMoney(product.price) }}
								</div>
								<div class="flex gap-2">
									<q-btn
										dense
										round
										flat
										:icon="
											wishlist.includes(product.id)
												? 'favorite'
												: 'favorite_border'
										"
										:color="wishlist.includes(product.id) ? 'pink' : 'grey-6'"
										@click.stop="toggleWishlist(product.id)" />
									<q-btn
										dense
										round
										flat
										icon="shopping_cart"
										:color="
											cartStore.isInCart(product.id) ? 'primary' : 'grey-6'
										"
										@click.stop="addToCart(product.id)" />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- PRODUCT DETAIL DIALOG -->
		<q-dialog v-model="showDetail" persistent>
			<ProductDetail
				v-if="selectedProduct"
				:product="selectedProduct"
				@close="showDetail = false"
				@add-to-cart="addToCart"
				@toggle-wishlist="toggleWishlist"
				:in-cart="cartStore.isInCart(selectedProduct?.id)"
				:in-wishlist="wishlist.includes(selectedProduct?.id)" />
		</q-dialog>
	</q-page>
</template>

<script setup>
	import { ref } from "vue";
	import { formatMoney } from "@/utils/currency";
	import { useQuasar } from "quasar";
	import { useRouter } from "vue-router";
	import { useCartStore } from "../../stores/cart";
	import ProductDetail from "./shopproduct/ProductDetail.vue";

	const cartStore = useCartStore();

	// Premium Dummy Data
	const heroCollections = [
		{
			id: 1,
			image:
				"https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80",
			title: "Soft Leather Jackets",
			desc: "Experience the luxury of our new soft leather jackets, crafted for comfort and timeless style.",
			tag: "Outerwear",
			limited: true,
		},
		{
			id: 2,
			image:
				"https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
			title: "Urban Trench Coats",
			desc: "Step into the season with our urban trench coats, designed for elegance and versatility.",
			tag: "Coats",
			limited: false,
		},
		{
			id: 3,
			image:
				"https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80",
			title: "Wool Blend Blazers",
			desc: "Elevate your look with premium wool blend blazers, perfect for every occasion.",
			tag: "Blazers",
			limited: true,
		},
	];

	const features = [
		{
			icon: "event_available",
			title: "Book An Appointment",
			desc: "Personalized shopping experience with our style experts.",
		},
		{
			icon: "storefront",
			title: "Pick Up In Store",
			desc: "Order online and collect your favorites at your convenience.",
		},
		{
			icon: "redeem",
			title: "Special Packaging",
			desc: "Every order arrives in exclusive, eco-friendly packaging.",
		},
		{
			icon: "autorenew",
			title: "Free Global Returns",
			desc: "Shop with confidence with our hassle-free return policy.",
		},
	];

	const categories = [
		{
			title: "Shop for Men",
			desc: "Discover the latest in men's fashion, from casual to formal.",
			image:
				"https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80",
			cta: "Shop for Men",
		},
		{
			title: "Shop for Women",
			desc: "Explore our women's collection for every mood and moment.",
			image:
				"https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
			cta: "Shop for Women",
		},
		{
			title: "Shop Accessories",
			desc: "Complete your look with our curated accessories.",
			image:
				"https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80",
			cta: "Shop Accessories",
		},
	];

	const newArrivals = [
		{
			id: 101,
			image:
				"https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80",
			title: "Classic Men T-Shirt",
			brand: "Nike",
			price: 29.99,
			rating: 4.5,
			reviews: 120,
		},
		{
			id: 102,
			image:
				"https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
			title: "Women Summer Dress",
			brand: "Zara",
			price: 49.99,
			rating: 4.8,
			reviews: 98,
		},
		{
			id: 103,
			image:
				"https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80",
			title: "Kids Sneakers",
			brand: "Adidas",
			price: 39.99,
			rating: 4.2,
			reviews: 45,
		},
		{
			id: 104,
			image:
				"https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80",
			title: "Men Running Shoes",
			brand: "Puma",
			price: 89.99,
			rating: 4.7,
			reviews: 210,
		},
		{
			id: 105,
			image:
				"https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80",
			title: "Women Handbag",
			brand: "H&M",
			price: 59.99,
			rating: 4.9,
			reviews: 80,
		},
		{
			id: 106,
			image:
				"https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
			title: "Levis Jeans",
			brand: "Levis",
			price: 69.99,
			rating: 4.6,
			reviews: 150,
		},
		{
			id: 107,
			image:
				"https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80",
			title: "Soft Leather Jacket",
			brand: "Zara",
			price: 99.99,
			rating: 4.9,
			reviews: 200,
		},
		{
			id: 108,
			image:
				"https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80",
			title: "Summer Top",
			brand: "H&M",
			price: 34.99,
			rating: 4.3,
			reviews: 60,
		},
	];

	const wishlist = ref([]);
	const showDetail = ref(false);
	const selectedProduct = ref(null);

	const $q = useQuasar();
	const router = useRouter();

	function addToCart(productId) {
		const product = newArrivals.find((p) => p.id === productId);
		if (product) {
			const payload = {
				id: product.id,
				title: product.title,
				price: product.price,
				image: product.image,
				brand: product.brand,
				quantity: 1,
			};
			if (authStore.checkAuth()) {
				cartStore
					.syncAdd(payload)
					.then(() => {
						$q.notify({
							type: "positive",
							message: `${product.title} added to cart!`,
						});
					})
					.catch(() => {
						$q.notify({ type: "negative", message: "Add to cart failed" });
					});
			} else {
				cartStore.addToCart(payload);
				$q.notify({
					type: "positive",
					message: `${product.title} added to cart!`,
				});
			}
		}
	}
	function toggleWishlist(productId) {
		const idx = wishlist.value.indexOf(productId);
		if (idx === -1) {
			wishlist.value.push(productId);
			$q.notify({ type: "info", message: "Added to wishlist!" });
		} else {
			wishlist.value.splice(idx, 1);
			$q.notify({ type: "warning", message: "Removed from wishlist." });
		}
	}
	function discover(item) {
		$q.notify({ message: `Discover: ${item.title}` });
	}
	function goToCategory(cat) {
		if (cat.title.toLowerCase().includes("men")) {
			router.push("/men");
		} else if (cat.title.toLowerCase().includes("women")) {
			router.push("/women");
		} else if (cat.title.toLowerCase().includes("accessories")) {
			router.push("/accessories");
		} else {
			// fallback
			router.push("/");
		}
	}
	function goToCart() {
		$q.notify({ message: "Go to cart page (not implemented)" });
	}
	function goToWishlist() {
		$q.notify({ message: "Go to wishlist page (not implemented)" });
	}
	function goToProfile() {
		$q.notify({ message: "Go to profile page (not implemented)" });
	}
</script>

<style scoped>
	.q-header {
		position: sticky;
		top: 0;
		z-index: 50;
	}
</style>
