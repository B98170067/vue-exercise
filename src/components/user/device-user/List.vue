<template>
  <a-space direction="vertical">
    <a-space>
      <span>信箱 :</span>
      <a-input v-model:value="email" placeholder="Email" />
      <span>帳號狀態 :</span>
      <a-select v-model:value="status" style="width: 120px">
        <a-select-option value="">All</a-select-option>
        <a-select-option value="true">Enable</a-select-option>
        <a-select-option value="false">Disable</a-select-option>
      </a-select>
      <a-button type="primary" @click="searchDeviceUser">查詢</a-button>
    </a-space>
    <a-space direction="vertical" align="end">
      <Create @hideModal="searchDeviceUser" />
      <Edit v-model:editing="editing" v-model:deviceUser="deviceUser" />

      <a-table
        :columns="columns"
        :data-source="dataSource"
        :row-key="(record) => record.id"
        :pagination="pagination"
        :loading="loading"
        @change="handleTableChange"
        bordered
      >
        <template #status="{ text }">
          {{ text }}
        </template>
        <template #creationTime="{ text }">
          {{ text }}
        </template>
        <template #edit="{ record }">
          <a @click="onEdit(record)">
            <EditFilled />
          </a>
        </template>
      </a-table>
    </a-space>
  </a-space>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, h } from "vue";
import apiRequest from "@/common/axios/apiRequest";
import moment from "moment";
import { TableState } from "ant-design-vue/es/table/interface";
import Create from "@/components/user/device-user/Create.vue";
import Edit from "@/components/user/device-user/Edit.vue";
import { EditFilled } from "@ant-design/icons-vue";
import config from "@/common/config/index";

interface IDeviceUser {
  email: string;
  id: string;
  name: string;
  phone: string | null;
  roleName: string;
  status: boolean | string;
  userName: string;
  creationTime: string;
}

export default defineComponent({
  components: {
    Create,
    Edit,
    EditFilled,
  },
  setup() {
    const columns = [
      {
        title: "Email",
        dataIndex: "email",
      },
      {
        title: "Name",
        dataIndex: "name",
      },
      {
        title: "Phone",
        dataIndex: "phone",
      },
      {
        title: "User Status",
        dataIndex: "status",
        customRender: ({ text }: any) => {
          if (text) {
            return h("span", { class: "enable" }, "Enable");
          } else {
            return h("span", { class: "disable" }, "Disable");
          }
        },
      },
      {
        title: "Creating Date",
        dataIndex: "creationTime",
        customRender: ({ text }: any) => {
          if (text) {
            return moment(String(text)).format("YYYY-MM-DD");
          } else {
            return "";
          }
        },
      },
      {
        title: "Edit",
        dataIndex: "edit",
        slots: { customRender: "edit" },
      },
    ];

    const pagination = ref({
      total: 0,
      pageSize: 10,
      showSizeChanger: true,
      pageSizeOptions: ["5", "10", "20"],
    });

    const dataSource = ref<IDeviceUser[]>([]);
    const loading = ref<boolean>(true);
    const email = ref<string>("");
    const status = ref<string>("");

    const getData = (filter: any) => {
      const params = { ...filter };

      apiRequest
        .get(config.api.register_user, {
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

    const searchDeviceUser = () => {
      dataSource.value = [];
      loading.value = true;

      const emailValue = email.value;
      const statusValue = status.value;

      const params = {
        email: emailValue,
        status: statusValue,
      };
      getData(params);
    };

    type Pagination = TableState["pagination"];

    const handleTableChange = (pag: Pagination) => {
      dataSource.value = [];
      loading.value = true;

      const emailValue = email.value;
      const statusValue = status.value;
      const pageSize = pag?.pageSize ?? 10;
      const current = pag?.current ?? 0;

      const params = {
        email: emailValue,
        status: statusValue,
        maxResultCount: pageSize,
        skipCount: (current - 1) * pageSize,
      };
      getData(params);
    };

    const editing = ref<boolean>();
    const deviceUser = ref<IDeviceUser>();
    const onEdit = (record: IDeviceUser) => {
      deviceUser.value = record;
      editing.value = true;
    };

    onMounted(() => {
      getData({});
    });

    return {
      columns,
      dataSource,
      pagination,
      loading,
      email,
      status,
      editing,
      deviceUser,
      getData,
      handleTableChange,
      searchDeviceUser,
      onEdit,
    };
  },
});
</script>

<style>
th.column-money,
td.column-money {
  text-align: right !important;
}
.enable {
  color: #52c41a;
}
.disable {
  color: #ff4d4f;
}
</style>
