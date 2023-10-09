<script setup lang="ts">
import { store } from '@/store'
import type { FormItem, Option } from '@/types'

type FormItemProps = {
  item: FormItem
}

const { item } = defineProps<FormItemProps>()

const disabled = (item: FormItem) => {
  return (
    (item.id === 'tipology' &&
      !store.form.sector &&
      !item.options?.filter((option) => option.sectorId === store.form.sector).length) ||
    (item.id === 'category' &&
      !store.form.tipology &&
      !item.options?.filter((option) => option.sectorId === store.form.tipology).length)
  )
}

const filter = (item: FormItem, option: Option) => {
  if (!['category', 'tipology'].includes(item.id)) return true

  return (
    (item.id === 'tipology' && option.sectorId === store.form.sector) ||
    (item.id === 'category' && option.sectorId === store.form.tipology)
  )
}
</script>

<template>
  <div class="wrapper">
    <sl-input
      v-if="item.selector === 'input'"
      v-model="store.form[item.id]"
      :label="item.label"
      :type="item.type"
    ></sl-input>

    <sl-textarea
      v-else-if="item.selector === 'textarea' && item.id !== 'categoryDescription'"
      v-model="store.form[item.id]"
      resize="auto"
      rows="15"
      :label="item.label"
      :type="item.type"
    ></sl-textarea>

    <sl-textarea
      v-else-if="item.selector === 'textarea' && item.id === 'categoryDescription'"
      resize="auto"
      rows="3"
      disabled
      :label="item.label"
      :type="item.type"
      :value="item.options?.find((option) => option.sectorId === store.form.category)?.value"
    ></sl-textarea>

    <sl-select
      v-if="item.selector === 'option' && item.id !== 'application'"
      v-model="store.form[item.id]"
      :disabled="disabled(item)"
      :label="item.label"
      @sl-input="store.updateForm(item.id, $event.target.value)"
    >
      <sl-option value="">---</sl-option>
      <sl-option
        v-for="option of item.options?.filter((option) => filter(item, option))"
        :key="option.id"
        :value="option.id"
      >
        {{ option.value }}
      </sl-option>
    </sl-select>

    <sl-select
      v-if="item.selector === 'option' && item.id === 'application' && store.form.sector === '0'"
      v-model="store.form[item.id]"
      :disabled="disabled(item)"
      :label="item.label"
      @sl-input="store.updateForm(item.id, $event.target.value)"
    >
      <sl-option value="">---</sl-option>
      <sl-option
        v-for="option of item.options?.filter((option) => filter(item, option))"
        :key="option.id"
        :value="option.id"
      >
        {{ option.value }}
      </sl-option>
    </sl-select>
  </div>
</template>
