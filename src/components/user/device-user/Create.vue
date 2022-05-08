<template>
  <div>
    <a-button type="ghost" @click="showModal">創建帳號</a-button>

    <a-modal
      v-model:visible="visible"
      :confirm-loading="loading"
      title="創建帳號"
      @ok="onSubmit"
      @cancel="hideModal"
      ok-text="送出"
      cancel-text="取消"
    >
      <a-form
        ref="formRef"
        :model="formState"
        :rules="rules"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-form-item ref="email" label="信箱" name="email">
          <a-input v-model:value="formState.email" />
        </a-form-item>
        <a-form-item ref="name" label="姓名" name="name">
          <a-input v-model:value="formState.name" />
        </a-form-item>
        <a-form-item ref="password" label="密碼" name="password">
          <a-input-password v-model:value="formState.password" />
        </a-form-item>
        <a-form-item ref="phone" label="電話" name="phone">
          <a-input v-model:value="formState.phone" />
        </a-form-item>
        <a-form-item ref="status" label="帳號狀態" name="status">
          <a-switch v-model:checked="formState.status" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts">
import {
  RuleObject,
  ValidateErrorEntity,
} from "ant-design-vue/es/form/interface";
import { defineComponent, ref, toRaw } from "vue";
import apiRequest from "@/common/axios/apiRequest";
import config from "@/common/config/index";

interface FormState {
  email: string;
  name: string;
  password: string;
  phone: string | null;
  status: boolean;
}

export default defineComponent({
  setup(props, { emit }) {
    const visible = ref<boolean>(false);
    const loading = ref<boolean>(false);

    const showModal = () => {
      visible.value = true;
    };

    const hideModal = () => {
      visible.value = false;
      formRef.value.resetFields();
      emit("hideModal");
    };
    
    const formRef = ref();
    const formState = ref<FormState>({
      email: "",
      name: "",
      password: "",
      phone: "",
      status: true,
    });

    let validateEmail = async (rule: RuleObject, value: string) => {
      if (!value) {
        return Promise.reject("請輸入信箱");
      } else {
        const emailRegxp = /[\w-]+@([\w-]+\.)+[\w-]+/;
        if (!emailRegxp.test(value)) {
          return Promise.reject("信箱有誤");
        }
        return Promise.resolve();
      }
    };

    let validatePassword = async (rule: RuleObject, value: string) => {
      if (!value) {
        return Promise.reject("請輸入密碼");
      } else {
        const regxp =
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,}/;
        if (!regxp.test(value)) {
          return Promise.reject("密碼有誤");
        }
        return Promise.resolve();
      }
    };

    const rules = {
      email: [
        {
          required: true,
          validator: validateEmail,
          trigger: "blur",
        },
      ],
      name: [
        {
          required: true,
          message: "請輸入姓名",
          trigger: "blur",
        },
      ],
      password: [
        {
          required: true,
          validator: validatePassword,
          trigger: "blur",
        },
      ],
    };

    const onSubmit = () => {
      formRef.value
        .validate()
        .then(() => {
          createData();
          console.log("values", formState, toRaw(formState));
        })
        .catch((error: ValidateErrorEntity<FormState>) => {
          console.log("error", error);
        });
    };

    const createData = () => {
      loading.value = true;
      apiRequest
        .post(config.api.register_user, {
          ...formState.value,
        })
        .then(() => {
          formRef.value.resetFields();
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          loading.value = false;
          hideModal();
        });
    };

    return {
      visible,
      loading,
      showModal,
      hideModal,
      //
      formRef,
      labelCol: { span: 6 },
      wrapperCol: { span: 17, offset: 1 },
      formState,
      rules,
      onSubmit,
    };
  },
});
</script>


