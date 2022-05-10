export default async function enumerateDevices() {
  return await navigator.mediaDevices.enumerateDevices()
}
