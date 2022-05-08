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
      <a-upload
        v-model:file-list="fileList"
        name="avatar"
        list-type="picture-card"
        class="avatar-uploader"
        :show-upload-list="false"
        :custom-request="customRequest"
        :before-upload="beforeUpload"
        @change="handleChange"
      >
        <img
          v-if="formState.profileUrl"
          :src="formState.profileUrl"
          alt="avatar"
        />
        <div v-else>
          <loading-outlined v-if="loading"></loading-outlined>
          <plus-outlined v-else></plus-outlined>
          <div class="ant-upload-text">Upload</div>
        </div>
      </a-upload>

      <a-form
        ref="formRef"
        :model="formState"
        :rules="rules"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-form-item ref="userName" label="帳號" name="userName">
          <a-input v-model:value="formState.userName" disabled />
        </a-form-item>
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
        <a-form-item ref="roleName" label="帳號權限" name="roleName">
          <a-radio-group name="roleName" v-model:value="formState.roleName">
            <a-radio value="manager">系統管理員</a-radio>
            <a-radio value="admin">超級管理員</a-radio>
          </a-radio-group>
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
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";

interface IDeviceUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  roleName: string;
  profileKey: string | null;
  profileUrl: string | null;
  status: boolean | string;
  userName: string;
  creationTime: string;

  password: string | null;
}

interface FileItem {
  uid: string;
  name?: string;
  status?: string;
  response?: string;
  url?: string;
  type?: string;
  size: number;
  originFileObj: any;
}

interface FileInfo {
  file: FileItem;
  fileList: FileItem[];
}

function getBase64(img: Blob, callback: (base64Url: string) => void) {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result as string));
  reader.readAsDataURL(img);
}

export default defineComponent({
  components: {
    LoadingOutlined,
    PlusOutlined,
  },
  props: {
    editing: Boolean,
    deviceUser: { type: Object as PropType<IDeviceUser>, required: true },
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
      // emit("hideModal");
    };

    const formRef = ref();

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
          required: false,
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

      const url = `${config.api.register_manager}/${formState.value.id}`;
      const data = {
        Password: formState.value.password,
        Name: formState.value.name,
        Email: formState.value.email,
        Phone: formState.value.phone,
        Status: formState.value.status,
        RoleName: formState.value.roleName,
        ProfileKey: formState.value.profileKey,
      };

      apiRequest
        .put(url, data)
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

    const fileList = ref([]);
    const imageUrl = ref<string>("");

    const handleChange = (info: FileInfo) => {
      if (info.file.status === "uploading") {
        loading.value = true;
        return;
      }
      if (info.file.status === "done") {
        // Get this url from response in real world.
        // getBase64(info.file.originFileObj, (base64Url: string) => {
        //   imageUrl.value = base64Url;
        //   loading.value = false;
        // });
        console.log("done");
      }
      if (info.file.status === "error") {
        loading.value = false;
        message.error("upload error");
      }
    };

    const beforeUpload = (file: FileItem) => {
      const isJpgOrPng =
        file.type === "image/jpeg" || file.type === "image/png";
      if (!isJpgOrPng) {
        message.error("You can only upload JPG file!");
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error("Image must smaller than 2MB!");
      }
      return isJpgOrPng && isLt2M;
    };

    const customRequest = (data: any) => {
      const formData = new FormData();
      formData.append("Files", data.file);

      apiRequest
        .post(config.api.file_upload, formData)
        .then((res: any) => {
          formState.value.profileKey = res.data[0].fileKey;

          // Get this url from response in real world.
          getBase64(data.file, (base64Url: string) => {
            imageUrl.value = base64Url;
            formState.value.profileUrl = base64Url;
            loading.value = false;
          });
        })
        .catch((err) => {
          console.log(err);
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
      //
      fileList,
      // loading,
      imageUrl,
      handleChange,
      beforeUpload,
      customRequest,
    };
  },
});
</script>

<style>
.avatar-uploader > .ant-upload {
  width: 128px;
  height: 128px;
}

.ant-upload-select-picture-card i {
  font-size: 32px;
  color: #999;
}

.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: #666;
}
</style>


