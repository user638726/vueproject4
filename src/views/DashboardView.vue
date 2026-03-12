<template>
  <main class="container py-4">
    <h1 class="mb-4">Dashboard</h1>

    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title mb-3">帳號列表 (GET /accounts)</h5>
        <button
          type="button"
          class="btn btn-outline-primary mb-3"
          :disabled="loadingList"
          @click="fetchAccounts"
        >
          {{ loadingList ? '載入中...' : '取得帳號列表' }}
        </button>
        <p v-if="errorList" class="text-danger mb-2 small">{{ errorList }}</p>
        <div v-if="accounts.length > 0" class="table-responsive">
          <table class="table table-sm table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>姓名</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="acc in accounts" :key="(acc as { id?: string }).id">
                <td class="text-break">{{ (acc as { id?: string }).id }}</td>
                <td>{{ (acc as { name?: string }).name }}</td>
                <td>{{ (acc as { email?: string }).email }}</td>
                <td>{{ (acc as { roleLevel?: string }).roleLevel }}</td>
                <td>{{ (acc as { status?: string }).status }}</td>
                <td>
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-secondary"
                    @click="selectAccount((acc as { id?: string }).id)"
                  >
                    讀取
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else-if="!loadingList && accountsFetched" class="text-muted mb-0 small">尚無帳號資料。</p>
      </div>
    </div>

    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title mb-3">讀取單一帳號 (Read)</h5>
        <div class="input-group mb-2">
          <span class="input-group-text">Account ID</span>
          <input
            v-model="accountId"
            type="text"
            class="form-control"
            placeholder="輸入帳號 ID"
          />
          <button
            type="button"
            class="btn btn-primary"
            :disabled="loading"
            @click="fetchAccount"
          >
            {{ loading ? '載入中...' : '讀取' }}
          </button>
        </div>
        <p v-if="error" class="text-danger mb-0 small">{{ error }}</p>
        <p v-else-if="message" class="text-success mb-0 small">{{ message }}</p>
      </div>
    </div>

    <div v-if="account" class="card mb-4">
      <div class="card-header">帳號內容</div>
      <div class="card-body">
        <div class="row g-2 mb-3">
          <div class="col-md-6">
            <label class="form-label">姓名</label>
            <input v-model="editForm.name" type="text" class="form-control" />
          </div>
          <div class="col-md-6">
            <label class="form-label">Email</label>
            <input v-model="editForm.email" type="email" class="form-control" />
          </div>
          <div class="col-md-6">
            <label class="form-label">Role Level</label>
            <select v-model="editForm.roleLevel" class="form-select">
              <option value="ADMIN">ADMIN</option>
              <option value="USER">USER</option>
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label">Status</label>
            <select v-model="editForm.status" class="form-select">
              <option value="ON">ON</option>
              <option value="OFF">OFF</option>
            </select>
          </div>
        </div>
        <div class="d-flex gap-2">
          <button
            type="button"
            class="btn btn-primary"
            :disabled="loading"
            @click="updateAccount"
          >
            {{ loading ? '處理中...' : '更新 (Update)' }}
          </button>
          <button
            type="button"
            class="btn btn-danger"
            :disabled="loading"
            @click="confirmDelete"
          >
            刪除 (Delete)
          </button>
        </div>
      </div>
    </div>

    <p v-else class="text-muted">請輸入 Account ID 並點擊「讀取」取得帳號資料。</p>

    <!-- 刪除確認 Modal -->
    <div
      v-if="showDeleteModal"
      class="modal d-block"
      tabindex="-1"
      style="background: rgba(0,0,0,0.5)"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">確認刪除</h5>
            <button type="button" class="btn-close" @click="showDeleteModal = false" aria-label="Close"></button>
          </div>
          <div class="modal-body">確定要刪除此帳號嗎？此操作無法復原。</div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showDeleteModal = false">取消</button>
            <button type="button" class="btn btn-danger" @click="deleteAccount">確定刪除</button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script lang="ts">
const baseUrl = () => `${import.meta.env.VITE_API}`

export default {
  data() {
    return {
      accountId: '',
      account: null as Record<string, unknown> | null,
      editForm: {
        name: '',
        email: '',
        roleLevel: 'ADMIN',
        status: 'ON',
      },
      loading: false,
      error: '',
      message: '',
      showDeleteModal: false,
      accounts: [] as Record<string, unknown>[],
      loadingList: false,
      errorList: '',
      accountsFetched: false,
    }
  },
  created() {
    const token = document.cookie.replace(
      /(?:(?:^|.*;\s*)hexToken\s*=\s*([^;]*).*$)|^.*$/,
      '$1'
    )
    this.$http.defaults.headers.common.Authorization = token
  },
  methods: {
    async fetchAccounts() {
      this.loadingList = true
      this.errorList = ''
      try {
        const { data } = await this.$http.get(`${baseUrl()}accounts`)
        console.log(data);
        const raw = Array.isArray(data) ? data : (data?.data ?? data?.accounts)
        this.accounts = Array.isArray(raw) ? raw : []
        this.accountsFetched = true
      } catch (e: unknown) {
        const err = e as { response?: { data?: { message?: string } } }
        this.errorList = err.response?.data?.message ?? '取得帳號列表失敗'
        this.accounts = []
      } finally {
        this.loadingList = false
      }
    },
    selectAccount(id: string | undefined) {
      if (id) {
        this.accountId = id
        this.fetchAccount()
      }
    },
    async fetchAccount() {
      if (!this.accountId?.trim()) {
        this.error = '請輸入 Account ID'
        return
      }
      this.loading = true
      this.error = ''
      this.message = ''
      try {
        const { data } = await this.$http.get(`${baseUrl()}account/${this.accountId}`)
        console.log(data);
        this.account = data ?? null
        if (this.account) {
          this.editForm.name = (this.account.name as string) ?? ''
          this.editForm.email = (this.account.email as string) ?? ''
          this.editForm.roleLevel = (this.account.roleLevel as string) ?? 'ADMIN'
          this.editForm.status = (this.account.status as string) ?? 'ON'
          this.message = '讀取成功'
        }
      } catch (e: unknown) {
        const err = e as { response?: { data?: { message?: string } } }
        this.error = err.response?.data?.message ?? '讀取失敗'
        this.account = null
      } finally {
        this.loading = false
      }
    },
    async updateAccount() {
      if (!this.accountId?.trim() || !this.account) return
      this.loading = true
      this.error = ''
      this.message = ''
      try {
        await this.$http.patch(`${baseUrl()}update-account/${this.accountId}`, this.editForm)
        this.message = '更新成功'
        this.account = { ...this.account, ...this.editForm }
        await this.fetchAccounts()
      } catch (e: unknown) {
        const err = e as { response?: { data?: { message?: string } } }
        this.error = err.response?.data?.message ?? '更新失敗'
      } finally {
        this.loading = false
      }
    },
    confirmDelete() {
      this.showDeleteModal = true
    },
    async deleteAccount() {
      if (!this.accountId?.trim()) return
      this.showDeleteModal = false
      this.loading = true
      this.error = ''
      this.message = ''
      try {
        await this.$http.delete(`${baseUrl()}delete-account/${this.accountId}`)
        this.message = '已刪除'
        this.account = null
        this.accountId = ''
        this.editForm = { name: '', email: '', roleLevel: 'ADMIN', status: 'ON' }
        await this.fetchAccounts()
      } catch (e: unknown) {
        const err = e as { response?: { data?: { message?: string } } }
        this.error = err.response?.data?.message ?? '刪除失敗'
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
.container {
  max-width: 720px;
}
</style>
