import nhost from '../libs/nhost'

export default async function getRoomData(id: string) {
  const query = `
    query MyQuery {
      rooms(where: {id: {_eq: "${id}"}}) {
        addedDate
        creatorId
        id
      }
    }`

  const { data, error } = await nhost.graphql.request(query)

  if (error) {
    throw error
  }

  return data.rooms[0]
}
