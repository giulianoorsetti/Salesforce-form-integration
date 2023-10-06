import type { FormItems } from '@/types'

export const SALESFORCE_ENDPOINT = import.meta.env.VITE_SALESFORCE_ENDPOINT

export const SALESFORCE_CLIENT_ID = import.meta.env.VITE_SALESFORCE_CLIENT_ID

export const SALESFORCE_CLIENT_SECRET = import.meta.env.VITE_SALESFORCE_CLIENT_SECRET

export const SALESFORCE_GRANT_TYPE = import.meta.env.VITE_SALESFORCE_GRANT_TYPE

export const SALESFORCE_USERNAME = import.meta.env.VITE_SALESFORCE_USERNAME

export const SALESFORCE_PASSWORD = import.meta.env.VITE_SALESFORCE_PASSWORD

export const SALESFORCE_OAUTH_ENDPOINT = `${SALESFORCE_ENDPOINT}/oauth2/token`

const SALESFORCE_API_ENDPOINT = `${SALESFORCE_ENDPOINT}/data/v58.0/ui-api/object-info/Case/picklist-values/012000000000000AAA`

export const QUERY_ENDPOINT = `${SALESFORCE_ENDPOINT}/data/v58.0/query/`

export const APPLICATION_ENDPOINT = `${SALESFORCE_API_ENDPOINT}/Application__c`

export const CASE_ENDPOINT = `${SALESFORCE_ENDPOINT}/data/v58.0/sobjects/Case`

export const CASE_INTERNAL_ENDPOINT = `${SALESFORCE_ENDPOINT}/data/v58.0/sobjects/CaseInternal__c`

export const CATEGORY_ENDPOINT = `${SALESFORCE_API_ENDPOINT}/Category__c`

export const CATEGORY_DESC_ENDPOINT = `${SALESFORCE_API_ENDPOINT}/Category_Description__c`

export const SECTOR_ENDPOINT = `${SALESFORCE_API_ENDPOINT}/Sector__c`

export const TIPOLOGY_ENDPOINT = `${SALESFORCE_API_ENDPOINT}/Tipology__c`

export const SPARTA_ENDPOINT = import.meta.env.VITE_SPARTA_ENDPOINT

export const FORM_ITEMS: FormItems = [
  {
    id: 'subject',
    label: 'Oggetto',
    selector: 'input',
    order: 0,
    type: 'text'
  },
  {
    id: 'description',
    label: 'Descrizione',
    selector: 'textarea',
    order: 1
  },
  {
    id: 'application',
    label: 'Applicazione',
    selector: 'option',
    order: 3,
    options: []
  },
  {
    id: 'sector',
    label: 'Sezione',
    selector: 'option',
    order: 2,
    options: []
  },

  {
    id: 'tipology',
    label: 'Tipologia',
    selector: 'option',
    order: 4,
    options: []
  },
  {
    id: 'category',
    label: 'Categoria',
    selector: 'option',
    order: 5,
    options: []
  },
  {
    id: 'categoryDescription',
    label: 'Descrizione',
    selector: 'textarea',
    order: 6,
    options: []
  },
  {
    id: 'priority',
    label: 'Priorità',
    selector: 'option',
    order: 7,
    options: [
      { id: 0, value: 'Low' },
      { id: 1, value: 'Medium' },
      { id: 2, value: 'High' },
      { id: 3, value: 'Critical' }
    ]
  }
]
