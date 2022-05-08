export default {
    dev: {
        baseUrl: {
            api: "https://localhost:44350",
            ids: "https://localhost:44360",
        }
    },
    prod: {
        baseUrl: {
            api: "",
            ids: "",
        }
    },
    api: {
        register_user: "/api/account/register-user",
        register_manager: "/api/account/register-manager",
        login_with_captcha: "/api/Account/login-with-captcha",
        file_upload: "/api/aws/file-upload",
        device_category: "api/device/device-category",
        recognition_log: '/api/face-recognition/log',
        recognition_log_download: '/api/face-recognition/download',
        detection_log: '/api/human-detection/log',
        detection_log_download: '/api/human-detection/download',
        device_log: '/api/device/device-log',
        audit_log: 'api/system/audit-log',
        video_record: 'api/device/video-record',
        modification_record: 'api/account/modification-record'
    }
}