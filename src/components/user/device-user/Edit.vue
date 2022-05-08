<template>
  <div>
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
          <a-input v-model:value.trim="formState.email" disabled />
        </a-form-item>
        <a-form-item ref="name" label="姓名" name="name">
          <a-input v-model:value.trim="formState.name" />
        </a-form-item>
        <a-form-item ref="password" label="密碼" name="password">
          <a-input-password v-model:value.trim="formState.password" />
        </a-form-item>
        <a-form-item ref="phone" label="電話" name="phone">
          <a-input v-model:value.trim="formState.phone" />
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
import { defineComponent, ref, toRaw, PropType, computed } from "vue";
import apiRequest from "@/common/axios/apiRequest";
import config from "@/common/config/index";

interface IDeviceUser {
  email: string;
  id: string;
  name: string;
  phone: string | null;
  status: boolean;
  password: string | null;
}

export default defineComponent({
  props: {
    editing: Boolean,
    deviceUser: { type: Object as PropType<IDeviceUser>, required: false },
  },
  setup(props, { emit }) {
    const visible = computed({
      get: () => props.editing,
      set: (value) => emit("update:editing", value),
    });
    const formState = computed({
      get: () => props.deviceUser,
      set: (value) => emit("update:deviceUser", value),
    });

    const loading = ref<boolean>(false);

    const showModal = () => {
      visible.value = true;
    };

    const hideModal = () => {
      visible.value = false;
      formRef.value.resetFields();
    };

    const formRef = ref();

    let validatePassword = async (rule: RuleObject, value: string) => {
      if (value) {
        const regxp =
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,}/;
        if (!regxp.test(value)) {
          return Promise.reject("密碼有誤");
        }
        return Promise.resolve();
      }
    };

    const rules = {
      name: [
        {
          required: true,
          message: "請輸入姓名",
          trigger: "blur",
        },
      ],
      password: [
        {
          validator: validatePassword,
          trigger: "blur",
        },
      ],
    };

    const onSubmit = () => {
      formRef.value
        .validate()
        .then(() => {
          updateData();
          console.log("values", formState, toRaw(formState));
        })
        .catch((error: ValidateErrorEntity) => {
          console.log("error", error);
        });
    };

    const updateData = () => {
      loading.value = true;

      const url = `${config.api.register_user}/${formState.value?.id}`;

      apiRequest
        .put(url, {
          ...formState.value,
        })
        .then(() => {
          // formRef.value.resetFields();
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          loading.value = false;
          visible.value = false;
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


