// 驗證密碼
export function isPwd(pwd: string): boolean {
  const pwdChecking =
    pwd.split('').length >= 8 && //至少8字元
      /\W+/.test(pwd) && //含符號
      /\d+/.test(pwd) && //含數字
      /[a-z]/.test(pwd) && //含小寫英文
      /[A-Z]/.test(pwd) //含大寫英文
      ? true
      : false
  return pwdChecking
}
// 驗證信箱
export function isEmail(email: string): boolean {
  const emailRegxp = /[\w-]+@([\w-]+\.)+[\w-]+/
  return emailRegxp.test(email)
}

// 產生隨機密碼
export function randomPassword(): string {
  const length = 10
  const passwordArray = [
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    'abcdefghijklmnopqrstuvwxyz',
    '1234567890',
    '!@#$%&*()',
  ]
  const password = []
  let n = 0
  for (let i = 0; i < length; i++) {
    // If password length less than 9, all value random
    if (password.length < length - 4) {
      // Get random passwordArray index
      const arrayRandom = Math.floor(Math.random() * 4)
      // Get password array value
      const passwordItem = passwordArray[arrayRandom]
      // Get password array value random index
      // Get random real value
      const item = passwordItem[Math.floor(Math.random() * passwordItem.length)]
      password.push(item)
    } else {
      // If password large then 9, lastest 4 password will push in according to the random password index
      // Get the array values sequentially
      const newItem = passwordArray[n]
      const lastItem = newItem[Math.floor(Math.random() * newItem.length)]
      // Get array splice index
      const spliceIndex = Math.floor(Math.random() * password.length)
      password.splice(spliceIndex, 0, lastItem)
      n++
    }
  }
  return password.join('')
}

// 複製內容
export function copyText(text: string) {
  return navigator.clipboard.writeText(text)
}

// 重置表格
interface Ref<T> {
  value: T
}

export function resetTableData(dataSource: any, loading: Ref<boolean>) {
  dataSource.length = 0
  loading.value = true
}

// 剔除空字串參數(篩選條件)
export function paramsHandler(filterCondition: any) {
  Object.keys(filterCondition).forEach(
    (key) => filterCondition[key] === '' && delete filterCondition[key],
  )
}
