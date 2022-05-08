<template>
  <a-space direction="vertical">
    <a-space>
      <span>日期 :</span>
      <a-range-picker v-model:value="dateRange" :format="dateFormat" />

      <template v-if="category == 'Connection'">
        <span>裝置編號 :</span>
        <a-input
          v-model:value="videoLogFilter.deviceId"
          placeholder="裝置編號"
        />
        <span>類別 :</span>
        <a-input v-model:value="videoLogFilter.category" placeholder="類別" />
      </template>
      <template v-else>
        <span>帳號 :</span>
        <a-input v-model:value="account" placeholder="帳號" />
      </template>

      <template v-if="category == 'Recognition' || category == 'Humanoid'">
        <span>結果 :</span>
        <a-select v-model:value="result" style="width: 120px">
          <a-select-option value="">全部</a-select-option>
          <a-select-option :value="true">辨識成功</a-select-option>
          <a-select-option :value="false">辨識失敗</a-select-option>
        </a-select>
      </template>

      <span>分類 :</span>
      <a-select v-model:value="category" style="width: 120px">
        <a-select-option value="">全部</a-select-option>
        <a-select-option value="AppStart">啟動應用程式</a-select-option>
        <a-select-option value="AppClose">關閉應用程式</a-select-option>
        <a-select-option value="Recognition">人臉辨識</a-select-option>
        <a-select-option value="Humanoid">人形偵測</a-select-option>
        <a-select-option value="Connection">視訊連線</a-select-option>
        <a-select-option value="NetworkStatus">網路狀態</a-select-option>
        <a-select-option value="Exception">例外情形</a-select-option>
      </a-select>
      <a-button type="primary" @click="searchLog">查詢</a-button>
    </a-space>

    <template v-if="category == 'Recognition' || category == 'Humanoid'">
      <a-space>
        <a-button
          type="link"
          :style="{
            fontSize: '22px',
          }"
          @click="downloadLog"
        >
          <template #icon>
            <DownloadOutlined />
          </template>
        </a-button>
      </a-space>
    </template>

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
        <template #result="{ record }">
          <!-- 人臉辨識紀錄 -->
          <template v-if="category === 'Recognition'">
            <a-tooltip v-if="!record.faceId">
              <QuestionCircleFilled
                :style="{ color: '#aaa', fontSize: '18px', cursor: 'default' }"
              />
            </a-tooltip>
            <a-tooltip v-else-if="record.result">
              <CheckCircleFilled
                :style="{
                  color: 'rgb(107, 155, 84)',
                  fontSize: '18px',
                  cursor: 'default',
                }"
              />
            </a-tooltip>
            <a-tooltip v-else>
              <CloseCircleFilled
                :style="{
                  color: '#ff4d4f',
                  fontSize: '18px',
                  cursor: 'default',
                }"
              />
            </a-tooltip>
            <a-tooltip v-if="record.faceId">
              <span style="margin-left: 10px">{{
                record.confidenceInterval
              }}</span>
            </a-tooltip></template
          >
          <!-- 人形辨識紀錄 -->
          <template v-if="category === 'Humanoid'">
            <a-tooltip v-if="record.result">
              <CheckCircleFilled
                :style="{
                  color: 'rgb(107, 155, 84)',
                  fontSize: '18px',
                  cursor: 'default',
                }"
              />
            </a-tooltip>
            <a-tooltip v-else>
              <QuestionCircleFilled
                :style="{ color: '#aaa', fontSize: '18px', cursor: 'default' }"
              />
            </a-tooltip>
          </template>
        </template>

        <template #imageUrl="{ record }">
          <a-image
            :src="record.imageUrl"
            :style="{ maxWidth: '80px', maxHeight: '80px', cursor: 'pointer' }"
          />
        </template>
      </a-table>
    </a-space>
  </a-space>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, h, ComputedRef, computed } from "vue";
import { TableState } from "ant-design-vue/es/table/interface";
import config from "@/common/config/index";
import apiRequest from "@/common/axios/apiRequest";
import moment, { Moment } from "moment";
import { paramsHandler } from "@/common/Utility/index";
import {
  SearchOutlined,
  QuestionCircleFilled,
  CheckCircleFilled,
  CloseCircleFilled,
  RedoOutlined,
  DownloadOutlined,
} from "@ant-design/icons-vue";

interface IIotLog {
  category: number;
  categoryName: string;
  content: string;
  creationTime: string;
  creatorId: string | null;
  deviceId: string;
  deviceName: string;
  email: string;
  id: string;
  name: string;
  tenantId: string | null;
  userName: string;
}

interface IFaceRecognitionLog {
  id: string;
  deviceId: string;
  groupName: null | string;
  faceId: null | string;
  faceName: null | string;
  faceImageUrl: null | string;
  deviceName: string;
  image: string;
  imageUrl: null | string;
  confidenceInterval: number | string;
  result: boolean;
  executionTime: string;
  executionDuration: number;
}

interface IHumanDetectionLog {
  id: string;
  deviceId: string;
  deviceName: string;
  image: string;
  imageUrl: null | string;
  movie: null | string;
  movieUrl: null | string;
  data: string;
  count: number;
  result: boolean;
  executionTime: string;
  executionDuration: number;
}

interface IConnectingLog {
  deviceId: string;
  deviceName: string;
  category: string;
  content: string;
  tenantId: null | string;
  creationTime: string;
  creatorId: string;
  id: string;
}

type Pagination = TableState["pagination"];

const deviceLogColumns = [
  {
    title: "時間",
    dataIndex: "creationTime",
  },
  {
    title: "帳號",
    dataIndex: "userName",
  },
  {
    title: "裝置編號",
    dataIndex: "deviceId",
  },
  {
    title: "分類",
    dataIndex: "categoryName",
  },
  {
    title: "內容說明",
    dataIndex: "content",
  },
];

const recognitionColumns = [
  {
    title: "時間",
    dataIndex: "executionTime",
  },
  {
    title: "執行時間(秒)",
    dataIndex: "executionDuration",
  },
  {
    title: "裝置名稱",
    dataIndex: "deviceName",
  },
  {
    title: "結果",
    dataIndex: "result",
    slots: { customRender: "result" },
  },
];

const faceRecognitionColumns = [
  ...recognitionColumns,
  {
    title: "辨識人臉名稱",
    dataIndex: "faceName",
  },
];

const humaniodRecognitionColumns = [
  ...recognitionColumns,
  {
    title: "辨識照片",
    dataIndex: "imageUrl",
    slots: { customRender: "imageUrl" },
  },
];

const connectionColumns = [
  {
    title: "時間",
    dataIndex: "creationTime",
  },
  {
    title: "裝置名稱",
    dataIndex: "deviceName",
  },
  {
    title: "類別",
    dataIndex: "category",
  },
  {
    title: "內容說明",
    dataIndex: "content",
  },
];

function IotLogDataHandler(data: IIotLog[]) {
  let status;
  data.forEach(function (item) {
    item.deviceId = item.deviceId.slice(0, 7);
    status = JSON.parse(item.content);
    item.content = item.category === 4 ? status.exceptionInfo : status.status;
  });
}

function HumaniodDetectionLogDataHandler(data: IHumanDetectionLog[]) {
  data.forEach(function (item) {
    item.executionTime = TimeFormatHandler(item.executionTime);
    item.executionDuration = item.executionDuration / 1000;
  });
}

function FaceRecognitionLogDataHandler(data: IFaceRecognitionLog[]) {
  data.forEach(function (item) {
    item.executionTime = TimeFormatHandler(item.executionTime);
    item.executionDuration = item.executionDuration / 1000;
    item.confidenceInterval = ToPercent(item.confidenceInterval as number);
  });
}

function DeviceConnectionLogDataHandler(data: IConnectingLog[]) {
  data.forEach(function (item) {
    item.creationTime = TimeFormatHandler(item.creationTime);
  });
}

function TimeFormatHandler(time: string) {
  return moment(time).format("YYYY-MM-DD HH:mm:ss");
}

function ToPercent(num: number): string {
  return parseInt((num * 130).toFixed(2)) >= 99
    ? "99%"
    : (num * 130).toFixed(2) + "%";
}

interface CallbackOneParam<T1, T2 = void> {
  (param1: T1): T2;
}

function ReturnDownloadFile(res: any, fileName: string) {
  const xlsx = "application/vnd.ms-excel";
  const blob = new Blob([res.data], { type: xlsx });
  //轉換資料型別
  const a = document.createElement("a");
  a.download = `${fileName}.xlsx`;
  a.href = window.URL.createObjectURL(blob);
  a.click();
  a.remove();
}

export default defineComponent({
  components: {
    // SearchOutlined,
    QuestionCircleFilled,
    CheckCircleFilled,
    CloseCircleFilled,
    // RedoOutlined,
    DownloadOutlined,
  },
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
    const category = ref<string>("");
    const account = ref<string>("");
    const videoLogFilter = ref({
      deviceId: "",
      category: "",
    });
    const result = ref<boolean | string>("");

    let columns = ref([...deviceLogColumns]);

    const getData = (
      url: string,
      filter: any,
      callback: CallbackOneParam<any>
    ) => {
      paramsHandler(filter);

      const params = { ...filter };
      apiRequest
        .get(url, { params })
        .then((res: any) => {
          callback(res.data.items);
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
        startDate: moment(dateRange.value[0].format("YYYY-MM-DD"))
          .subtract(8, "hours")
          .format("YYYY-MM-DD HH:mm"),
        endDate: moment(dateRange.value[1].format("YYYY-MM-DD"))
          .subtract(8, "hours")
          .format("YYYY-MM-DD HH:mm"),
        category: category.value,
        userName: account.value,
        maxResultCount: pageSize,
        skipCount: (current - 1) * pageSize,
      };

      if (category.value === "Connection") {
        params.category = videoLogFilter.value.category;
      }

      if (category.value === "Recognition") {
        columns.value = [...faceRecognitionColumns];
        getData(
          config.api.recognition_log,
          params,
          FaceRecognitionLogDataHandler
        );
      } else if (category.value === "Humanoid") {
        columns.value = [...humaniodRecognitionColumns];
        getData(
          config.api.detection_log,
          params,
          HumaniodDetectionLogDataHandler
        );
      } else if (category.value === "Connection") {
        columns.value = [...connectionColumns];
        getData(
          config.api.video_record,
          params,
          DeviceConnectionLogDataHandler
        );
      } else {
        columns.value = [...deviceLogColumns];
        getData(config.api.device_log, params, IotLogDataHandler);
      }
    };

    const downloadLog = () => {
      const params = {
        startDate: moment(dateRange.value[0].format("YYYY-MM-DD"))
          .subtract(8, "hours")
          .format("YYYY-MM-DD HH:mm"),
        endDate: moment(dateRange.value[1].format("YYYY-MM-DD"))
          .subtract(8, "hours")
          .format("YYYY-MM-DD HH:mm"),
        name: account.value,
        result: result.value,
      };

      paramsHandler(params);

      let url = "";
      let fileName = "";

      switch (category.value) {
        case "Recognition":
          url = config.api.recognition_log_download;
          fileName = "face_recognition";
          break;
        case "Humanoid":
          url = config.api.detection_log_download;
          fileName = "humanoid_figure_recognition";
          break;
      }

      apiRequest
        .get(url, { params, responseType: "blob" })
        .then((res: any) => {
          console.log(res);

          ReturnDownloadFile(res, fileName);
          loading.value = false;
        })
        .catch((err) => {
          loading.value = false;
          console.log(err);
        });
    };

    return {
      columns,
      dataSource,
      loading,
      pagination,
      dateFormat,
      dateRange,
      category,
      account,
      videoLogFilter,
      result,
      getData,
      searchLog,
      downloadLog,
    };
  },
});
</script>
