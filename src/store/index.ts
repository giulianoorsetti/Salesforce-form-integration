import type { FormKey, Store } from '@/types'
import { reactive } from 'vue'

export const store = reactive<Store>({
  form: {
    application: '',
    category: '',
    description: '',
    priority: '',
    sector: '',
    subject: '',
    tipology: ''
  },
  auth: {
    bearer: '',
    user: {
      contact: '',
      email: '',
      id: '',
      phone: '',
      site: '',
      team: ''
    }
  },
  resetForm() {
    Object.keys(this.form).forEach((key) => this.updateForm(key as FormKey, ''))
  },
  updateForm(key: FormKey, value: string) {
    if (key === 'sector') {
      this.form.category = ''
      this.form.priority = ''
      this.form.tipology = ''
    }

    this.form[key] = value
  }
})
