<template>
  <div class="p-4 max-w-2xl mx-auto bg-white rounded shadow my-6">
    <div v-if="!template">
      <p>Loading form...</p>
    </div>
    <div v-else>
      <h2 class="text-2xl font-bold mb-2">{{ template.title }}</h2>
      <p class="text-gray-600 mb-6">{{ template.description }}</p>

      <form @submit.prevent="submitForm" class="space-y-4">
        <div v-for="field in template.fields" :key="field.id">
          <label class="block font-medium mb-1">
            {{ field.label }} <span v-if="field.required" class="text-red-500">*</span>
          </label>

          <input
            v-if="field.type === 'text' || field.type === 'date'"
            :type="field.type"
            v-model="formData[field.id]"
            :required="field.required"
            class="border p-2 w-full rounded"
          />

          <div v-else-if="field.type === 'checkbox'">
            <label class="flex items-center gap-2">
              <input type="checkbox" v-model="formData[field.id]" :required="field.required" />
              <span>Yes</span>
            </label>
          </div>

          <div v-else-if="field.type === 'signature'" class="border p-4 bg-gray-50 text-center rounded">
            <!-- Simulated signature pad -->
            <p class="text-sm text-gray-500 mb-2">Sign below:</p>
            <input type="text" v-model="formData[field.id]" :required="field.required" placeholder="Type full name to sign" class="border-b bg-transparent outline-none text-center w-full" />
          </div>
        </div>

        <div class="pt-4 border-t mt-6">
          <button type="submit" class="w-full bg-blue-600 text-white p-3 rounded font-bold hover:bg-blue-700">Submit Form</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useFormStore } from '../stores/forms.js';
import { useAuthStore } from '../stores/auth.js';

const route = useRoute();
const router = useRouter();
const formStore = useFormStore();
const authStore = useAuthStore();

const template = ref<any>(null);
const formData = ref<Record<string, any>>({});

onMounted(async () => {
  await formStore.fetchTemplates();
  template.value = formStore.templates.find((t: any) => t.id === route.params.id);

  if (template.value) {
    // Initialize form data object
    template.value.fields.forEach((f: any) => {
      formData.value[f.id] = f.type === 'checkbox' ? false : '';
    });
  }
});

const submitForm = async () => {
  const patientId = authStore.user ? authStore.user.id : 'anonymous';

  const submission = {
    templateId: template.value.id,
    patientId: patientId, // Now dynamically sourced
    data: formData.value
  };

  await formStore.submitForm(submission);
  alert('Form submitted successfully!');
  router.push('/patient');
};
</script>
