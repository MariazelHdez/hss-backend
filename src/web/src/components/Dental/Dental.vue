<template>
    <div class="dental-service">
		<v-row class="mb-5" no-gutters>
			<span class="title-service">Dental Service Requests</span>
		</v-row>

		<Notifications ref="notifier"></Notifications>
		<br>
		<v-row class="submission-filters mb-5" no-gutters>
			<v-col
				cols="10"
                sm="6"
                md="5"
                lg="4"
			>
				<div class="d-flex align-center pr-2">
					<v-text-field
						label="Keyword"
						variant="underlined"
						prepend-inner-icon="mdi-magnify"
						v-model="searchInputQuery"
						@keyup.enter="searchInputData"
						hint="Search By: First Name, Middle Name, Last Name, Postal Code, Healthcare Card Number, or Email"
						persistent-hint
					></v-text-field>
					<v-tooltip top>
						<template v-slot:activator="{ on, attrs }">
							<v-icon v-bind="attrs" v-on="on" @click="clearSearchInput">mdi-close-circle</v-icon>
						</template>
						<span>Clear Keyword Filter</span>
					</v-tooltip>
					<v-btn
						color="#F3A901"
						class="white--text apply-btn mt-2"
						id="searchInput-btn"
						:disabled="!searchInputQuery.trim()"
						@click="searchInputData"
					>
						Search
					</v-btn>
				</div>
			</v-col>

			<v-col
				cols="12"
                sm="12"
                md="12"
                lg="2"
			>
				<v-select
					v-model="statusSelected"
					:items="statusFilter"
					label="Select Status"
					multiple
					persistent-hint
					@change="changeStatusSelect"
				></v-select>

			</v-col>
			<v-col
				cols="12"
                sm="12"
                md="12"
                lg="1"
			>
				<v-text-field
					v-model="selectedYear"
					label="Year"
					prepend-icon="mdi-calendar"
					variant="underlined"
					@input="handleYear"
					type="number"
				></v-text-field>
			</v-col>
			<v-col
				cols="12"
                sm="12"
                md="12"
                lg="2"
			>
				<v-menu
					ref="menu"
					v-model="menu"
					:close-on-content-click="false"
					transition="scale-transition"
					offset-y
					min-width="auto"
				>
					<template v-slot:activator="{ on, attrs }">
						<v-text-field
							v-model="date"
							label="From:"
							prepend-icon="mdi-calendar"
							v-bind="attrs"
							v-on="on"
							:disabled="dateDisabled"
						></v-text-field>
					</template>
					<v-date-picker
						v-model="date"
						no-title
						@input="menu = false"
						@change="updateDate"
					></v-date-picker>
				</v-menu>

			</v-col>
			<v-col
				cols="12"
                sm="12"
                md="12"
                lg="2"
			>
				<v-menu
					ref="menuEnd"
					v-model="menuEnd"
					:close-on-content-click="false"
					transition="scale-transition"
					offset-y
					min-width="auto"
				>
					<template v-slot:activator="{ on, attrs }">
						<v-text-field
							v-model="dateEnd"
							label="To:"
							prepend-icon="mdi-calendar"
							v-bind="attrs"
							v-on="on"
							:disabled="dateDisabled"
						></v-text-field>
					</template>
					<v-date-picker
						v-model="dateEnd"
						no-title
						@input="menuEnd = false"
						@change="updateDate"
					></v-date-picker>
				</v-menu>
			</v-col>
			<v-col
				cols="12"
                sm="12"
                md="12"
                lg="1"
                class="btn-reset ma-0"
				v-if="removeFilters"
			>

				<v-tooltip top>
					<template v-slot:activator="{ on, attrs }">
						<v-icon v-bind="attrs" v-on="on" @click="resetInputs"> mdi-filter-remove </v-icon>
					</template>
					<span>Clear Filters</span>
				</v-tooltip>
			</v-col>
		</v-row>

		<v-row  class="mb-5 d-flex align-baseline" no-gutters>

			<v-col
				cols="12"
                sm="12"
                md="12"
                lg="2"
			>
				<v-select
					:items="bulkActions"
					v-model="bulkSelected"
					solo
					label="Bulk Actions"
					append-icon="mdi-chevron-down"
					prepend-inner-icon="mdi-layers-triple"
					color="grey lighten-2"
					item-color="grey lighten-2"
					@change="enterBulkAction"
					id="bulk-accion-select"
				>
				</v-select>
			</v-col>

			<v-col
				cols="12"
                sm="12"
                md="12"
                lg="1"
				class="text-center"
			>
				<v-btn
					color="#F3A901"
					class="white--text apply-btn mt-2"
					id="apply-btn"
					:disabled="applyDisabled"
					@click="submitBulk"
				>
					Apply
				</v-btn>
			</v-col>
		</v-row>

		<v-data-table
			dense
			v-model="selected"
			show-select
			checkbox-color="black"
			:items="items"
			:headers="headers"
			:options.sync="options"
			:loading="loadingTable"
			:search="search"
			@input="enterSelect"

			:server-items-length="totalItems"
			@update:options="handlePagination"
			:footer-props="{
                'items-per-page-options': itemsPerPage
            }"
		>
			<template v-slot:[`item.showurl`]="{ item }">
				<v-icon @click="showDetails(item.showurl)">mdi-eye</v-icon>
			</template>
		</v-data-table>
    </div>
</template>

<script>
	const axios = require("axios");
	import { DENTAL_URL } from "../../urls.js";
	import Notifications from "../Notifications.vue";

	export default {
	name: "DentalServiceIndex",
	beforeRouteLeave(to, from, next) {

		if (!to.path.includes('/dental') || (to.path === from.path)) {
			sessionStorage.removeItem('dentalFilters');
		}else{
			sessionStorage.setItem(
				"dentalFilters",
				JSON.stringify({
					searchInputQuery: this.searchInputQuery?.trim() || "",
					date: this.date || null,
					dateEnd: this.dateEnd || null,
					dateYear: this.dateYear || null,
					statusSelected: Array.isArray(this.statusSelected) ? this.statusSelected : [],
					page: this.options.page,
					itemsPerPage: this.options.itemsPerPage,
					initialFetch: this.initialFetch,
				})
			);
		}

		next();
	},
	props: ['type'],
	data: () => ({
		loadingTable: false,
		bulkSelected: [],
		items: [],
		fetchedItems: [],
		statusSelected: [1],
		date: null,
		selectedYear: null,
		dateYear: null,
		menu: false,
		dateEnd: null,
		statusFilter: [],
		menuEnd: false,
		dateDisabled: false,
		selected: [],
		bulkActions: [],
		actionSelected: "",
		itemsSelected: [],
		search: "",
		applyDisabled: true,
		options: {
			page: 1,
			itemsPerPage: 10
		},
		flagAlert: false,
		statusChangeMessage: "Status changed successfully.",
		nonexistentMessage: "The submission you are consulting is closed or non existant, please choose a valid submission.",
		headers: [
		{
			text: "First Name",
			value: "first_name",
			width: "10%",
			sortable: true,
		},
		{
			text: "Last Name",
			value: "last_name",
			width: "10%",
			sortable: true,
		},
		{
			text: "Date of Birth",
			value: "date_of_birth",
			width: "10%",
			sortable: true,
		},
		{
			text: "Other Coverage",
			value: "eligible_pharmacare",
			sortable: true,
		},
		{ text: "Dependents", value: "dependent", sortable: true },
		{ text: "Proof of income", value: "file_dental", sortable: true },
		{ text: "Comments", value: "has_comments", sortable: true },
		{ text: "Created", value: "created_at", width: "15%", sortable: true },
		{ text: "Status", value: "status_description", sortable: true },
		{ text: "", value: "showurl", sortable: false },
		],
		alignments: "center",
		totalItems: 0,
		initialPage: 1,
		initialItemsPerPage: 10,
		itemsPerPage: [10, 15, 50, 100, -1],
		allItems: 0,
		isAllData: false,
		initialFetch: 1,
		searchInputDisabled: true,
		searchInputQuery: '',
		filtersRestored: false
	}),
	components: {
		Notifications
	},
	watch: {
		search: {
			handler() {
				this.getDataFromApi();
			},
			deep: true,
		}
	},
	mounted() {
		const savedFilters = sessionStorage.getItem("dentalFilters");
		if (savedFilters) {
			try {
				const parsed = JSON.parse(savedFilters);

				this.searchInputQuery = parsed.searchInputQuery?.trim() || "";
				this.date = parsed.date || null;
				this.dateEnd = parsed.dateEnd || null;
				this.dateYear = parsed.dateYear || null;
				this.selectedYear = parsed.dateYear || null;
				this.statusSelected = Array.isArray(parsed.statusSelected) ? parsed.statusSelected : [];
				this.options.page = parsed.page || 1;
				this.options.itemsPerPage = parsed.itemsPerPage || 10;
				this.filtersRestored = true;
				this.initialFetch = parsed.initialFetch;
				this.$nextTick(() => {
					this.getDataFromApi();
				});
			} catch (error) {
				console.error("Error loading saved filters:", error);
				this.getDataFromApi();
				this.filtersRestored = true;
			}
		} else {
			this.getDataFromApi();
			this.filtersRestored = true;
		}
	},
	methods: {
		handleYear() {
			const year = parseInt(this.selectedYear);
			if (Number.isInteger(year) && year >= 1950 && year <= 2050) {
				this.dateYear = year;
				this.dateDisabled = true;
				this.date = null;
				this.dateEnd = null;
				this.selected = [];
				this.options.page = this.initialPage;
				this.options.itemsPerPage = this.initialItemsPerPage;
				this.initialFetch = 1;
				this.getDataFromApi();
			}
		},
		changeStatusSelect(){
			this.selected = [];
			this.options.page = this.initialPage;
			this.options.itemsPerPage = this.initialItemsPerPage;
			this.initialFetch = 1;
			this.getDataFromApi();
		},
		updateDate(){
			if(this.date !== null && this.dateEnd !== null){
				this.selected = [];
				this.options.page = this.initialPage;
				this.options.itemsPerPage = this.initialItemsPerPage;
				this.initialFetch = 1;
				this.getDataFromApi();
			}
		},
		removeFilters() {
			return this.date || this.dateEnd || this.statusSelected || this.dateYear || this.selectedYear;
		},
		resetInputs() {
			this.date = null;
			this.dateEnd = null;
			this.statusSelected = null;
			this.bulkSelected = null;
			this.applyDisabled = true;
			this.dateYear = null;
			this.selectedYear = null;
			this.selected = [];
			this.searchInputQuery = "";
			this.searchInputDisabled = true;
			this.options.page = this.initialPage;
			this.options.itemsPerPage = this.initialItemsPerPage;
			this.initialFetch = 1;
			this.getDataFromApi();
		},
		getDataFromApi() {
			this.loadingTable = true;
			this.items = [];
			const { page, itemsPerPage, sortBy, sortDesc } = this.options;

			axios
			.post(DENTAL_URL, {
				params: {
					dateFrom: this.date,
					dateTo: this.dateEnd,
					dateYear: this.dateYear,
					status: this.statusSelected,
					searchQuery: this.searchInputQuery,
					page: page,
					pageSize: itemsPerPage,
					sortBy: sortBy.length ? sortBy[0] : null,
					sortOrder: sortBy.length ? (sortDesc[0] ? 'DESC' : 'ASC') : null,
					initialFetch: this.initialFetch,
				}
			})
			.then((resp) => {
				this.fetchedItems = resp.data.data;
				this.bulkActions = resp.data.dataStatus;
				this.statusFilter = resp.data.dataStatus.filter(
										(element) => element.value !== 4 && element.value !== 6
									);
				this.loadingTable = false;
				this.dateDisabled = false;
				this.totalItems = resp.data.total;
				this.allItems = resp.data.all;

				if (this.initialFetch === 1 || this.options.itemsPerPage < this.fetchedItems.length) {
                    const { page, itemsPerPage } = this.options;
                    const startIndex = (page - 1) * itemsPerPage;
                    const endIndex = startIndex + itemsPerPage;

                    this.items = this.fetchedItems.slice(startIndex, endIndex);

						sessionStorage.setItem(
							"dentalFilters",
							JSON.stringify({
								searchInputQuery: this.searchInputQuery,
								date: this.date,
								dateEnd: this.dateEnd,
								dateYear: this.dateYear,
								statusSelected: this.statusSelected,
							})
						);

						this.initialFetch = 0;
				} else {
					this.items = this.fetchedItems;
				}

			})
			.catch((err) => console.error(err))
			.finally(() => {
				this.loadingTable = false;
			});
		},
		handlePagination() {
			if (!this.filtersRestored) {
				return;
			}

            const { page, itemsPerPage, sortBy, sortDesc } = this.options;
            const startIndex = (page - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            if (sortBy.length || sortDesc.length) {
                this.getDataFromApi();
            } else {
                if (this.fetchedItems.length >= endIndex) {
                    this.items = this.fetchedItems.slice(startIndex, endIndex);
                } else {
                    this.getDataFromApi();
                }
            }
        },
		showDetails(route) {
			sessionStorage.setItem(
				"dentalFilters",
				JSON.stringify({
					searchInputQuery: this.searchInputQuery?.trim() || "",
					date: this.date || null,
					dateEnd: this.dateEnd || null,
					dateYear: this.dateYear || null,
					statusSelected: Array.isArray(this.statusSelected) ? this.statusSelected : [],
				})
			);

			this.$router.push({
				path: route
			});
		},
		enterSelect() {
			this.itemsSelected = this.selected;
		},
		enterBulkAction(value) {
			this.actionSelected = value;
			this.applyDisabled = false;
		},
		submitBulk() {
			this.applyDisabled = false;
			if (this.actionSelected != "") {
				let requests = [];
				this.itemsSelected.forEach((element) => {
					requests.push(element.id);
				});

				if(requests.length > 0){
					let patchUrl = DENTAL_URL + "/changeStatus/";
					axios.patch(patchUrl, {
						params: {
							requests: requests,
							requestStatus: this.actionSelected
						}
					})
					.then((resp) => {
						this.$refs.notifier.showAPIMessages(resp.data);
						this.selected = [];
						this.getDataFromApi();
					})
					.catch((err) => console.error(err))
					.finally(() => {
						this.loading = false;
					});
				}
			}
		},
		sortItems(items, sortBy, sortDesc) {
            if (sortBy.length) {
                let sorted = items.sort((a, b) => {
                    const sortKey = sortBy[0];
                    const sortOrder = sortDesc[0] ? -1 : 1;
                    if (a[sortKey] < b[sortKey]) return -1 * sortOrder;
                    if (a[sortKey] > b[sortKey]) return 1 * sortOrder;
                    return 0;
                });

                return sorted;
            }else{
                return items;
            }
        },
		searchInputData() {
			this.searchInputQuery = this.searchInputQuery.trim();
			if(this.searchInputQuery !== null && this.searchInputQuery !== ""){
				this.options.page = this.initialPage;
				this.options.itemsPerPage = this.initialItemsPerPage;
				this.initialFetch = 1;
				this.getDataFromApi();
			}
		},
		clearSearchInput(){
			this.searchInputQuery = "";
			this.searchInputDisabled = true;
			this.options.page = this.initialPage;
			this.options.itemsPerPage = this.initialItemsPerPage;
			this.initialFetch = 1;
			this.getDataFromApi();
		},
	},
	};
</script>
