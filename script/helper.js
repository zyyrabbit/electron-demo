const yargs = require('yargs')
const fs = require('fs-extra')
const crypto = require('crypto')

async function createHash (file, algorithm, type = 'base64') {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash(algorithm)
    const stream = fs.createReadStream(file)
  
    stream.on('readable', () => {
      const data = stream.read()
      if (data) {
        hash.update(data)
      } else {
        resolve(hash.digest(type))
      }
    })
    stream.on('error', (e) => {
      reject(e)
    }) 
  })
}

const { file, type = 'sha512' } = yargs.argv
if (file && type) {
  createHash(file, type)
    .then((res) => {
      console.log(res)
    })
    .catch(e => { throw e })
}

module.exports = {
  createHash
}

