<template>
    <div class="dental-service">
		<v-row class="mb-5" no-gutters>
			<span class="title-service">Dental Service Past Records</span>
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
						hint="Search By: First Name, Middle Name, Last Name, Postal Code, Healthcare Card Number, or Email"
						persistent-hint
						@keyup.enter="searchInputData"
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
		<v-row>
			<v-col
				cols="10"
				sm="10"
				md="10"
				lg="12"
				class="text-right"
			>
				<v-btn
					:loading="loadingExport"
					:disabled="disabledExport"
					color="#F3A901"
					class="ma-2 white--text apply-btn"
					@click="exportFile()"
					id="export-btn"
				>
					Export
					<v-icon
						right
						dark
					>
						mdi-cloud-download
					</v-icon>
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
			:loading="loading"
			:search="search"
			@input="enterSelect"
		>
			<template v-slot:[`item.showurl`]="{ item }">
				<v-icon @click="showDetails(item.showurl)">mdi-eye</v-icon>
			</template>
		</v-data-table>
    </div>
</template>

<script>
	const axios = require("axios");
	import { DENTAL_URL, DENTAL_EXPORT_FILE_URL } from "../../urls.js";
	import { utils, writeFileXLSX } from "xlsx";
	import Notifications from "../Notifications.vue";

	export default {
	name: "DentalServiceIndex",
	beforeRouteLeave(to, from, next) {

		sessionStorage.setItem(
			"dentalArchiveFilters",
			JSON.stringify({
				searchInputQuery: this.searchInputQuery,
				date: this.date,
				dateEnd: this.dateEnd,
				dateYear: this.dateYear,
				selectedYear: this.selectedYear,
				statusSelected: this.statusSelected,
			})
		);

		next();
	},
	props: ['type'],
	data: () => ({
		loading: false,
		bulkSelected: [],
		items: [],
		statusSelected: [],
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
		options: {},
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
			text: "Eligible for the Pharmacare and Extended Health Care Benefits program",
			value: "eligible_pharmacare",
			sortable: true,
		},
		{ text: "Dependents", value: "dependent", sortable: true },
		{ text: "Proof of income", value: "file_dental", sortable: true },
		{ text: "Comments", value: "has_comments", sortable: true },
		{ text: "Status", value: "status_description", sortable: true },
		{ text: "Created", value: "created_at", width: "15%", sortable: true },
		{ text: "", value: "showurl", sortable: false },
		],
		page: 1,
		pageCount: 0,
		iteamsPerPage: 10,
		alignments: "center",
		searchInputDisabled: true,
		searchInputQuery: '',
		archivedFlag: true,
		loadingExport: false,
		disabledExport: false,
	}),
	components: {
		Notifications
	},
	watch: {
		options: {
			handler() {
				this.getDataFromApi();
			},
			deep: true,
		},
		search: {
			handler() {
				this.getDataFromApi();
			},
			deep: true,
		}
	},
	mounted() {

		const savedFilters = sessionStorage.getItem("dentalArchiveFilters");
		if (savedFilters) {
			const parsed = JSON.parse(savedFilters);

			this.searchInputQuery = parsed.searchInputQuery || "";
			this.date = parsed.date || null;
			this.dateEnd = parsed.dateEnd || null;
			this.dateYear = parsed.dateYear || null;
			this.selectedYear = parsed.dateYear || null;
			this.statusSelected = parsed.statusSelected || null;
		}

		if (typeof this.$route.query.type !== undefined){
			if(this.$route.query.type == "status"){
				this.$refs.notifier.showSuccess(this.statusChangeMessage);
			}else if(this.$route.query.type == "nonexistent"){
				this.$refs.notifier.showError(this.nonexistentMessage);
			}
		}

		this.getDataFromApi();
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
				this.getDataFromApi();
			}
		},
		changeStatusSelect(){
			this.selected = [];
			this.getDataFromApi();
		},
		updateDate(){
			if(this.date !== null && this.dateEnd !== null){
				this.selected = [];
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
			this.getDataFromApi();
		},
		getDataFromApi() {
			this.loading = true;
			this.disabledExport = true;
			axios
			.post(DENTAL_URL, {
				params: {
					dateFrom: this.date,
					dateTo: this.dateEnd,
					dateYear: this.dateYear,
					status: this.statusSelected,
					searchQuery: this.searchInputQuery,
					archivedFlag: this.archivedFlag,
				}
			})
			.then((resp) => {
				this.items = resp.data.data;
				this.bulkActions = resp.data.dataStatus;
				this.statusFilter = resp.data.dataStatus;
				this.loading = false;
				this.dateDisabled = false;

				sessionStorage.setItem(
					"dentalArchiveFilters",
					JSON.stringify({
					searchInputQuery: this.searchInputQuery,
					date: this.date,
					dateEnd: this.dateEnd,
					dateYear: this.dateYear,
					statusSelected: this.statusSelected,
					})
				);
			})
			.catch((err) => console.error(err))
			.finally(() => {
				this.loading = false;
				this.disabledExport = false;
			});
		},
		showDetails(route) {
			this.$router.push({
					path: route,
					query: {
						searchInputQuery: this.searchInputQuery,
						date: this.date,
						dateEnd: this.dateEnd,
						dateYear: this.selectedYear,
						statusSelected: JSON.stringify(this.statusSelected),
					},
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
						this.$refs.notifier.showSuccess(resp.data.message);
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
		searchInputData() {
			this.searchInputQuery = this.searchInputQuery.trim();
			if(this.searchInputQuery !== null && this.searchInputQuery !== ""){
				this.getDataFromApi();
			}
		},
		clearSearchInput(){
			this.searchInputQuery = "";
			this.searchInputDisabled = true;
			this.getDataFromApi();
		},
		exportFile () {
			this.loadingExport = true;
			this.disabledExport = true;
			var idArray = [];
			this.selected.forEach((e) => {
				idArray.push(e.id);
			});

			axios
			.post(DENTAL_EXPORT_FILE_URL, {
				params: {
					requests: idArray,
					status: this.statusSelected,
					dateFrom: this.date,
					dateTo: this.dateEnd,
					dateYear: this.dateYear,
					searchQuery: this.searchInputQuery,
					archivedFlag: this.archivedFlag
				}
			}).then((resp) => {
				const ws = utils.json_to_sheet(resp.data.dataDental);
				const wb = utils.book_new();
				utils.book_append_sheet(wb, ws, "Dental Service Requests");

				utils.sheet_add_aoa(
				ws,
				[
					[
					"FIRST NAME",
					"MIDDLE NAME",
					"LAST NAME",
					"DATE OF BIRTH",
					"HEALTH CARD NUMBER",
					"MAILING ADDRESS",
					"CITY OR TOWN",
					"POSTAL CODE",
					"PHONE",
					"EMAIL",
					"OTHER COVERAGE",
					"ELIGIBLE PHARMACARE",
					"EMAIL INSTEAD",
					"HAVE CHILDREN",
					"ASK DEMOGRAPHIC",
					"IDENTIFY GROUPS",
					"GENDER",
					"EDUCATION",
					"OFTEN BRUSH",
					"STATE TEETH",
					"OFTEN FLOSS",
					"STATE GUMS",
					"LAST SAW DENTIST",
					"REASON FOR DENTIST",
					"BUY SUPPLIES",
					"PAY FOR VISIT",
					"BARRIERS",
					"PROBLEMS",
					"SERVICES NEEDED",
					"CREATED AT",
					"PROOF OF INCOME ATTACHMENT",
					"PROGRAM YEAR",
					"INCOME AMOUNT",
					"DATE OF ENROLLMENT",
					"POLICY NUMBER",
					"INTERNAL FIELD CREATED AT",
					"STATUS"
					],
				],
				{ origin: "A1" }
				);
				const ws2 = utils.json_to_sheet(resp.data.dataDependents);
				utils.book_append_sheet(wb, ws2, "Dental Service Dependents");
				utils.sheet_add_aoa(
				ws2,
				[
					[
					"APPLICANT NAME",
					"FIRST NAME",
					"LAST NAME",
					"DATE OF BIRTH",
					"HEALTHCARE",
					"APPLY",
					],
				],
				{ origin: "A1" }
				);

				writeFileXLSX(wb, "DentalService_ArchivedRequests.xlsx");

				this.loading = false;
			})
			.catch((err) => console.error(err))
			.finally(() => {
				this.loadingExport = false;
				this.disabledExport = false;
			});
		},
	},
	};
</script>