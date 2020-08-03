var commonStorePath = 'http://172.104.61.150/I-task/'
module.exports = {
  gateway: {
    url: "http://localhost:5000"
  },
  otp: {
    expirySeconds: 2 * 60
  },
  users: {
    imageBase: commonStorePath + 'images/profile-images/'
  },
  pasters: {
    resultsPerPage: 30
  },
  groups: {
    imageUploadPath: 'uploads'
  },
  feeds: {
    imageUploadPath: 'uploads'
  },


}