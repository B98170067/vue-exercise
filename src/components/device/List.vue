<template>
  <a-space direction="vertical">
    <a-space>
      <span>編號 :</span>
      <a-input v-model:value="code" placeholder="Code" />
      <a-button type="primary" @click="searchDevice">查詢</a-button>
    </a-space>
    <a-space direction="vertical" align="end">
      <Create @hideModal="searchDevice" />
      <Edit v-model:editing="editing" v-model:device="device" />

      <a-table
        :columns="columns"
        :data-source="dataSource"
        :row-key="(record) => record.id"
        :pagination="pagination"
        :loading="loading"
        @change="handleTableChange"
        bordered
      >
        <template #imageUrl="{ text }">
          <img :src="text" :style="{ maxWidth: '80px', maxHeight: '80px' }" />
        </template>
        <template #edit="{ record }">
          <a @click="onEdit(record)">
            <EditFilled />
          </a>
          <a-popconfirm
            title="確定刪除此裝置嗎？"
            okText="是"
            cancelText="否"
            @confirm="deleteDevice(record)"
          >
            <template #icon
              ><question-circle-outlined style="color: red"
            /></template>
            <a href="#">
              <DeleteFilled />
            </a>
          </a-popconfirm>
        </template>
      </a-table>
    </a-space>
  </a-space>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, h } from "vue";
import apiRequest from "@/common/axios/apiRequest";
import { TableState } from "ant-design-vue/es/table/interface";
import config from "@/common/config/index";
import {
  EditFilled,
  DeleteFilled,
  QuestionCircleOutlined,
} from "@ant-design/icons-vue";
import Create from "@/components/device/Create.vue";
import Edit from "@/components/device/Edit.vue";

interface IDevice {
  categoryId: string | null;
  code: string;
  name: string;
  specification: string | null;
  os: string | null;
  image: string | null;
  imageUrl: string | null;
  id: string;
}

type Pagination = TableState["pagination"];

const columns = [
  {
    title: "編號",
    dataIndex: "code",
  },
  {
    title: "名稱",
    dataIndex: "name",
  },
  {
    title: "操作系統",
    dataIndex: "os",
  },
  {
    title: "硬體規格",
    dataIndex: "specification",
  },
  {
    title: "照片",
    dataIndex: "imageUrl",
    slots: { customRender: "imageUrl" },
  },
  {
    title: "編輯",
    dataIndex: "edit",
    slots: { customRender: "edit" },
  },
];

export default defineComponent({
  components: {
    Create,
    Edit,
    EditFilled,
    DeleteFilled,
    QuestionCircleOutlined,
  },
  setup() {
    const dataSource = ref<IDevice[]>([]);

    const loading = ref<boolean>(true);

    const code = ref<string>("");

    const pagination = ref({
      total: 0,
      pageSize: 10,
      showSizeChanger: true,
      pageSizeOptions: ["5", "10", "20"],
    });

    const getData = (filter: any) => {
      const params = { ...filter };

      apiRequest
        .get(config.api.device_category, {
          params,
        })
        .then((res: any) => {
          dataSource.value = res.data.items;
          pagination.value.total = res.data.totalCount;
          loading.value = false;
        })
        .catch((err) => {
          loading.value = false;
          console.log(err);
        });
    };

    const handleTableChange = (pag: Pagination) => {
      dataSource.value = [];
      loading.value = true;

      const pageSize = pag?.pageSize ?? 10;
      const current = pag?.current ?? 0;

      const params = {
        code: code.value,
        maxResultCount: pageSize,
        skipCount: (current - 1) * pageSize,
      };
      getData(params);
    };

    const searchDevice = () => {
      dataSource.value = [];
      loading.value = true;

      const params = {
        code: code.value,
      };
      getData(params);
    };

    const editing = ref<boolean>();
    const device = ref<IDevice>();
    const onEdit = (record: IDevice) => {
      device.value = record;
      editing.value = true;
    };

    const deleteDevice = (record: IDevice) => {
      const url = `/api/device/device-category/${record.id}`;
      apiRequest.delete(url).then((res: any) => {
        if (res.status == 204) {
          dataSource.value.splice(dataSource.value.indexOf(record), 1);
        }
      });
    };

    onMounted(() => {
      getData({});
    });

    return {
      columns,
      dataSource,
      pagination,
      loading,
      code,
      editing,
      device,
      handleTableChange,
      searchDevice,
      onEdit,
      deleteDevice,
    };
  },
});
</script>