import { App } from 'vue'
import { Button, TimePicker, Layout, Menu, Breadcrumb, Form, Input, Table, Select, Modal, Space, Switch, Radio, Upload, Popconfirm, DatePicker, Image } from "ant-design-vue";

const components = [Button, TimePicker, Layout, Menu, Breadcrumb, Form, Input, Table, Select, Modal, Space, Switch, Radio, Upload, Popconfirm, DatePicker, Image]

export default function setupAtnd(app: App): void {
    components.forEach((component) => {
        app.use(component)
    })
}