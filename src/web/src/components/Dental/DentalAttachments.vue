<template>

	<v-expansion-panels
        multiple
		v-model="modelPanel"
    >
        <v-expansion-panel class="mb-6">
			<v-expansion-panel-header>Attachments Information</v-expansion-panel-header>
			<v-expansion-panel-content>
                <v-simple-table>
                    <template v-slot:default>
                        <thead class="table-details-header">
							<tr>
								<th>
									<b>Field</b>
								</th>
								<th>
									<b>Value<span v-if="dentalServiceDuplicated">&nbsp;(Original Request)</span></b>
								</th>
								<th v-if="dentalServiceDuplicated">
									<b>Value&nbsp;(Duplicated Request)</b>
								</th>
								<th v-else>
								</th>
							</tr>
                        </thead>
                        <tbody v-if="dentalServiceDuplicated">
							<tr v-for="i in fileIndexes" :key="i">
								<td>Proof of income</td>

								<td v-if="dentalFiles && dentalFiles[i]">
									<v-icon right light color="black" class="h-100">mdi-file</v-icon>
									{{ dentalFiles[i].file_name + '.' + dentalFiles[i].file_type }}

									<v-btn
										color="#F3A901"
										class="pull-right ma-2 white--text apply-btn"
										:loading="loadingDownloadId === dentalFiles[i].id"
										:disabled="loadingDownloadId === dentalFiles[i].id"
										@click="downloadFile(dentalFiles[i].id)"
									>
										Download
										<v-icon right dark>mdi-cloud-download</v-icon>
									</v-btn>
								</td>
								<td v-else></td>

								<td v-if="dentalFilesDuplicated && dentalFilesDuplicated[i]">
									<v-icon right light color="black" class="h-100">mdi-file</v-icon>
									{{ dentalFilesDuplicated[i].file_name + '.' + dentalFilesDuplicated[i].file_type }}

									<v-btn
										color="#F3A901"
										class="pull-right ma-2 white--text apply-btn"
										:loading="loadingDownloadId === dentalFilesDuplicated[i].id"
										:disabled="loadingDownloadId === dentalFilesDuplicated[i].id"
										@click="downloadFile(dentalFilesDuplicated[i].id)"
									>
										Download
										<v-icon right dark>mdi-cloud-download</v-icon>
									</v-btn>
								</td>
								<td v-else></td>
							</tr>
						</tbody>
						<tbody v-else>
							<tr
								v-for="(file) in dentalFiles || []"
								:key="file.id"
							>
								<td>Proof of income</td>
								<td>
									<v-icon
										right
										light
										color="black"
										class="h-100"
									>
									mdi-file
									</v-icon>
									{{file.file_fullName}}
								</td>
								<td>
									<v-btn
										color="#F3A901"
										class="pull-right ma-2 white--text apply-btn"
										:loading="loadingDownloadId === file.id"
										:disabled="loadingDownloadId === file.id"
										v-show="showDownloadButton"
										@click="downloadFile(file.id)"
									>
										Download &nbsp;
										<v-icon
											right
											dark
										>
										mdi-cloud-download
										</v-icon>
									</v-btn>
								</td>

							</tr>

                        </tbody>
                    </template>
				</v-simple-table>
			</v-expansion-panel-content>
        </v-expansion-panel>

	</v-expansion-panels>

</template>
<script>
const axios = require("axios");
import { DENTAL_DOWNLOAD_FILE_URL } from "../../urls.js";
import { DENTAL_DELETE_FILE } from "../../urls.js";

export default {
    name: 'DentalAttachments',
    props: ['dentalService', 'dentalServiceDuplicated', 'dentalFiles',
			'dentalFilesDuplicated', 'panelModel', 'showDownload'
			],
	data() {
		return {
			modelPanel: this.panelModel,
			showDownloadButton: this.showDownload,
			loadingDownloadId: null,
		};
	},
	watch: {
		panelModel(newValue) {
			this.modelPanel = newValue;
		},
		showDownload(newValue) {
			this.showDownloadButton = newValue;
		}
	},
	computed: {
		fileIndexes() {
			const originalLen = (this.dentalFiles || []).length;
			const duplicatedLen = (this.dentalFilesDuplicated || []).length;
			const max = Math.max(originalLen, duplicatedLen);

			return Array.from({ length: max }, (_, i) => i);
		}
	},
	methods: {
		generateDownload(file){
			axios({
				url: '/'+file,
				method: 'GET',
				responseType: 'blob',
			}).then((response) => {
				// create file link in browser's memory
				const href = URL.createObjectURL(response.data);

				// create "a" HTML element with href to file & click
				const link = document.createElement('a');
				link.href = href;
				link.setAttribute('download', file);
				document.body.appendChild(link);
				link.click();

				// clean up "a" element & remove ObjectURL
				document.body.removeChild(link);
				URL.revokeObjectURL(href);

				//delete generated file for download
				axios.post(DENTAL_DELETE_FILE, {
					params: {
						file: file
					}
				});
			});
		},
		downloadFile (idDownload) {
			this.loadingDownloadId = idDownload;

			axios
			.get(DENTAL_DOWNLOAD_FILE_URL+idDownload)
			.then((resp) => {
				this.generateDownload(resp.data.fileName);
			})
			.catch((err) => console.error(err))
			.finally(() => {
				this.loadingDownloadId = null;
			});

		}
	},
}
</script>