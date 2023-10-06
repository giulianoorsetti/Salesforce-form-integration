<script setup lang="ts">
import FormItem from '@/components/TheFormItem.vue'
import TheToast from '@/components/TheToast.vue'
import {
  APPLICATION_ENDPOINT,
  CASE_ENDPOINT,
  CATEGORY_DESC_ENDPOINT,
  CATEGORY_ENDPOINT,
  FORM_ITEMS,
  SECTOR_ENDPOINT,
  TIPOLOGY_ENDPOINT
} from '@/constants'
import { store } from '@/store'
import type { ApiResponse, Form, FormItems, FormKey, Values } from '@/types'
import axios from 'axios'
import { computed, ref, watchEffect } from 'vue'

type TheFormProps = {
  form: Form
}

const { form } = defineProps<TheFormProps>()

const elements = ref<FormItems>(FORM_ITEMS)
const toast = ref<InstanceType<typeof TheToast>>()

const sortedElements = computed(() => [...elements.value].sort((x, y) => x.order - y.order))

const handleSubmit = async () => {
  store.form.categoryDescription =
    elements.value
      .find((element) => element.id === 'categoryDescription')
      ?.options?.find((option) => option.sectorId === store.form.category)?.value ?? ''

  if (store.form.sector === '1') store.form.application = 'temp'

  if (!Object.values(form).every((value) => !!value)) return

  const body = {
    Application__c: elements.value
      .find((element) => element.id === 'application')
      ?.options?.find((option) => option.id === parseInt(form.application))?.value,
    Category__c: elements.value
      .find((element) => element.id === 'category')
      ?.options?.find((option) => option.id === parseInt(form.category))?.value,
    Category_Description__c: elements.value
      .find((element) => element.id === 'categoryDescription')
      ?.options?.find((option) => option.sectorId === store.form.category)?.value,
    Description: form.description,
    Origin: 'Smart',
    Priority: elements.value
      .find((element) => element.id === 'priority')
      ?.options?.find((option) => option.id === parseInt(form.priority))?.value,
    Sector__c: elements.value
      .find((element) => element.id === 'sector')
      ?.options?.find((option) => option.id === parseInt(form.sector))?.value,
    Subject: form.subject,
    Tipology__c: elements.value
      .find((element) => element.id === 'tipology')
      ?.options?.find((option) => option.id === parseInt(form.tipology))?.value,
    Contact_Key__c: store.auth.user.id,
    SuppliedEmail: store.auth.user.email,
    SuppliedName: store.auth.user.contact,
    SuppliedPhone: store.auth.user.phone,
    Web_Team__c: store.auth.user.team,
    Web_Site__c: store.auth.user.site,
    Function__c: store.auth.user.function,
    Web_Function__c: store.auth.user.function
  }

  if (store.form.sector === '1') delete body.Application__c

  const id = await axios
    .post<{ id: string }>(CASE_ENDPOINT, body, { headers: store.auth.headers })
    .then((res) => {
      if (res.status === 201) {
        toast.value?.show('Ticket creato con successo.', 'success')
      }

      return res.data.id
    })
    .catch(() => toast.value?.show('Impossibile creare il ticket.', 'danger'))

  if (!id) return

  Object.keys(form).forEach((key) => store.updateForm(key as FormKey, ''))
}

watchEffect(async () => {
  if (!store.auth.headers.Authorization) return

  await Promise.all([
    axios.get<ApiResponse>(APPLICATION_ENDPOINT, { headers: store.auth.headers }),
    axios.get<ApiResponse>(CATEGORY_ENDPOINT, { headers: store.auth.headers }),
    axios.get<ApiResponse>(SECTOR_ENDPOINT, { headers: store.auth.headers }),
    axios.get<ApiResponse>(TIPOLOGY_ENDPOINT, { headers: store.auth.headers }),
    axios.get<ApiResponse>(CATEGORY_DESC_ENDPOINT, { headers: store.auth.headers })
  ])
    .then<Values[]>((res) => res.map((r) => r.data.values))
    .then(([applications, categories, sectors, tipologies, descriptions]) => {
      if (elements.value.find((element) => element.id === 'application')?.options?.length === 0) {
        applications.forEach((application, index) => {
          elements.value
            .find((element) => element.id === 'application')
            ?.options?.push({ id: index, value: application.value })
        })
      }

      if (elements.value.find((element) => element.id === 'category')?.options?.length === 0) {
        categories.forEach((category, index) => {
          elements.value
            .find((element) => element.id === 'category')
            ?.options?.push({
              id: index,
              value: category.value,
              sectorId: `${category.validFor[0]}`
            })
        })
      }

      if (elements.value.find((element) => element.id === 'sector')?.options?.length === 0) {
        sectors.forEach((sector, index) => {
          elements.value
            .find((element) => element.id === 'sector')
            ?.options?.push({ id: index, value: sector.value })
        })
      }

      if (elements.value.find((element) => element.id === 'tipology')?.options?.length === 0) {
        tipologies.forEach((tipology, index) => {
          elements.value
            .find((element) => element.id === 'tipology')
            ?.options?.push({
              id: index,
              value: tipology.value,
              sectorId: `${tipology.validFor[0]}`
            })
        })
      }

      if (
        elements.value.find((element) => element.id === 'categoryDescription')?.options?.length ===
        0
      ) {
        descriptions.forEach((description, index) => {
          elements.value
            .find((element) => element.id === 'categoryDescription')
            ?.options?.push({
              id: index,
              value: description.value,
              sectorId: `${description.validFor[0]}`
            })
        })
      }
    })
    .catch(console.error)
})
</script>

<template>
  <div class="container">
    <form @submit.prevent="handleSubmit">
      <div class="row">
        <div class="col-2">
          <div v-for="element of sortedElements.slice(2)" :key="element.id">
            <FormItem :item="element" />
          </div>
        </div>

        <div class="col-8">
          <div v-for="element of sortedElements.slice(0, 2)" :key="element.id">
            <FormItem :item="element" />
          </div>

          <div class="btn-group">
            <sl-button size="small" type="submit" variant="neutral"> Invia </sl-button>
            <sl-button
              size="small"
              type="reset"
              variant="primary"
              :disabled="Object.values(form).every((value) => !value)"
              @click="Object.keys(form).forEach((key) => store.updateForm(key as FormKey, ''))"
            >
              Reset
            </sl-button>
          </div>
        </div>
      </div>
    </form>

    <the-toast ref="toast"></the-toast>
  </div>
</template>

<style scoped>
.btn-group {
  display: flex;
  gap: 8px;
}
</style>
