import Avatar from 'boring-avatars'

export default function RandAvatar({ name }: any) {
  return (
    <Avatar
      size={40}
      name={name}
      variant="beam"
      colors={['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']}
    />
  )
}
