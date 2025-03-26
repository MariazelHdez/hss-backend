<template>
    <div class="dental-service">
		<v-row class="mb-5" no-gutters>
			<span class="title-service">Modules Logs History</span>
		</v-row>

		<Notifications ref="notifier"></Notifications>
		<br>
		<v-row class="submission-filters mb-5" no-gutters>
			<!--v-col
				cols="12"
                sm="12"
                md="12"
                lg="2"
				class="mr-5"
			>
				<v-select
					v-model="moduleSelected"
					:items="modulesFilter"
					label="Select Module"
					persistent-hint
					@change="changeModuleSelect"
					disabled
				></v-select>

			</v-col-->
			<v-col
				cols="12"
                sm="12"
                md="12"
                lg="3"
				class="mr-5"
			>
				<v-text-field
					label="Client Name"
					variant="underlined"
					v-model="searchInputQuery"
				></v-text-field>
				<span class="grey--text text-subtitle-2">Search By: Client First Name, Client Last Name</span>
			</v-col>
			<v-col
				cols="12"
                sm="12"
                md="12"
                lg="1"
				class="text-center"
			>
				<v-tooltip top>
					<template v-slot:activator="{ on, attrs }">
						<v-icon v-bind="attrs" v-on="on" @click="clearSearchInput">mdi-close-circle</v-icon>
					</template>
					<span>Clear Name Filter</span>
				</v-tooltip>
			</v-col>
			<v-col
				cols="12"
                sm="12"
                md="12"
                lg="1"
				class="text-left"
			>
				<v-btn
					color="#F3A901"
					class="white--text apply-btn mt-2"
					id="searchInput-btn"
					:disabled="!searchInputQuery.trim()"
					@click="searchInputData"
				>
					Search
				</v-btn>
			</v-col>
			<v-col
				cols="12"
                sm="12"
                md="12"
                lg="2"
				class="mr-5"
			>
				<v-select
					v-model="userSelected"
					:items="usersFilter"
					label="Select User"
					persistent-hint
					@change="changeUserSelect"
				></v-select>

			</v-col>
			<v-col
				cols="12"
                sm="12"
                md="12"
                lg="1"
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
                lg="1"
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

		<v-row  class="mb-5 d-flex align-baseline text-right" no-gutters>
			<v-col
				cols="12"
                sm="12"
                md="12"
                lg="12"
			>
				<v-btn
					:loading="loadingExport"
					:disabled="disabledExport"
					color="#F3A901"
					class="white--text apply-btn mt-2"
					id="apply-btn"
					@click="exportFile()"
				>
					<v-icon>mdi-file-delimited</v-icon>Export to CSV
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
			@toggle-select-all="selectAll"
		>
			<!--template v-slot:[`item.showurl`]="{ item }">
				<v-icon @click="showDetails(item.showurl)">mdi-eye</v-icon>
			</template-->
		</v-data-table>
    </div>
</template>

<script>
	const axios = require("axios");
	import { GENERAL_LOGS, GENERAL_LOGS_EXPORT } from "../../urls.js";
	import { utils } from "xlsx";
	import Notifications from "../Notifications.vue";

	export default {
	name: "logsIndex",
	props: ['type'],
	data: () => ({
		loading: false,
		bulkSelected: [],
		items: [],
		moduleSelected: ["DENTAL", "GENERAL"],
		userSelected: null,
		date: null,
		selectedYear: null,
		dateYear: null,
		menu: false,
		dateEnd: null,
		modulesFilter: ['DENTAL', 'MIDWIFERY', 'HIPMA', 'CONSTELLATION'],
		usersFilter: [],
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
				text: "Action",
				value: "action_type_description",
				width: "10%",
				sortable: true,
			},
			{
				text: "Description",
				value: "title",
				width: "10%",
				sortable: true,
			},
			{
				text: "Submission Identifier",
				value: "submission_id",
				width: "10%",
				sortable: true,
			},
			{
				text: "Client First Name",
				value: "first_name_client",
				width: "10%",
				sortable: true,
			},
			{
				text: "Client Last Name",
				value: "last_name_client",
				width: "10%",
				sortable: true,
			},
			{
				text: "User Name",
				value: "user_name",
				width: "10%",
				sortable: true,
			},
			{
				text: "User Email",
				value: "user_email",
				width: "10%",
				sortable: true,
			},
			{ text: "Created", value: "action_date", width: "15%", sortable: true },
			{ text: "", value: "showurl", sortable: false },
		],
		page: 1,
		pageCount: 0,
		iteamsPerPage: 10,
		alignments: "center",
		searchInputDisabled: true,
		searchInputQuery: '',
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
		changeModuleSelect(){
			this.getDataFromApi();
		},
		changeUserSelect(){
			this.getDataFromApi();
		},
		updateDate(){
			if(this.date !== null && this.dateEnd !== null){
				this.selected = [];
				this.getDataFromApi();
			}
		},
		removeFilters() {
			return this.date || this.dateEnd || this.userSelected;
		},
		resetInputs() {
			this.date = null;
			this.dateEnd = null;
			this.userSelected = null;
			this.searchInputQuery = "";
			this.searchInputDisabled = true;
			this.getDataFromApi();
		},
		getDataFromApi() {
			this.loading = true;
			this.disabledExport = true;
			axios
			.post(GENERAL_LOGS, {
				params: {
					moduleName: this.moduleSelected,
					userName: this.userSelected,
					dateFrom: this.date,
					dateTo: this.dateEnd,
					searchQuery: this.searchInputQuery,
				}
			})
			.then((resp) => {
				this.items = resp.data.data;
				this.usersFilter = resp.data.users;
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
					searchQuery: this.searchInputQuery,
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
		selectAll() {
			this.selected = this.selected.length === this.items.length
			? []
			: this.items
		},
		searchInputData() {
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
			const idArray = [];
			this.selected.forEach((e) => {
				idArray.push(e.id);
			});

			axios
				.post(GENERAL_LOGS_EXPORT, {
				params: {
					requests: idArray,
					moduleName: this.moduleSelected,
					userName: this.userSelected,
					dateFrom: this.date,
					dateTo: this.dateEnd,
					searchQuery: this.searchInputQuery,
				}
				})
				.then((resp) => {
					if (resp.data.dataLogs && resp.data.dataLogs.length > 0) {

						const logsRearrenge = resp.data.dataLogs.map(item => ({
							schema_name: item.schema_name,
							action_type_description: item.action_type_description,
							title: item.title,
							submission_id: item.submission_id,
							first_name_client: item.first_name_client,
							last_name_client: item.last_name_client,
							user_email: item.user_email,
							user_name: item.user_name,
							action_date: item.action_date
						}));

						const ws1 = utils.json_to_sheet(logsRearrenge || []);

						utils.sheet_add_aoa(
							ws1,
							[[
								'MODULE',
								'ACTION',
								'TITLE',
								'SUBMISSION IDENTIFIER',
								'FIRST NAME CLIENT',
								'LAST NAME CLIENT',
								'USER NAME',
								'USER EMAIL',
								'LOG DATE'
							]],
							{ origin: "A1" }
						);

						const csvData1 = utils.sheet_to_csv(ws1);

						this.downloadCSV(csvData1, "DentalServiceLogs.csv");
					}
				})
				.catch((err) => console.error(err))
				.finally(() => {
					this.loading = false;
					this.loadingExport = false;
					this.disabledExport = false;
				});
			},
			downloadCSV(csvString, filename) {
				const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
				const url = URL.createObjectURL(blob);

				const link = document.createElement("a");
				link.href = url;
				link.setAttribute("download", filename);
				document.body.appendChild(link);
				link.click();

				document.body.removeChild(link);
				URL.revokeObjectURL(url);
			}
	},
	};
</script>