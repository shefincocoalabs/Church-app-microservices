var commonStorePath = 'http://172.105.33.226/church-app-images/'
module.exports = {
  gateway: {
    url: "http://localhost:3000"
  },
  otp: {
    expirySeconds: 2 * 60
  },
  users: {
    imageBase: commonStorePath + 'users/',
    // imageUploadPath: 'uploads',
    imageUploadPath: '/var/www/html/church-app-images/users/',
    resultsPerPage: 30
  },
  pasters: {
    imageBase: commonStorePath + 'pasters/',
    resultsPerPage: 30
  },
  groups: {
    imageBase: commonStorePath + 'groups/',
    // imageUploadPath: 'uploads',
    imageUploadPath: '/var/www/html/church-app-images/groups/',
    resultsPerPage: 30
  },
  feeds: {
    resultsPerPage: 30,
    imageBase: commonStorePath + 'feeds/',
    // imageUploadPath: 'uploads',
    imageUploadPath: '/var/www/html/church-app-images/feeds/'
  },
  events: {
    resultsPerPage: 30,
    imageBase: commonStorePath + 'events/',
    imageUploadPath: '/var/www/html/church-app-images/events/'
  },
  buyorsell: {
    resultsPerPage: 30,
    imageBase: commonStorePath + 'buyorsell/',
    // imageUploadPath: 'uploads'
    imageUploadPath: '/var/www/html/church-app-images/buyorsell/'
  },
  charity: {
    resultsPerPage: 30,
    imageBase: commonStorePath + 'charity/',
    // imageUploadPath: 'uploads'
    imageUploadPath: '/var/www/html/church-app-images/charity/'
  },
  matrimony: {
    resultsPerPage: 30,
    imageBase: commonStorePath + 'matrimony/',
    // imageUploadPath: 'uploads',
    imageUploadPath: '/var/www/html/church-app-images/matrimony/'
  },
  urogulf: {
    resultsPerPage: 30
  },
  sermons: {
    resultsPerPage: 30,
    imageBase: commonStorePath + 'sermons/'
  },
  bloodDonation: {
    resultsPerPage: 30
  },
  livePrayers: {
    resultsPerPage: 30
  }


}