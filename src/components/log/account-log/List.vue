<template>
  <a-space direction="vertical">
    <a-space>
      <span>日期 :</span>
      <a-range-picker v-model:value="dateRange" :format="dateFormat" />

      <span>帳號 :</span>
      <a-input v-model:value="account" placeholder="帳號" />

      <span>名稱 :</span>
      <a-input v-model:value="name" placeholder="名稱" />

      <span>行為 :</span>
      <a-select v-model:value="status" style="width: 120px">
        <a-select-option
          v-for="status in statusOptions"
          :key="status.value"
          :value="status.value"
          >{{ status.text }}</a-select-option
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
    dataIndex: "account",
  },
  {
    title: "名稱",
    dataIndex: "name",
  },
  {
    title: "異動者",
    dataIndex: "executionAccount",
  },
  {
    title: "狀態",
    dataIndex: "status",
  },
];

const statusOptions = [
  { value: "", text: "全部" },
  { value: 1, text: "創建帳號" },
  { value: 2, text: "更新" },
  { value: 3, text: "刪除" },
  { value: 4, text: "登入成功" },
  { value: 5, text: "登入失敗" },
  { value: 6, text: "復原" },
  { value: 7, text: "重置密碼" },
  { value: 8, text: "修改密碼" },
  { value: 9, text: "忘記密碼" },
];

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
    const name = ref<string>("");
    const status = ref<string>("");

    const getData = (filter: any) => {
      paramsHandler(filter);

      const params = { ...filter };
      apiRequest
        .get(config.api.modification_record, { params })
        .then((res: any) => {
          res.data.items.forEach((info: any) => {
            info.executionTime = moment(info.executionTime).format(
              "YYYY-MM-DD HH:mm:ss"
            );
          });
          dataSource.value = res.data.items;
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
        Name: name.value,
        UserName: account.value,
        Status: status.value,
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
      name,
      status,                                                                                                                                                                     
      statusOptions,
      getData,
      searchLog,
    };
  },
});
</script>

<style scoped>
.ant-space {
  width: 100%;
}
.ant-space-item {
  width: 100%;
}
</style>