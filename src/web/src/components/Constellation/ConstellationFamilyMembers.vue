<template>
    <v-expansion-panels multiple v-model="modelPanel">
        <v-expansion-panel class="mb-6">
            <v-expansion-panel-header>
                Family Members Information&nbsp;{{titleLabel}}
            </v-expansion-panel-header>
            <v-expansion-panel-content>
            <v-expansion-panels
                v-model="modelMembers"
                multiple
            >
                <v-expansion-panel
                    v-for="(items, index) in familyMembers"
                    :key="index"
                >
                    <v-expansion-panel-header class="panel-header-familyMember">
                        {{ items.first_name_family_member }}
                    </v-expansion-panel-header>
                    <v-expansion-panel-content class="panel-content-familyMember">
                    <v-expansion-panels
                        multiple
                        v-model="modelMembersCategory"
                    >
                        <v-expansion-panel class="mb-3">
                            <v-expansion-panel-header>
                                Applicant Personal Information
                            </v-expansion-panel-header>
                            <v-expansion-panel-content>
                                <v-simple-table>
                                <template v-slot:default>
                                    <thead class="table-details-header">
                                    <tr>
                                        <th>
                                        <b>Field</b>
                                        </th>
                                        <th>
                                        <b>Value</b>
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr>
                                        <td>First Name</td>
                                        <td>{{ items.first_name_family_member }}</td>
                                    </tr>
                                    <tr>
                                        <td>Last Name</td>
                                        <td>{{ items.last_name_family_member }}</td>
                                    </tr>
                                    <tr>
                                        <td>Is this their legal name?</td>
                                        <td>
                                        {{ items.is_this_your_legal_name_family_member }}
                                        </td>
                                    </tr>

                                    <tr v-if="items.your_legal_name_family_member">
                                        <td>Legal Name</td>
                                        <td>{{ items.your_legal_name_family_member }}</td>
                                    </tr>

                                    <tr v-if="items.pronouns_family_member">
                                        <td>Pronouns</td>
                                        <td>{{ items.pronouns_family_member }}</td>
                                    </tr>

                                    <tr v-if="items.date_of_birth_family_member">
                                        <td>Date of birth</td>
                                        <td>{{ items.date_of_birth_family_member }}</td>
                                    </tr>

                                    <tr v-if="items.have_yhcip_family_member">
                                        <td>Does this person have a Yukon health care card?</td>
                                        <td>{{ items.have_yhcip_family_member }}</td>
                                    </tr>

                                    <tr v-if="items.yhcip_family_member">
                                        <td>Health care card number</td>
                                        <td>{{ items.yhcip_family_member }}</td>
                                    </tr>

                                    <tr v-if="items.health_care_card_family_member">
                                        <td>Health care card number</td>
                                        <td>{{ items.health_care_card_family_member }}</td>
                                    </tr>

                                    <tr v-if="items.province_family_member">
                                        <td>
                                        Which province or territory is their card from?
                                        </td>
                                        <td>{{ items.province_family_member }}</td>
                                    </tr>

                                    <tr v-if="items.relationship_family_member">
                                        <td>How is this person related to you?</td>
                                        <td>{{ items.relationship_family_member }}</td>
                                    </tr>

                                    <tr v-if="items.prefer_to_be_contacted_family_member">
                                        <td>How would you prefer to be contacted?</td>
                                        <td>
                                        {{ items.prefer_to_be_contacted_family_member }}
                                        </td>
                                    </tr>

                                    <tr v-if="items.phone_number_family_member">
                                        <td>Phone number</td>
                                        <td>{{ items.phone_number_family_member }}</td>
                                    </tr>

                                    <tr v-if="items.email_address_family_member">
                                        <td>Email Address</td>
                                        <td>{{ items.email_address_family_member }}</td>
                                    </tr>

                                    <tr v-if="items.leave_phone_message_family_member">
                                        <td>
                                        Is it okay to leave a message at this number?
                                        </td>
                                        <td>
                                        {{ items.leave_phone_message_family_member }}
                                        </td>
                                    </tr>

                                    <tr
                                        v-if="
                                        items.language_prefer_to_receive_services_family_member
                                        "
                                    >
                                        <td>
                                        What language does this person prefer to receive services in?
                                        </td>
                                        <td>
                                        {{
                                            items.language_prefer_description_family_member
                                        }}
                                        </td>
                                    </tr>

                                    <tr v-if="items.preferred_language_family_member">
                                        <td>Other language</td>
                                        <td>
                                        {{ items.preferred_language_family_member }}
                                        </td>
                                    </tr>

                                    <tr v-if="items.interpretation_support_family_member">
                                        <td>
                                        If accepted, would you prefer interpretation
                                        support to attend appointments with an English
                                        provider?
                                        </td>
                                        <td>
                                        {{ items.interpretation_support_family_member }}
                                        </td>
                                    </tr>

                                    <tr v-if="items.demographics_groups_family_member">
                                        <td>
                                        Does this person identify with one or more of these groups?
                                        </td>
                                        <td>
                                        {{ items.demographic_description_family_member }}
                                        </td>
                                    </tr>
                                    </tbody>
                                </template>
                                </v-simple-table>
                            </v-expansion-panel-content>
                        </v-expansion-panel>

                        <v-expansion-panel class="mb-3">
                            <v-expansion-panel-header>
                                Other Information
                            </v-expansion-panel-header>
                            <v-expansion-panel-content>
                                <v-simple-table>
                                <template v-slot:default>
                                    <thead class="table-details-header">
                                    <tr>
                                        <th>
                                        <b>Field</b>
                                        </th>
                                        <th>
                                        <b>Value</b>
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr v-if="items.family_physician_family_member">
                                        <td>Does this person currently have a family physician?</td>
                                        <td>{{ items.family_physician_family_member }}</td>
                                    </tr>

                                    <tr
                                        v-if="items.current_family_physician_family_member"
                                    >
                                        <td>Who is their current family physician?</td>
                                        <td>
                                        {{ items.current_family_physician_family_member }}
                                        </td>
                                    </tr>

                                    <tr v-if="items.accessing_health_care_family_member">
                                        <td>Where have you been accessing health care?</td>
                                        <td>
                                        {{ items.accessing_health_care_family_member }}
                                        </td>
                                    </tr>

                                    <tr v-if="items.diagnosis_family_member">
                                        <td>
                                        Diagnosis history
                                        </td>
                                        <td>{{ items.diagnosis_family_member }}</td>
                                    </tr>
                                    </tbody>
                                </template>
                                </v-simple-table>
                            </v-expansion-panel-content>
                        </v-expansion-panel>
                    </v-expansion-panels>
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </v-expansion-panels>
            </v-expansion-panel-content>
        </v-expansion-panel>
    </v-expansion-panels>
</template>
<script>
export default {
    name: "ConstellationFamilyMembers",
    props: ["familyMembers", "panelModel", "titleLabel"],
    data() {
        return {
            modelPanel: this.panelModel,
            modelMembers: [],
            modelMembersCategory: [0, 1]
        };
    },
    watch: {
        panelModel(newValue) {
            this.modelPanel = newValue;
        },
        familyMembers: {
            immediate: true,
            deep: true,
            handler(newValue) {
                const count = Object.keys(newValue).length;
                this.modelMembers = Array.from({ length: count }, (_, index) => index);
            },
        },
    },
    created() {
		const count = Object.keys(this.familyMembers).length;
		this.modelMembers = Array.from({ length: count }, (_, index) => index);
	}
};
</script>
