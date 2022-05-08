<template>
  <div>
    <a-button type="ghost" @click="showModal">新增裝置種類</a-button>

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
        <img v-if="imageUrl" :src="imageUrl" alt="avatar" />
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
        <a-form-item ref="code" label="編號" name="code">
          <a-input v-model:value="formState.code" />
        </a-form-item>
        <a-form-item ref="name" label="名稱" name="name">
          <a-input v-model:value="formState.name" />
        </a-form-item>
        <a-form-item ref="os" label="操作系統" name="os">
          <a-input v-model:value="formState.os" />
        </a-form-item>
        <a-form-item ref="specification" label="硬體規格" name="specification">
          <a-textarea v-model:value="formState.specification" />
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
import { message } from "ant-design-vue";

interface FormState {
  code: string;
  name: string;
  os: string | null;
  specification: string | null;
  image: string | null;
}

const rules = {
  code: [
    {
      required: true,
      message: "請輸入編號",
      trigger: "blur",
    },
  ],
  name: [
    {
      required: true,
      message: "請輸入名稱",
      trigger: "blur",
    },
  ],
};

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
  setup(props, { emit }) {
    const visible = ref<boolean>(false);
    const loading = ref<boolean>(false);
    const formRef = ref();
    const formState = ref<FormState>({
      code: "",
      name: "",
      os: "",
      specification: "",
      image: "",
    });

    const showModal = () => {
      visible.value = true;
    };

    const hideModal = () => {
      visible.value = false;
      formRef.value.resetFields();
      emit("hideModal");
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
        .post(config.api.device_category, {
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

    const fileList = ref([]);
    const imageUrl = ref<string>("");

    const handleChange = (info: FileInfo) => {
      if (info.file.status === "uploading") {
        loading.value = true;
        return;
      }
      if (info.file.status === "done") {
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
          formState.value.image = res.data[0].fileKey;

          // Get this url from response in real world.
          getBase64(data.file, (base64Url: string) => {
            imageUrl.value = base64Url;
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
      formState,
      formRef,
      rules,
      labelCol: { span: 6 },
      wrapperCol: { span: 17, offset: 1 },
      fileList,
      imageUrl,
      showModal,
      hideModal,
      onSubmit,
      handleChange,
      beforeUpload,
      customRequest,
    };
  },
});
</script>