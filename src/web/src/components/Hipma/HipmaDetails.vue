<template>
	<div class="hipma-service details">

		<v-row class="mb-5" no-gutters>
			<span class="title-service">Hipma Requests</span>
		</v-row>

		<v-row class="submission-filters mb-4 text-right" no-gutters>
			<v-col
				cols="12"
                sm="12"
                md="12"
                lg="6"
			></v-col>
			<v-col
				cols="12"
                sm="12"
                md="12"
                lg="2"
			>
				<v-dialog
					v-model="dialog"
					width="500"
				>
					<template v-slot:activator="{ on, attrs }">
						<v-btn
							color="#F3A901"
							class="pull-right ma-2 white--text apply-btn"
							dark
							v-bind="attrs"
							v-on="on"
						>

							Mark as closed

							<v-icon
								right
								dark
							>
							mdi-check-circle-outline
							</v-icon>
						</v-btn>
					</template>
					<v-card>
						<v-card-title class="text-h5 white lighten-2">
							Mark as closed
						</v-card-title>

						<v-card-text>
							Are you sure you want to mark this entry as closed?
						</v-card-text>

						<v-divider></v-divider>

						<v-card-actions>
							<v-spacer></v-spacer>
							<v-btn
								color="#757575"
								text
								@click="dialog = false"
							>
							No
							</v-btn>

							<v-btn
								color="primary"
								text
								@click="changeStatus()"
							>
							Yes
							</v-btn>
						</v-card-actions>
					</v-card>
				</v-dialog>
			</v-col>

			<v-col
				cols="12"
                sm="12"
                md="12"
                lg="2"
			>
				<v-btn
					color="#F3A901"
					class="pull-right ma-2 white--text apply-btn"
					:loading="loadingExport"
					:disabled="loadingExport"
					@click="exportToPDF"
				>

					Export selected

					<v-icon
						right
						dark
					>
					mdi-file-move
					</v-icon>
				</v-btn>
			</v-col>
		</v-row>
		<v-row no-gutters>
			<v-col id="hipmaPanelInformation">
				<HipmaInformation
					v-bind:hipma="itemsHipma"
					v-bind:panelModel="panelModel"
				/>

				<HipmaBehalf
					v-if="itemsHipma.hipmasituations
					|| itemsHipma.first_name_behalf
					|| itemsHipma.last_name_behalf
					|| itemsHipma.company_or_organization_optional_behalf
					|| itemsHipma.address_behalf
					|| itemsHipma.city_or_town_behalf
					|| itemsHipma.postal_code_behalf
					|| itemsHipma.email_address_behalf"
					v-bind:hipma="itemsHipma"
					v-bind:hipmaFiles="itemsHipmaFiles"
					v-bind:panelModel="panelModel"
				/>

				<HipmaApplicant
					v-bind:hipma="itemsHipma"
					v-bind:panelModel="panelModel"
				/>

				<HipmaAttachments
					v-if="flagHipmaFiles"
					v-bind:hipmaFiles="itemsHipmaFiles"
					v-bind:panelModel="panelModel"
				/>
			</v-col>
			<v-col lg="1"> </v-col>
		</v-row>
	</div>
</template>

<script>
const axios = require("axios");
import HipmaInformation from './HipmaInformation.vue';
import HipmaBehalf from './HipmaBehalf.vue';
import HipmaApplicant from './HipmaApplicant.vue';
import HipmaAttachments from './HipmaAttachments.vue';
import { HIPMA_SHOW_URL } from "../../urls.js";
import { HIPMA_VALIDATE_URL } from "../../urls.js";
import { HIPMA_CHANGE_STATUS_URL } from "../../urls.js";
import html2pdf from "html2pdf.js";

export default {
	name: "HipmaDetails",
	data: () => ({
		loader: null,
		loadingExport: false,
		itemsHipma: [],
		itemsHipmaFiles: [],
		flagHipmaFiles: true,
		dialog: false,
		panelModel: [0],
		fileName: "",
	}),

	components: {
		HipmaInformation,
		HipmaBehalf,
		HipmaApplicant,
		HipmaAttachments
	},
	created(){

	},
	mounted() {
		this.validateRecord();
	},
	watch: {
		loader () {
			const l = this.loader
			this[l] = !this[l]

			setTimeout(() => (this[l] = false), 3000)

			this.loader = null
		},
	},
	methods: {
		validateRecord() {
			axios
			.get(HIPMA_VALIDATE_URL+this.$route.params.hipma_id)
			.then((resp) => {
				if(!resp.data.flagHipma){
					this.$router.push({
						path: '/hipma',
						query: { type: 'nonexistent' }
					});
				}else{
					this.getDataFromApi();
				}
			})
			.catch((err) => console.error(err))
			.finally(() => {
			});
		},
		getDataFromApi() {
			axios
			.get(HIPMA_SHOW_URL+this.$route.params.hipma_id)
			.then((resp) => {

				this.itemsHipma = resp.data.hipma;

				if(Object.keys(resp.data.hipmaFiles).length === 0){
					this.flagHipmaFiles = false;
				}

				this.itemsHipmaFiles = resp.data.hipmaFiles;
				this.fileName = resp.data.fileName;

			})
			.catch((err) => console.error(err))
			.finally(() => {
			});
		},
		changeStatus(){
			//Sent it as an array to use the same function for both single and bulk status changes
			var hipmaId = [this.$route.params.hipma_id];

			axios
			.patch(HIPMA_CHANGE_STATUS_URL, {
                params: {
					requests: hipmaId
				}
            })
			.then(() => {
				this.$router.push({
					path: '/hipma',
					query: { type: 'status' }
				});

			})
			.catch((err) => console.error(err))
		},
		exportToPDF() {
			this.loader = 'loadingExport';
			this.panelModel = [0];
			var namePdf = this.fileName;

			setTimeout(function() {
				html2pdf(document.getElementById("hipmaPanelInformation"), {
						margin: 5,
						filename: namePdf,
						pagebreak: {
							mode: ['avoid-all', 'css', 'legacy']
						}
				});
			}, 500);
		},
	},
};
</script>
