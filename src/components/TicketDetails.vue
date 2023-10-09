<script setup lang="ts">
import { CASE_INTERNAL_ENDPOINT, QUERY_ENDPOINT, SALESFORCE_ENDPOINT } from '@/constants'
import { store } from '@/store'
import axios from 'axios'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import TheToast from './TheToast.vue'

type TicketDetailsProps = {
  ticketId: string
}

type Case = {
  Name: DetailsInfo
  Origin__c: DetailsInfo
  Application__c: DetailsInfo
  Sector__c: DetailsInfo
  Type__c: DetailsInfo
  Category__c: DetailsInfo
  Reason__c: DetailsInfo
}

type General = {
  Subject__c: DetailsInfo
  Description__c: DetailsInfo
  Date_Time_Opened__c: DetailsInfo
  Date_Time_Closed__c: DetailsInfo
  Contact_Key__c: DetailsInfo
  SuppliedName__c: DetailsInfo
  SuppliedPhone__c: DetailsInfo
  WebEmail__c: DetailsInfo
  Web_Site__c: DetailsInfo
  Web_Team__c: DetailsInfo
}

type Status = {
  Status__c: DetailsInfo
  Comments__c: DetailsInfo
}

type Details = {
  Subject__c: string
  Description__c: string
  Date_Time_Opened__c: string
  Date_Time_Closed__c: string
  Contact__c: string
  Contact_Key__c: string
  CaseInternalLook__c: string
  Contact_Email__c: string
  Contact_Phone__c: string
  SuppliedName__c: string
  SuppliedPhone__c: string
  WebEmail__c: string
  Web_Site__c: string
  Web_Team__c: string
  Name: string
  Origin__c: string
  OwnerId: string
  Application__c: string
  Sector__c: string
  Type__c: string
  Category__c: string
  Reason__c: string
  Status__c: string
  Comments__c: string
}

type DetailsInfo = {
  label: string
  value: string
}

type Comment = {
  Status__c: string
  Comments__c: string
  CreatedDate: string
}

const { ticketId } = defineProps<TicketDetailsProps>()

const caseDetails = ref<Case>({
  Application__c: { label: '', value: '' },
  Category__c: { label: '', value: '' },
  Name: { label: '', value: '' },
  Origin__c: { label: '', value: '' },
  Reason__c: { label: '', value: '' },
  Sector__c: { label: '', value: '' },
  Type__c: { label: '', value: '' }
})
const generalDetails = ref<General>({
  Contact_Key__c: { label: '', value: '' },
  Date_Time_Closed__c: { label: '', value: '' },
  Date_Time_Opened__c: { label: '', value: '' },
  Description__c: { label: '', value: '' },
  Subject__c: { label: '', value: '' },
  SuppliedName__c: { label: '', value: '' },
  SuppliedPhone__c: { label: '', value: '' },
  Web_Site__c: { label: '', value: '' },
  Web_Team__c: { label: '', value: '' },
  WebEmail__c: { label: '', value: '' }
})
const statusDetails = ref<Status>({
  Comments__c: { label: '', value: '' },
  Status__c: { label: '', value: '' }
})

const comment = ref<string>('')

const comments = ref<Comment[]>([])

const query = ref<string>(`
  SELECT Status__c, Comments__c, CreatedDate
  FROM CaseInternalHistory__c
  WHERE CaseInternalName__c = '${ticketId}'
`)

const fileQuery = ref<string>(`
  SELECT Id, ContentDocument.title, ContentDocument.Id, ContentDocument.CreatedDate, ContentDocument.FileExtension
  FROM ContentDocumentLink
  WHERE ContentDocument.IsDeleted = false AND LinkedEntityId = '${ticketId}'
`)

const dialog = ref<any>()

const caseDialog = ref<any>()
const files = ref<FileList | null>()
const inputFiles = ref<any>()
const generalDialog = ref<any>()
const statusDialog = ref<any>()

const ownerId = ref<string>('')
const owner = ref<any>()
const queue = ref<any>()

const filesUploaded = ref<any>([])
const fileDialog = ref<any>()

const toast = ref<InstanceType<typeof TheToast>>()

const queryOwner = computed(
  () => `
  SELECT User.Id, User.Name
  FROM User
  WHERE User.Id = '${ownerId.value}'
`
)

const queryQueue = computed(
  () => `
    SELECT Id, Name
    FROM Group
    WHERE Type = 'Queue' AND Id = '${ownerId.value}'
  `
)

const route = useRoute()

onMounted(async () => {
  generalDialog.value.show()
  caseDialog.value.show()

  await axios
    .get(`${CASE_INTERNAL_ENDPOINT}/${ticketId}`, { headers: store.auth.headers })
    .then<Details>((res) => res.data)
    .then((res) => {
      ownerId.value = res.OwnerId

      caseDetails.value.Application__c = { label: 'Application', value: res.Application__c ?? '-' }
      caseDetails.value.Category__c = { label: 'Category', value: res.Category__c ?? '-' }
      caseDetails.value.Name = { label: 'Case Number', value: res.Name ?? '-' }
      caseDetails.value.Origin__c = { label: 'Origin', value: res.Origin__c ?? '-' }
      caseDetails.value.Reason__c = { label: 'Reason', value: res.Reason__c ?? '-' }
      caseDetails.value.Sector__c = { label: 'Sector', value: res.Sector__c ?? '-' }
      caseDetails.value.Type__c = { label: 'Type', value: res.Type__c ?? '-' }

      generalDetails.value.Contact_Key__c = {
        label: 'Contact Key',
        value: res.Contact_Key__c ?? '-'
      }
      generalDetails.value.Date_Time_Closed__c = {
        label: 'Date / Time Closed',
        value: res.Date_Time_Closed__c ? new Date(res.Date_Time_Closed__c).toDateString() : '-'
      }
      generalDetails.value.Date_Time_Opened__c = {
        label: 'Date / Time Opened',
        value: new Date(res.Date_Time_Opened__c).toDateString()
      }
      generalDetails.value.Description__c = { label: 'Note', value: res.Description__c ?? '-' }
      generalDetails.value.Subject__c = { label: 'Subject', value: res.Subject__c ?? '-' }
      generalDetails.value.SuppliedName__c = {
        label: 'Web Name',
        value: res.SuppliedName__c ?? '-'
      }
      generalDetails.value.SuppliedPhone__c = {
        label: 'Web Phone',
        value: res.SuppliedPhone__c ?? '-'
      }
      generalDetails.value.WebEmail__c =
        { label: 'Web Email', value: res.WebEmail__c ?? '-' } ?? '-'
      generalDetails.value.Web_Site__c = { label: 'Web Site', value: res.Web_Site__c ?? '-' }
      generalDetails.value.Web_Team__c = { label: 'Web Email', value: res.Web_Team__c ?? '-' }

      statusDetails.value.Comments__c = { label: 'Comments', value: res.Comments__c ?? '-' }
      statusDetails.value.Status__c = { label: 'Status', value: res.Status__c ?? '-' }
    })
    .catch(console.error)

  await axios
    .get(QUERY_ENDPOINT, {
      headers: store.auth.headers,
      params: {
        q: query.value.trim()
      }
    })
    .then<Comment[]>((res) => res.data.records)
    .then((res) => (comments.value = res))
    .catch(console.error)

  await axios
    .get(QUERY_ENDPOINT, { headers: store.auth.headers, params: { q: queryOwner.value.trim() } })
    .then((res) => res.data.records)
    .then((res) => (owner.value = res[0]?.Name ?? '-'))
    .catch(console.error)

  await axios
    .get(QUERY_ENDPOINT, { headers: store.auth.headers, params: { q: queryQueue.value.trim() } })
    .then((res) => res.data.records)
    .then((res) => (queue.value = res[0].Name ?? '-'))
    .catch(console.error)

  await axios
    .get(QUERY_ENDPOINT, { headers: store.auth.headers, params: { q: fileQuery.value.trim() } })
    .then((res) => res.data.records)
    .then((res) => (filesUploaded.value = res))
    .catch(console.error)
})

const handleDownload = async (id: string, filename: string) => {
  // await axios
  //   .get(`https://covisian6.my.salesforce.com${url}/VersionData`, {
  //     headers: store.auth.headers,
  //     responseType: 'blob'
  //   })
  //   .then((res) => {
  //     const href = URL.createObjectURL(res.data)
  //     const link = document.createElement('a')
  //     link.href = href
  //     link.setAttribute('download', filename)
  //     document.body.appendChild(link)
  //     link.click()
  //     document.body.removeChild(link)
  //     URL.revokeObjectURL(href)
  //   })
  //   .catch(console.error)

  const fileId = await axios
    .get(`${QUERY_ENDPOINT}`, {
      headers: store.auth.headers,
      params: {
        q: `SELECT Id FROM ContentVersion WHERE ContentDocument.Id = '${id}'`
      }
    })
    .then((res) => res.data)
    .then((res) => res.records[0].Id)
    .catch(console.error)

  await axios
    .get(
      `https://covisian6.my.salesforce.com/services/data/v58.0/sobjects/ContentVersion/${fileId}/`,
      {
        headers: store.auth.headers,
        responseType: 'blob'
      }
    )
    .then((res) => {
      const href = URL.createObjectURL(res.data)
      const link = document.createElement('a')
      link.href = href
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(href)
    })
    .catch(console.error)
}

const handleSubmit = async () => {
  await axios
    .patch(
      `${CASE_INTERNAL_ENDPOINT}/${ticketId}`,
      { Comments__c: `[${store.auth.user.contact}] ${comment.value}` },
      { headers: store.auth.headers }
    )
    .then((res) => res.data)
    .catch(console.error)

  comment.value = ''

  await axios
    .get(QUERY_ENDPOINT, {
      headers: store.auth.headers,
      params: {
        q: query.value.trim()
      }
    })
    .then<Comment[]>((res) => res.data.records)
    .then((res) => (comments.value = res))
    .catch(console.error)
}

const handleSubmitFile = async () => {
  const reader = new FileReader()
  reader.readAsDataURL(files.value?.item(0) as Blob)
  reader.onload = async () => {
    const encodedFile = (reader.result as string).split(',')[1]
    await axios
      .post(
        'https://covisian6.my.salesforce.com/services/data/v58.0/sobjects/ContentVersion',
        {
          FirstPublishLocationId: route.params.id,
          Title: files.value?.item(0)?.name,
          Description: files.value?.item(0)?.name,
          VersionData: encodedFile,
          PathOnClient: files.value?.item(0)?.name
        },
        { headers: store.auth.headers }
      )
      .then(() => {
        files.value = null
        inputFiles.value.value = null
        toast.value?.show('File allegato con successo.', 'success')
      })
      .catch(console.error)

    await axios
      .get(QUERY_ENDPOINT, { headers: store.auth.headers, params: { q: fileQuery.value.trim() } })
      .then((res) => res.data.records)
      .then((res) => (filesUploaded.value = res))
      .catch(() => toast.value?.show('Impossibile allegare il file.', 'danger'))
  }
}
</script>

<template>
  <div class="container">
    <div class="row">
      <div class="col-5">
        <sl-details
          ref="generalDialog"
          summary="General"
          @sl-show="statusDialog.hide()"
          @sl-hide="statusDialog.show()"
        >
          <div class="row">
            <div class="col-5">
              <sl-input
                v-for="(detail, index) of Object.values(generalDetails).slice(0, 3)"
                :key="index"
                :label="detail.label"
                :value="detail.value"
                disabled
                filled
              ></sl-input>
              <sl-input
                v-for="(detail, index) of Object.values(generalDetails).slice(5, 6)"
                :key="index"
                :label="detail.label"
                :value="detail.value"
                disabled
                filled
              ></sl-input>
            </div>
            <div class="col-5">
              <sl-input
                v-for="(detail, index) of Object.values(generalDetails).slice(6)"
                :key="index"
                :label="detail.label"
                :value="detail.value"
                disabled
                filled
              ></sl-input>
            </div>
          </div>
          <div
            v-for="(detail, index) of Object.values(generalDetails).slice(3, 5).reverse()"
            :key="index"
          >
            <sl-input
              v-if="detail.label === 'Subject'"
              :label="detail.label"
              :value="detail.value"
              disabled
              filled
            ></sl-input>
            <sl-textarea
              v-if="detail.label === 'Note'"
              :label="detail.label"
              :value="detail.value"
              disabled
              filled
              resize="auto"
            ></sl-textarea>
          </div>
        </sl-details>

        <sl-details
          ref="statusDialog"
          summary="Status"
          @sl-show="generalDialog.hide()"
          @sl-hide="generalDialog.show()"
        >
          <div class="row">
            <div class="col-5">
              <sl-input
                v-for="(detail, index) of Object.values(caseDetails).slice(0, 1)"
                :key="index"
                :label="detail.label"
                :value="detail.value"
                disabled
                filled
              ></sl-input>
              <sl-input
                v-for="(detail, index) of Object.values(caseDetails).slice(5, 7)"
                :key="index"
                :label="detail.label"
                :value="detail.value"
                disabled
                filled
              ></sl-input>
              <sl-input
                v-for="(detail, index) of Object.values(caseDetails).slice(1, 2)"
                :key="index"
                :label="detail.label"
                :value="detail.value"
                disabled
                filled
              ></sl-input>
            </div>
            <div class="col-5">
              <sl-input
                v-for="(detail, index) of Object.values(caseDetails).slice(2, 5)"
                :key="index"
                :label="detail.label"
                :value="detail.value"
                disabled
                filled
              ></sl-input>
              <sl-input :value="owner" disabled filled label="Owner"></sl-input>
              <sl-input :value="queue" disabled filled label="Queue"></sl-input>
            </div>
          </div>
        </sl-details>
      </div>

      <div class="col-5">
        <sl-details ref="caseDialog" summary="Case">
          <div class="wrapper">
            <input
              ref="inputFiles"
              type="file"
              @change="files = ($event.target as HTMLInputElement).files"
            />
            <div>
              <sl-button
                size="small"
                type="submit"
                variant="success"
                :disabled="files?.length === 0 || !files"
                @click="handleSubmitFile"
              >
                Allega
              </sl-button>
              <sl-button size="small" variant="default" @click="fileDialog.show()">
                Visualizza tutti i file
              </sl-button>
            </div>
          </div>

          <sl-textarea
            v-model="comment"
            resize="none"
            rows="15"
            label="Aggiungi commento"
          ></sl-textarea>
          <div class="btn-container">
            <sl-button
              type="submit"
              variant="primary"
              @click="handleSubmit"
              :disabled="!comment.trim()"
            >
              Aggiungi
            </sl-button>
            <sl-button variant="default" @click="dialog.show()">
              Visualizza tutti i commenti
            </sl-button>

            <Transition>
              <sl-dialog
                ref="dialog"
                style="--width: 50vw"
                :label="`Commenti (${comments.length})`"
              >
                <template v-if="comments.length > 0">
                  <div v-for="(comment, index) of comments" class="dialog-container" :key="index">
                    <div class="dialog">
                      <span>Commento:</span>
                      <span>
                        {{ comment.Comments__c }}
                      </span>
                    </div>
                    <div class="dialog">
                      <span>Stato:</span>
                      <span>{{ new Date(comment.CreatedDate).toDateString() }}</span>
                    </div>
                  </div>
                </template>
                <span v-else>Nessun commento.</span>
              </sl-dialog>
            </Transition>
          </div>

          <Transition>
            <sl-dialog ref="fileDialog" :label="`File (${filesUploaded.length})`">
              <template v-if="filesUploaded.length > 0">
                <div v-for="(file, index) of filesUploaded" class="dialog-container" :key="index">
                  <div class="dialog download">
                    <span
                      @click="handleDownload(file.ContentDocument.Id, file.ContentDocument.Title)"
                    >
                      {{ file.ContentDocument.Title }}
                    </span>
                  </div>
                  <div class="dialog">
                    <span>
                      {{ new Date(file.ContentDocument.CreatedDate).toDateString() }}
                    </span>
                  </div>
                </div>
              </template>
              <span v-else>Nessun file.</span>
            </sl-dialog>
          </Transition>

          <Transition>
            <the-toast ref="toast"></the-toast>
          </Transition>
        </sl-details>
      </div>
    </div>
  </div>
</template>

<style scoped>
sl-button,
sl-input {
  margin-bottom: var(--sl-spacing-medium);
}

sl-details,
sl-textarea {
  margin-bottom: var(--sl-spacing-x-small);
}

.btn-container {
  display: flex;
  justify-content: space-between;
}

.dialog-container {
  border-bottom: 1px solid var(--sl-color-neutral-200);
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--sl-spacing-medium);
  padding-bottom: var(--sl-spacing-3x-small);
}

.dialog-container .dialog {
  display: flex;
  flex-direction: column;
}

.dialog-container .dialog.download:hover {
  cursor: pointer;
}

.dialog-container .dialog span:first-child {
  color: var(--sl-color-neutral-500);
  font-size: 12px;
  font-style: italic;
  font-weight: 700;
}

.wrapper {
  align-items: baseline;
  display: flex;
  justify-content: space-between;
}
</style>
