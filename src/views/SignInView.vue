<template>
  <main class="container py-4">
    <h1 class="mb-4">Sign In</h1>

    <form class="card p-4" @submit.prevent="signIn" style="max-width: 420px;">
      <div class="mb-3">
        <label for="Name" class="form-label">Name</label>
        <input
          id="name"
          type="name"
          class="form-control"
          placeholder="name"
          v-model="user.name"
        />
      </div>

      <div class="mb-3">
        <label for="email" class="form-label">email</label>
        <input
          id="email"
          type="email"
          class="form-control"
          placeholder="••••••••"
          v-model="user.email"
        />
      </div>

      <button type="submit" class="btn btn-primary w-100">
        Sign In
      </button>
    </form>
  </main>
</template>

<script lang="ts">
export default {
  data() {
    return {
      user: {
        name: "",
        email: "",
        roleLevel:"ADMIN",
        status:"ON"
      },
    };
  },
  methods: {
    signIn() {
      // 在這裡處理登入邏輯

      const api = `${import.meta.env.VITE_API}create-account`;
      this.$http.post(api,this.user).then((res) => {
         console.log(res);
        if (res.data.message == "帳號建立成功") {
          const { id } = res.data;
          document.cookie = `hexToken=${id};`;
          this.$router.push("./dashboard");
        }
      });
    },
  },
};
</script>

<style scoped>
.container {
  max-width: 960px;
}
</style>
