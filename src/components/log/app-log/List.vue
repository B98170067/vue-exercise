<template>
  <a-space direction="vertical">
    <a-space>
      <span>日期 :</span>
      <a-range-picker v-model:value="dateRange" :format="dateFormat" />

      <span>帳號 :</span>
      <a-input v-model:value="account" placeholder="帳號" />

      <span>行為 :</span>
      <a-select v-model:value="action" style="width: 120px">
        <a-select-option value="login-with-captcha">登入</a-select-option>
        <a-select-option value="send-password-reset-code"
          >忘記密碼</a-select-option
        >
      </a-select>
      <a-button type="primary" @click="searchLog">查詢</a-button>
    </a-space>
    <a-space direction="vertical" align="end">
      <a-table
        :columns="columns"
        :data-source="dataSource"
        :row-key="(record) => record.id"
        :pagination="pagination"
        :loading="loading"
        @change="searchLog"
        bordered
      >
      </a-table>
    </a-space>
  </a-space>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { TableState } from "ant-design-vue/es/table/interface";
import config from "@/common/config/index";
import apiRequest from "@/common/axios/apiRequest";
import moment, { Moment } from "moment";
import { paramsHandler } from "@/common/Utility/index";

type Pagination = TableState["pagination"];

const columns = [
  {
    title: "時間",
    dataIndex: "executionTime",
  },
  {
    title: "帳號",
    dataIndex: "userName",
  },
  {
    title: "行為",
    dataIndex: "action",
  },
  {
    title: "執行時間(秒)",
    dataIndex: "executionDuration",
  },
  {
    title: "網路狀態代碼",
    dataIndex: "httpStatusCode",
  },
];

//搜尋log
interface IAppLog {
  actions: any[];
  applicationName: string;
  browserInfo: string;
  clientId: null | string;
  clientIpAddress: string;
  clientName: null | string;
  comments: string;
  concurrencyStamp: string;
  correlationId: string;
  email: null | string;
  exceptions: string;
  executionDuration: number;
  executionTime: string;
  extraProperties: null | string;
  httpMethod: string;
  httpStatusCode: number;
  id: string;
  impersonatorTenantId: null | string;
  impersonatorUserId: null | string;
  name: null | string;
  tenantId: null | string;
  tenantName: null | string;
  url: string;
  userId: null | string;
  userName: null | string;
}

function AppLogDataHandler(data: IAppLog[]) {
  return data.map(function (item) {
    let action;
    if (/login-with-captcha/.test(item.url)) {
      action = "Login";
    } else if (/send-password-reset-code/.test(item.url)) {
      action = "Forgot Password";
    }

    return {
      id: item.id,
      executionTime: moment(item.executionTime).format("YYYY-MM-DD HH:mm:ss"),
      userName: item.userName,
      action,
      executionDuration: (item.executionDuration / 1000).toFixed(2),
      httpStatusCode: item.httpStatusCode,
    };
  });
}

export default defineComponent({
  setup() {
    const dataSource = ref<any[]>([]);
    const loading = ref<boolean>(false);
    const pagination = ref({
      total: 0,
      pageSize: 10,
      showSizeChanger: true,
      pageSizeOptions: ["5", "10", "20"],
    });
    const dateFormat = "YYYY/MM/DD";
    const dateRange = ref<Moment[]>([moment(), moment()]);
    const action = ref<string>("login-with-captcha");
    const account = ref<string>("");

    const getData = (filter: any) => {
      paramsHandler(filter);

      const params = { ...filter };
      apiRequest
        .get(config.api.audit_log, { params })
        .then((res: any) => {
          dataSource.value = AppLogDataHandler(res.data.items);
          pagination.value.total = res.data.totalCount;
          loading.value = false;
        })
        .catch((err) => {
          loading.value = false;
          console.log(err);
        });
    };

    const searchLog = (pag?: Pagination) => {
      dataSource.value = [];
      loading.value = true;

      const pageSize = pag?.pageSize ?? 10;
      const current = pag?.current ?? 1;
      const params = {
        startDate: dateRange.value[0].format(dateFormat),
        endDate: dateRange.value[1].format(dateFormat),
        ClientType: "app",
        userName: account.value,
        Url: action.value,
        maxResultCount: pageSize,
        skipCount: (current - 1) * pageSize,
      };

      getData(params);
    };

    return {
      columns,
      dataSource,
      loading,
      pagination,
      dateFormat,
      dateRange,
      account,
      action,
      getData,
      searchLog,
    };
  },
});
</script>