<template>
  <a-space align="center">
    <a-form
      layout="inline"
      :model="formState"
      @finish="handleFinish"
      @finishFailed="handleFinishFailed"
    >
      <a-form-item>
        <a-input v-model:value="formState.user" placeholder="Username">
          <template #prefix
            ><UserOutlined style="color: rgba(0, 0, 0, 0.25)"
          /></template>
        </a-input>
      </a-form-item>
      <a-form-item>
        <a-input
          v-model:value="formState.password"
          type="password"
          placeholder="Password"
        >
          <template #prefix
            ><LockOutlined style="color: rgba(0, 0, 0, 0.25)"
          /></template>
        </a-input>
      </a-form-item>
      <a-form-item>
        <a-button
          type="primary"
          html-type="submit"
          :disabled="formState.user === '' || formState.password === ''"
        >
          Log in
        </a-button>
      </a-form-item>
    </a-form>
  </a-space>
</template>

<script lang="ts">
import { UserOutlined, LockOutlined } from "@ant-design/icons-vue";
import { ValidateErrorEntity } from "ant-design-vue/es/form/interface";
import { defineComponent, reactive, UnwrapRef } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import idsRequest from "@/common/axios/idsRequest";
import { message } from "ant-design-vue";
import config from "@/common/config/index";

interface FormState {
  user: string;
  password: string;
}
export default defineComponent({
  setup() {
    const formState: UnwrapRef<FormState> = reactive({
      user: "admin",
      password: "1q2w3E*4r",
    });

    const handleFinish = (values: FormState) => {
      console.log(values, formState);
      login();
    };

    const handleFinishFailed = (errors: ValidateErrorEntity<FormState>) => {
      console.log(errors);
    };

    const store = useStore();
    const router = useRouter();
    const login = () => {
      const hide = message.loading("登入中..", 0);
      const data = {
        UserNameOrEmailAddress: formState.user,
        Password: formState.password,
        RememberMe: true,
        GoogleToken: "",
      };
      idsRequest
        .post(config.api.login_with_captcha, data)
        .then((res: any) => {
          if (res.data.access_token !== null) {
            //登入驗證成功
            // resetErrMsg()
            store.commit("setAccessToken", res.data.access_token);
            store.commit("setRefreshToken", res.data.refresh_token);
            // logged()

            store.commit("login");
            router.push("/");
          } else {
            //失敗
            // showErrMsg(res.data.error_description)
            // store.commit('loaded')
            console.log("失敗");
          }
        })
        .catch((error) => {
          console.log(error);
          // store.commit('loaded')
        })
        .finally(hide);
    };

    return {
      formState,
      handleFinish,
      handleFinishFailed,
    };
  },
  components: {
    UserOutlined,
    LockOutlined,
  },
});
</script>

