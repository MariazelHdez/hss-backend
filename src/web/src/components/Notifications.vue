<template>
  <v-snackbar v-model="visible" right :color="color">
    <v-icon class="mr-3">{{ icon }}</v-icon>
    {{ text }}
  </v-snackbar>
</template>

<script>
export default {
  name: "Home",
  data: () => ({
    visible: null,
    color: "",
    text: "",
    icon: "",
  }),
  methods: {
    show(color, icon, message) {
      this.color = color;
      this.icon = icon;
      this.text = message;
      this.visible = true;
    },
    showSuccess(message) {
      this.color = "green";
      this.icon = "mdi-thumb-up";
      this.text = message;
      this.visible = true;
    },
    showError(message) {
      this.color = "red";
      this.icon = "mdi-thumb-down";
      this.text = message;
      this.visible = true;
    },
    showAPIMessages(apiResponse) {
      if (apiResponse?.message && apiResponse?.type) {
        if (apiResponse.type === "success") {
          this.showSuccess(apiResponse.message);
        } else if (apiResponse.type === "error") {
          this.showError(apiResponse.message);
        } else {
          this.show(apiResponse.type, "mdi-help-circle", apiResponse.message);
        }

        return;
      }else{
        this.show("primary", "mdi-information", "Something wrong when showing Notification");
      }
    },
  },
};
</script>