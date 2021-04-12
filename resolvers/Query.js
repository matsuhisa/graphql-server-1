module.exports = {
  // 写真をの数を返す
  totalPhotos: (parent, args, { db }) =>
    db.collection(`photos`).estimatedDocumentCount(),

  // すべての写真を返す
  allPhotos: (parent, args, { db }) => 
    db.collection(`photos`)
    .find().toArray(),
  
  totalUsers: (parent, args, { db }) => 
    db.collection(`users`).estimatedDocumentCount(),
  
  allUsers: (parent, args, { db }) => 
    db.collection(`users`)
    .find().toArray(),

  me: (parent, args, { currentUser }) => currentUser,
}