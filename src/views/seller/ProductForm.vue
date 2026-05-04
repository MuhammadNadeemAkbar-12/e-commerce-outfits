<template>
	<div class="p-4 max-w-[1200px] mx-auto">
		<!-- Header -->
		<div
			class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
			<div class="flex items-center gap-4">
				<div>
					<h2 class="text-2xl font-semibold text-slate-800">Seller Products</h2>
					<p class="text-sm text-slate-500">
						Manage your products — search, edit, and delete.
					</p>
				</div>

				<!-- Search -->
				<div class="relative">
					<input
						v-model="search"
						@input="onSearch"
						placeholder="Search by name or description..."
						class="pl-10 pr-4 py-2 w-72 rounded-lg border bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200" />
					<svg
						class="absolute left-3 top-2.5 w-5 h-5 text-slate-300"
						viewBox="0 0 24 24"
						fill="none"
						aria-hidden>
						<path
							d="M21 21l-4.35-4.35"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round" />
						<circle
							cx="11"
							cy="11"
							r="5"
							stroke="currentColor"
							stroke-width="2" />
					</svg>
				</div>
			</div>

			<div class="flex items-center gap-3">
				<div class="text-sm text-slate-600 mr-2">
					Total: <span class="font-semibold text-slate-800">{{ total }}</span>
				</div>
				<button
					@click="openCreateModal"
					class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-lg shadow hover:shadow-lg transition-transform transform hover:-translate-y-0.5">
					<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden>
						<path
							d="M12 5v14M5 12h14"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round" />
					</svg>
					Add product
				</button>
			</div>
		</div>

		<!-- Toast -->
		<transition name="fade">
			<div
				v-if="toast.message"
				:class="toastClass"
				class="fixed right-6 top-6 z-50 px-4 py-2 rounded-md text-white shadow-lg">
				{{ toast.message }}
			</div>
		</transition>

		<!-- Loading / Error -->
		<div v-if="loading" class="grid gap-4">
			<div
				v-for="n in 4"
				:key="n"
				class="animate-pulse h-20 rounded-lg bg-slate-100"></div>
		</div>

		<div
			v-else-if="error"
			class="p-4 bg-rose-50 text-rose-700 rounded-lg shadow-sm">
			{{ error }}
		</div>

		<!-- Table -->
		<div v-else class="bg-white rounded-lg shadow-md overflow-hidden">
			<div class="flex items-center justify-between p-4 border-b">
				<div class="flex items-center gap-3">
					<label class="flex items-center gap-2 text-sm text-slate-600">
						<input
							type="checkbox"
							v-model="selectAll"
							@change="toggleAll"
							class="accent-sky-500" />
						<span>All</span>
					</label>

					<div class="flex items-center gap-2 text-sm text-slate-600">
						<span>Sort</span>
						<select v-model="sortBy" class="px-2 py-1 border rounded-md">
							<option value="newest">Newest</option>
							<option value="oldest">Oldest</option>
						</select>
					</div>
				</div>

				<div class="flex items-center gap-3">
					<div class="text-sm">
						Page: <strong>{{ currentPage }}</strong>
					</div>
				</div>
			</div>

			<div class="overflow-auto">
				<table class="min-w-full divide-y">
					<thead class="bg-slate-50">
						<tr>
							<th class="p-3 text-left text-sm text-slate-600">Product</th>
							<th class="p-3 text-right text-sm text-slate-600">Price</th>
							<th class="p-3 text-left text-sm text-slate-600">Status</th>
							<th class="p-3 text-center text-sm text-slate-600">Actions</th>
						</tr>
					</thead>

					<tbody class="bg-white divide-y">
						<tr
							v-for="prod in displayedProducts"
							:key="prod.id"
							class="hover:bg-slate-50">
							<td class="p-4 flex items-start gap-3">
								<!-- show all images returned from backend -->
								<img
									v-for="(imgObj, idx) in prod.images"
									:key="imgObj.id || imgObj.image_path || imgObj.url || idx"
									:src="resolveImageUrl(imgObj)"
									@error="(e) => (e.target.src = PLACEHOLDER_IMAGE)"
									class="w-14 h-14 rounded-lg object-cover border"
									alt="thumb" />
								<div class="min-w-0">
									<div class="font-medium text-slate-800 truncate">
										{{ prod.name }}
									</div>
									<div class="text-xs text-slate-400 mt-1 line-clamp-2">
										{{ prod.description || "—" }}
									</div>
								</div>
							</td>

							<td class="p-4 text-right text-sky-600 font-semibold">
								${{ formatPrice(prod.price) }}
							</td>

							<td class="p-4">
								<span
									:class="statusClass(prod)"
									class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold">
									{{ statusLabel(prod) }}
								</span>
							</td>

							<td class="p-4 text-center">
								<div class="inline-flex items-center gap-2">
									<button
										@click="openEditModal(prod)"
										title="Edit"
										class="flex items-center justify-center w-9 h-9 rounded-md bg-gradient-to-b from-slate-800 to-slate-700 text-white shadow hover:brightness-105 transition">
										<svg
											class="w-4 h-4"
											viewBox="0 0 24 24"
											fill="none"
											aria-hidden>
											<path
												d="M3 21v-3l11-11 3 3-11 11H3z"
												stroke="currentColor"
												stroke-width="1.5"
												stroke-linecap="round"
												stroke-linejoin="round" />
										</svg>
									</button>

									<button
										@click="confirmDeleteModal(prod)"
										title="Delete"
										class="flex items-center justify-center w-9 h-9 rounded-md bg-rose-600 text-white shadow hover:bg-rose-700 transition">
										<svg
											class="w-4 h-4"
											viewBox="0 0 24 24"
											fill="none"
											aria-hidden>
											<path
												d="M3 6h18M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6M10 6V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2"
												stroke="currentColor"
												stroke-width="1.5"
												stroke-linecap="round"
												stroke-linejoin="round" />
										</svg>
									</button>
								</div>
							</td>
						</tr>

						<tr v-if="displayedProducts.length === 0">
							<td class="p-6 text-center text-sm text-slate-500" colspan="4">
								No products found.
							</td>
						</tr>
					</tbody>
				</table>
			</div>

			<div class="p-4 flex items-center justify-between border-t">
				<div class="text-sm text-slate-600">
					Records per page:
					<select
						v-model.number="perPage"
						@change="onPerPageChange"
						class="ml-2 border rounded px-2 py-1">
						<option v-for="o in perPageOptions" :key="o" :value="o">
							{{ o }}
						</option>
					</select>
				</div>

				<div class="flex items-center gap-2">
					<button
						@click="prevPage"
						:disabled="currentPage === 1"
						class="px-3 py-1 border rounded-l bg-white disabled:opacity-50">
						‹
					</button>
					<div class="px-3 py-1 border-t border-b">
						{{ currentPage }} / {{ totalPages }}
					</div>
					<button
						@click="nextPage"
						:disabled="currentPage === totalPages"
						class="px-3 py-1 border rounded-r bg-white disabled:opacity-50">
						›
					</button>
				</div>
			</div>
		</div>

		<!-- Create/Edit modal -->
		<transition name="scale-fade">
			<div
				v-if="showModal"
				class="fixed inset-0 z-50 flex items-center justify-center p-4">
				<div class="absolute inset-0 bg-black/40" @click="closeModal"></div>

				<div
					class="relative w-[920px] max-w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
					<div class="flex items-center justify-between px-6 py-4 border-b">
						<div>
							<h3 class="text-lg font-semibold text-slate-800">
								{{ editingProductId ? "Edit product" : "Create product" }}
							</h3>
							<p class="text-sm text-slate-500 mt-1">
								Upload image files (multipart/form-data). No manual URL/path
								inputs.
							</p>
						</div>
						<button
							@click="closeModal"
							class="text-slate-400 hover:text-slate-700 p-2">
							✕
						</button>
					</div>

					<form
						@submit.prevent="saveProduct"
						class="grid grid-cols-1 md:grid-cols-3 gap-6 p-6"
						novalidate>
						<div class="md:col-span-2 space-y-4">
							<div>
								<label class="block text-sm font-medium text-slate-700"
									>Name <span class="text-rose-500">*</span></label
								>
								<input
									v-model.trim="productForm.name"
									class="mt-2 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-200" />
								<div v-if="formErrors.name" class="text-rose-600 text-sm mt-1">
									{{ formErrors.name }}
								</div>
							</div>

							<div>
								<label class="block text-sm font-medium text-slate-700"
									>Description</label
								>
								<textarea
									v-model="productForm.description"
									rows="4"
									class="mt-2 w-full px-4 py-2 border rounded-lg"></textarea>
								<div
									v-if="formErrors.description"
									class="text-rose-600 text-sm mt-1">
									{{ formErrors.description }}
								</div>
							</div>

							<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label class="block text-sm font-medium text-slate-700"
										>Price <span class="text-rose-500">*</span></label
									>
									<input
										v-model.number="productForm.price"
										type="number"
										min="0"
										step="0.01"
										class="mt-2 w-48 px-4 py-2 border rounded-lg" />
									<div
										v-if="formErrors.price"
										class="text-rose-600 text-sm mt-1">
										{{ formErrors.price }}
									</div>
								</div>

								<div>
									<label class="block text-sm font-medium text-slate-700"
										>Category <span class="text-rose-500">*</span></label
									>
									<select
										v-model="productForm.category_id"
										class="mt-2 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-200">
										<option value="">Select category...</option>
										<option
											v-for="cat in categories"
											:key="cat.id"
											:value="cat.id">
											{{ cat.name }}
										</option>
									</select>
									<div
										v-if="formErrors.category_id"
										class="text-rose-600 text-sm mt-1">
										{{ formErrors.category_id }}
									</div>
								</div>
							</div>
						</div>

						<div class="space-y-4">
							<div class="border rounded-lg p-3 bg-slate-50">
								<label class="block text-sm font-medium text-slate-700 mb-2"
									>Images</label
								>

								<!-- multiple attribute to allow selecting multiple images -->
								<input
									type="file"
									accept="image/*"
									multiple
									@change="onFilesChange"
									class="block w-full text-sm" />
								<div class="text-xs text-slate-500 mt-2">
									Choose image files to upload. Existing images (if any) are
									shown below; click ✕ to remove them from the product.
								</div>

								<!-- selected previews -->
								<div v-if="imagePreviews.length" class="mt-3">
									<div class="text-xs text-slate-700 mb-1">
										Selected image preview:
									</div>
									<div class="flex gap-2">
										<img
											v-for="(p, i) in imagePreviews"
											:key="'testpv-' + i"
											:src="p"
											class="w-30 h-24 object-cover border rounded" />
									</div>
								</div>

								<div class="mt-3 grid grid-cols-3 gap-2">
									

									<!-- existing images returned from server -->
									<div
										v-for="(e, i) in filteredExistingImages"
										:key="'ex-' + i"
										class="w-full h-20 rounded overflow-hidden border bg-white relative">
										<img
											:src="resolveImageUrl(e)"
											class="w-full h-full object-cover" />
										<button
											type="button"
											@click="markExistingRemoved(e._idx)"
											class="absolute top-1 right-1 bg-white/70 rounded-full p-1 text-rose-600">
											Delete
										</button>
									</div>

									<!-- removed existing images list -->
									<!-- <div
										v-for="(e, i) in removedExistingImages"
										:key="'ex-rem-' + i"
										class="w-full h-20 rounded overflow-hidden border bg-rose-50 flex items-center justify-center text-rose-600 text-xs">
										Delete
										
									</div> -->
								</div>

								<div
									v-if="formErrors.images"
									class="text-rose-600 text-sm mt-2">
									{{ formErrors.images }}
								</div>
							</div>

							<div class="flex items-center gap-3 justify-end">
								<button
									type="button"
									@click="closeModal"
									class="px-4 py-2 rounded-lg bg-neutral-100">
									Cancel
								</button>
								<button
									type="submit"
									:disabled="savingProduct"
									class="px-4 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow">
									<span
										v-if="savingProduct"
										class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
									{{ editingProductId ? "Update product" : "Create product" }}
								</button>
							</div>
						</div>
					</form>

					<div
						v-if="modalError"
						class="px-6 py-3 text-sm text-rose-600 border-t">
						{{ modalError }}
					</div>
				</div>
			</div>
		</transition>

		<!-- Delete confirm -->
		<transition name="scale-fade">
			<div
				v-if="deleteConfirmId"
				class="fixed inset-0 z-50 flex items-center justify-center p-4">
				<div class="absolute inset-0 bg-black/40" @click="cancelDelete"></div>
				<div class="relative w-[420px] bg-white rounded-lg shadow-xl p-5">
					<h4 class="text-lg font-semibold">Confirm deletion</h4>
					<p class="text-sm text-slate-500 mt-2">
						Delete product <strong>{{ productToDelete?.name }}</strong
						>? This action cannot be undone.
					</p>
					<div class="flex justify-end gap-3 mt-4">
						<button
							@click="cancelDelete"
							class="px-4 py-2 rounded-md bg-neutral-100">
							Cancel
						</button>
						<button
							@click="performDelete"
							:disabled="deleting"
							class="px-4 py-2 rounded-md bg-rose-600 text-white">
							Delete
						</button>
					</div>
				</div>
			</div>
		</transition>
	</div>
</template>

<script setup>
	import { ref, reactive, onMounted, watch, computed } from "vue";
	import axios from "@/api/axios"; // use shared instance

	/* base url (backend) - used to build image URLs when server returns relative paths */
	const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://13.60.188.147";

	/* core state */
	const products = ref([]);
	const loading = ref(false);
	const error = ref(null);

	const search = ref("");
	const selected = ref([]);
	const selectAll = ref(false);

	const currentPage = ref(1);
	const perPage = ref(8);
	const perPageOptions = [8, 16, 32];
	const total = ref(0);
	const sortBy = ref("newest");

	const totalPages = computed(() =>
		perPage.value > 0 ? Math.max(1, Math.ceil(total.value / perPage.value)) : 1
	);

	/* modal/form */
	const showModal = ref(false);
	const editingProductId = ref(null);
	const productForm = reactive({
		name: "",
		description: "",
		price: 0,
		is_approved: false,
		is_blocked: false,
		category_id: null,
	});
	const formErrors = reactive({
		name: "",
		description: "",
		price: "",
		images: "",
		category_id: "",
	});
	const modalError = ref(null);
	const savingProduct = ref(false);

	/* images + delete + toast */
	const selectedFiles = ref([]); // File[]
	const imagePreviews = ref([]); // object URLs

	/* existingImages holds server-returned image objects:
   Each entry: { id?, image_path?, url, removed: boolean }
*/
	const existingImages = ref([]);

	const deleteConfirmId = ref(null);
	const deleting = ref(false);
	const productToDelete = ref(null);

	const toast = reactive({ message: "", type: "info" });
	function showToast(message, type = "info", ms = 3000) {
		toast.message = message;
		toast.type = type;
		setTimeout(() => (toast.message = ""), ms);
	}
	const toastClass = computed(() => {
		if (!toast.message) return "";
		return toast.type === "success"
			? "bg-emerald-600"
			: toast.type === "error"
			? "bg-rose-600"
			: "bg-sky-500";
	});

	/* helpers */
	function formatPrice(p) {
		try {
			return Number(p).toFixed(2);
		} catch {
			return p;
		}
	}
	function statusLabel(prod) {
		if (prod.is_blocked) return "BLOCKED";
		if (prod.is_approved) return "APPROVED";
		return "PENDING";
	}
	function statusClass(prod) {
		return prod.is_blocked
			? "bg-rose-100 text-rose-700"
			: prod.is_approved
			? "bg-emerald-100 text-emerald-700"
			: "bg-sky-100 text-sky-700";
	}

	const PLACEHOLDER_IMAGE =
		"data:image/svg+xml;utf8," +
		encodeURIComponent(
			'<svg xmlns="http://www.w3.org/2000/svg" width="120" height="90" viewBox="0 0 120 90"><rect width="100%" height="100%" fill="#eef7f2"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9aa9a0" font-size="12">No image</text></svg>'
		);

	/* resolveImageUrl: accepts object or string, prefer object.url if present */
	function resolveImageUrl(u) {
		if (!u) return PLACEHOLDER_IMAGE;

		// if passed an object like { url, image_path }
		if (typeof u === "object") {
			const url = (
				u.url ||
				u.image_path ||
				u.path ||
				u.location ||
				""
			).toString();
			if (!url) return PLACEHOLDER_IMAGE;
			if (url.startsWith("http://") || url.startsWith("https://")) return url;
			const clean = url.replace(/^\/+/, "");
			return `${BASE_URL}/${clean}`;
		}

		// u is string
		if (typeof u !== "string") return PLACEHOLDER_IMAGE;
		const s = u.trim();
		if (!s) return PLACEHOLDER_IMAGE;
		if (s.startsWith("http://") || s.startsWith("https://")) return s;
		const clean = s.replace(/^\/+/, "");
		return `${BASE_URL}/${clean}`;
	}

	/* unique helper for objects/strings by url or image_path */
	function uniqueStrings(arr) {
		const seen = new Set();
		const out = [];
		for (const it of arr) {
			if (!it) continue;
			const key =
				typeof it === "string"
					? it
					: (it.url || it.image_path || "").toString();
			const k = (key || "").trim();
			if (!k) continue;
			if (seen.has(k)) continue;
			seen.add(k);
			out.push(it);
		}
		return out;
	}

	/* files preview handler - dedupe by name+size, append to selectedFiles but avoid duplicates */
	function onFilesChange(e) {
		const files = Array.from(e.target.files || []);
		if (!files.length) {
			e.target.value = "";
			return;
		}

		// avoid adding duplicates (by name+size)
		const existingMap = new Set(
			selectedFiles.value.map((f) => `${f.name}::${f.size}`)
		);
		const newFiles = [];
		for (const f of files) {
			const key = `${f.name}::${f.size}`;
			if (!existingMap.has(key)) {
				existingMap.add(key);
				newFiles.push(f);
			}
		}

		if (newFiles.length === 0) {
			// nothing new to add
			e.target.value = "";
			return;
		}

		// append unique new files
		selectedFiles.value = selectedFiles.value.concat(newFiles);

		// rebuild previews (revoke old URLs first)
		imagePreviews.value.forEach((u) => {
			try {
				URL.revokeObjectURL(u);
			} catch {}
		});
		imagePreviews.value = selectedFiles.value.map((f) =>
			URL.createObjectURL(f)
		);

		e.target.value = "";
		formErrors.images = "";
		modalError.value = null;
	}

	/* existing images removal toggles */
	function markExistingRemoved(idx) {
		const item = existingImages.value[idx];
		if (!item) return;
		existingImages.value[idx] = { ...(item || {}), removed: true };
	}
	function unmarkExistingRemoved(idx) {
		const item = existingImages.value[idx];
		if (!item) return;
		existingImages.value[idx] = { ...(item || {}), removed: false };
	}

	const filteredExistingImages = computed(() =>
		existingImages.value
			.map((img, idx) => ({ ...img, _idx: idx }))
			.filter((img) => img && !img.removed)
	);

	const removedExistingImages = computed(() =>
		existingImages.value
			.map((img, idx) => ({ ...img, _idx: idx }))
			.filter((img) => img && img.removed)
	);

	/* fetch products and normalize images to objects with url + image_path */
	async function fetchProducts() {
		loading.value = true;
		error.value = null;
		try {
			const res = await axios.get("/seller/products", {
				params: { page: currentPage.value, per_page: perPage.value },
			});
			const payload = res?.data ?? null;

			let items = [];
			if (payload && Array.isArray(payload.data)) items = payload.data;
			else if (payload && payload.data && Array.isArray(payload.data.data))
				items = payload.data.data;
			else if (Array.isArray(payload)) items = payload;
			else items = payload?.products ?? payload?.items ?? [];

			products.value = items.map((p) => {
				const copy = { ...p };
				try {
					let imgs = [];
					if (Array.isArray(p.images)) {
						imgs = p.images
							.map((it) => {
								if (!it) return null;
								if (typeof it === "string") return { url: it, image_path: it };
								if (typeof it === "object")
									return {
										id: it.id ?? null,
										image_path: it.image_path ?? it.path ?? "",
										url: it.url ?? it.image_path ?? it.path ?? "",
									};
								return null;
							})
							.filter(Boolean);
					} else if (p.image && typeof p.image === "string")
						imgs = [{ url: p.image, image_path: p.image }];
					else if (p.image_url && typeof p.image_url === "string")
						imgs = [{ url: p.image_url, image_path: p.image_url }];
					else imgs = [];
					imgs = uniqueStrings(imgs).map((x) =>
						typeof x === "string" ? { url: x, image_path: x } : { ...(x || {}) }
					);
					copy.images = imgs;
				} catch {
					copy.images = [];
				}
				return copy;
			});

			const metaTotal =
				res?.data?.meta?.total ??
				res?.data?.data?.meta?.total ??
				res?.data?.total ??
				res?.data?.count ??
				null;
			if (typeof metaTotal === "number") total.value = metaTotal;
			else {
				const hdr =
					res?.headers?.["x-total-count"] ?? res?.headers?.["X-Total-Count"];
				const parsedHdr = hdr ? parseInt(hdr, 10) : NaN;
				total.value = !isNaN(parsedHdr) ? parsedHdr : products.value.length;
			}
		} catch (err) {
			console.error(err);
			error.value =
				err?.response?.data?.message ||
				err.message ||
				"Failed to load products";
			products.value = [];
			total.value = 0;
		} finally {
			loading.value = false;
		}
	}

	/* fetch categories */
	const categories = ref([]);
	const loadingCategories = ref(false);
	async function fetchCategories() {
		loadingCategories.value = true;
		try {
			const res = await axios.get("/seller/categories");
			const payload = res?.data?.data ?? res?.data ?? res;
			if (Array.isArray(payload)) categories.value = payload;
			else if (Array.isArray(res?.data)) categories.value = res.data;
			else if (Array.isArray(res?.data?.data)) categories.value = res.data.data;
			else categories.value = payload?.categories ?? payload?.items ?? [];
		} catch (err) {
			console.error("Failed to load categories", err);
			categories.value = [];
		} finally {
			loadingCategories.value = false;
		}
	}

	/* displayedProducts */
	const displayedProducts = computed(() => {
		const arr = Array.isArray(products.value) ? [...products.value] : [];
		const q = (search.value || "").trim().toLowerCase();

		const filtered = q
			? arr.filter((p) => {
					const name = (p.name || "").toString().toLowerCase();
					const desc = (p.description || "").toString().toLowerCase();
					return name.includes(q) || desc.includes(q);
			  })
			: arr;

		if (sortBy.value === "newest")
			return filtered.sort(
				(a, b) => new Date(b.created_at) - new Date(a.created_at)
			);
		return filtered.sort(
			(a, b) => new Date(a.created_at) - new Date(b.created_at)
		);
	});

	/* single product */
	async function fetchProduct(id) {
		try {
			const res = await axios.get(`/seller/products/${id}`);
			return res?.data?.data ?? res?.data ?? null;
		} catch (err) {
			console.error("Failed to fetch product", err);
			throw err;
		}
	}

	/* open/edit/reset */
	function resetForm() {
		productForm.name = "";
		productForm.description = "";
		productForm.price = 0;
		productForm.is_approved = false;
		productForm.is_blocked = false;
		productForm.category_id = null;
		Object.keys(formErrors).forEach((k) => (formErrors[k] = ""));
		modalError.value = null;

		// revoke previews
		imagePreviews.value.forEach((url) => {
			try {
				URL.revokeObjectURL(url);
			} catch {}
		});
		imagePreviews.value = [];
		selectedFiles.value = [];
		existingImages.value = [];
	}

	function openCreateModal() {
		editingProductId.value = null;
		resetForm();
		showModal.value = true;
	}

	async function openEditModal(prod) {
		editingProductId.value = prod.id;
		resetForm();
		modalError.value = null;
		showModal.value = true;
		try {
			const data = await fetchProduct(prod.id);
			const p = data?.data ?? data ?? prod;
			productForm.name = p.name ?? prod.name ?? "";
			productForm.description = p.description ?? prod.description ?? "";
			productForm.price = p.price ?? prod.price ?? 0;
			productForm.is_approved = p.is_approved ?? prod.is_approved ?? false;
			productForm.is_blocked = p.is_blocked ?? prod.is_blocked ?? false;
			productForm.category_id = p.category_id ?? p.category?.id ?? null;

			existingImages.value = [];
			if (Array.isArray(p.images) && p.images.length) {
				existingImages.value = p.images.map((i) => {
					if (!i) return { url: "", image_path: "", removed: false };
					if (typeof i === "string")
						return { url: i, image_path: i, removed: false };
					return {
						id: i.id ?? null,
						image_path: i.image_path ?? i.path ?? "",
						url: i.url ?? i.image_path ?? i.path ?? "",
						removed: false,
					};
				});
				existingImages.value = uniqueStrings(existingImages.value).map((x) =>
					typeof x === "string"
						? { url: x, image_path: x, removed: false }
						: { ...(x || {}), removed: false }
				);
			} else if (p.image)
				existingImages.value = [
					{ url: p.image, image_path: p.image, removed: false },
				];
			else if (p.image_url)
				existingImages.value = [
					{ url: p.image_url, image_path: p.image_url, removed: false },
				];
		} catch (err) {
			modalError.value = "Failed to load product for editing";
		}
	}

	/* validate & save */
	function validateForm() {
		Object.keys(formErrors).forEach((k) => (formErrors[k] = ""));
		let ok = true;
		if (!productForm.name || productForm.name.trim().length < 2) {
			formErrors.name = "Name required (min 2 chars)";
			ok = false;
		}
		if (
			productForm.price == null ||
			isNaN(productForm.price) ||
			Number(productForm.price) < 0
		) {
			formErrors.price = "Price must be >= 0";
			ok = false;
		}
		if (!productForm.category_id) {
			formErrors.category_id = "Please select a category";
			ok = false;
		}
		return ok;
	}

	async function saveProduct() {
		if (!validateForm()) return;
		savingProduct.value = true;
		modalError.value = null;
		try {
			const formData = new FormData();
			formData.append("name", productForm.name || "");
			formData.append("description", productForm.description || "");
			formData.append("price", productForm.price || "");
			formData.append("category_id", productForm.category_id || "");
			formData.append("stock", productForm.stock || 0);

			// Add new images
			for (const file of selectedFiles.value) {
				formData.append("images[]", file);
			}

			// ✅ Remove images - id directly send karo
			const removedItems = existingImages.value.filter((e) => e && e.removed);
			console.log("Removed items:", removedItems); // debug

			for (const it of removedItems) {
				if (it.id != null) {
					formData.append("remove_image_ids[]", String(it.id));
					console.log("Sending remove_image_ids[]:", it.id); // debug
				}
			}

			// Debug: FormData contents dekho
			for (const [key, val] of formData.entries()) {
				console.log(key, "→", val);
			}

			let res;
			if (editingProductId.value) {
				formData.append("_method", "PUT");
				res = await axios.post(`/seller/products/${editingProductId.value}`, formData, {
					headers: { "Content-Type": "multipart/form-data" },
				});
			} else {
				res = await axios.post("/seller/products", formData, {
					headers: { "Content-Type": "multipart/form-data" },
				});
			}

			if (res?.data?.success || res?.data?.data) {
				showToast(
					editingProductId.value ? "Product updated!" : "Product created!",
					"success"
				);
				closeModal();
				await fetchProducts();
			} else {
				modalError.value = res?.data?.message || "Save failed";
			}
		} catch (err) {
			console.error("saveProduct error:", err?.response?.data || err);
			const errors = err?.response?.data?.errors;
			if (errors) {
				modalError.value = Object.values(errors).flat().join(", ");
			} else {
				modalError.value = err?.response?.data?.message || "Server error";
			}
		} finally {
			savingProduct.value = false;
		}
	}

	function closeModal() {
		showModal.value = false;
		editingProductId.value = null;

		imagePreviews.value.forEach((url) => {
			try {
				URL.revokeObjectURL(url);
			} catch {}
		});
		imagePreviews.value = [];
		selectedFiles.value = [];
		existingImages.value = [];
		resetForm();
	}

	/* delete */
	function confirmDeleteModal(prod) {
		deleteConfirmId.value = prod.id;
		productToDelete.value = prod;
	}
	function cancelDelete() {
		deleteConfirmId.value = null;
		productToDelete.value = null;
	}
	async function performDelete() {
		if (!deleteConfirmId.value) return;
		deleting.value = true;
		try {
			await axios.delete(`/seller/products/${deleteConfirmId.value}`);
			showToast("Product deleted", "success");
			await fetchProducts();
		} catch (err) {
			showToast(
				err?.response?.data?.message || err?.message || "Delete failed",
				"error"
			);
		} finally {
			deleting.value = false;
			cancelDelete();
		}
	}

	/* UI helpers */
	function toggleAll() {
		if (selectAll.value)
			selected.value = (products.value || []).map((p) => p.id);
		else selected.value = [];
	}
	function prevPage() {
		if (currentPage.value > 1) {
			currentPage.value--;
			fetchProducts();
		}
	}
	function nextPage() {
		if (currentPage.value < totalPages.value) {
			currentPage.value++;
			fetchProducts();
		}
	}
	function onPerPageChange() {
		currentPage.value = 1;
		fetchProducts();
	}
	function onSearch() {
		currentPage.value = 1;
	}

	/* lifecycle */
	watch([currentPage, perPage], () => fetchProducts());
	onMounted(() => {
		fetchProducts();
		fetchCategories();
	});
</script>

<style scoped>
	/* subtle UI polish */
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.scale-fade-enter-from {
		opacity: 0;
		transform: scale(0.96);
	}
	.scale-fade-enter-to {
		opacity: 1;
		transform: scale(1);
	}
	.scale-fade-enter-active {
		transition: all 0.18s ease-out;
	}
	.scale-fade-leave-active {
		transition: all 0.14s ease-in;
		opacity: 0;
		transform: scale(0.98);
	}
	.fade-enter-from,
	.fade-leave-to {
		opacity: 0;
	}
	.fade-enter-to,
	.fade-leave-from {
		opacity: 1;
	}
	.fade-enter-active,
	.fade-leave-active {
		transition: opacity 0.22s ease;
	}
	button {
		transition: all 0.12s ease;
	}
	.content-with-sidebar {
		width: 100%;
		padding-left: 1rem;
	}
	@media (min-width: 1024px) {
		.content-with-sidebar {
			padding-left: 1.5rem;
		}
	}
</style>
