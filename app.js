console.log("Loading in!!")
const { WebClient} = require('@slack/client')

//get tokens
const verifyToken = process.env.SLACK_TOKEN
console.log(`Token: ${verifyToken}`)
const clientID = process.env.SLACK_CLIENT_ID
console.log(`Client ID: ${clientID}`)
const clientSecret = process.env.SLACK_CLIENT_SECRET
console.log(`Client Secret: ${clientSecret}`)
let totalMessages = 0
let totalWords = {}

//Helper functions
const findChannel = i => i.name === channelSelection
const filterUsers = selectedChannel => i => {
  return !i.is_bot &&
  i.real_name !== undefined && 
  selectedChannel.members.includes(i.id)
}

//create web client
const web = new WebClient(verifyToken)
console.log("Created new WebClient")
const channelSelection = 'hax'

//Selects channel identified above ^^
const getSelectedChannel = async (web) => {
  const response = await web.channels.list() 
  const selectedChannel = response.channels.find(findChannel)
  return selectedChannel
}

//Creates master user object
const createUserObject = async (web) => {
  //get channels
  const selectedChannel = await getSelectedChannel(web)
  const userList = await web.users.list()
  const filteredUsers = userList.members.filter(filterUsers(selectedChannel))
  const userObject = filteredUsers.reduce((accumulator, currentValue) => {
    accumulator[currentValue.id] = currentValue
    accumulator[currentValue.id].words = {}
    accumulator[currentValue.id].numMessages = 0
    accumulator[currentValue.id].numWords = 0
    accumulator[currentValue.id].uniqueWords = []
    return accumulator
  }, {})
  return userObject
}

//Reads through the messages in a channel,
//adds them to the user object, and returns
//the user object
const readConversation = async (web, u) => {
  const channel = await getSelectedChannel(web)
  const conversationID = channel.id
  const channelConvo = await web.conversations.history({ 
    channel: conversationID,
    limit: 1000
  })
  channelConvo.messages.forEach( message => {
    if (message.type === 'message' && u[message.user] !== undefined) {
      //console.log(u[message.user].real_name + ": " + message.text)
      let words = message.text.split(" ")
      u[message.user].numMessages++
      totalMessages++
      words.forEach( word => {
        word = word.toLowerCase()
        word = word.replace(/[^a-z]/g, '')
        if (u[message.user].words[word] === undefined) {
          u[message.user].words[word] = 1
        } else {
          u[message.user].words[word]++
        }
        if (totalWords[word] === undefined) {
          totalWords[word] = 1
        } else {
          totalWords[word]++
        }
        u[message.user].numWords++
      })
    }
  })
  console.log("Total Words: " + totalWords)
  console.log("Total Messages: " + totalMessages)
  return u
}

const uniqueness = (word, user) => {
  /*
  console.log("Word: " + word)
  console.log("User: " + user.real_name)
  console.log("Total Words: " + totalWords)
  console.log("Total Messages: " + totalMessages)
  */
  return (Math.pow(user.words[word], 2)/totalWords[word])*(totalMessages/user.numMessages)
}

const analyze = (u) => {
  //calculate uniqueness value
  const users = Object.keys(u)
  //loop for each user
  users.forEach( user => {
    const userWords = Object.keys(u[user].words)
    let uniqueValues = []
    //loop for each word
    userWords.forEach( word => {
      const unique = uniqueness(word, u[user], totalWords, totalMessages)
      //console.log("Unique: " + unique)
      //if uniqueWords array isn't full
      if (u[user].uniqueWords.length < 5) {
        //console.log("Setting " + u[user].real_name + "'s unique array")
        u[user].uniqueWords.push(word)
        uniqueValues.push(unique)
      //uniqueWords is full, so replace min in unique words and unique values arrays
      } else if (unique > Math.min(uniqueValues)) {
        //console.log("Updating " + u[user].real_name + "'s unique array")
        u[user].uniqueWords[uniqueValues.findIndex(index => {
          return index === Math.min(uniqueValues)})] = word
        uniqueValues[uniqueValues.findIndex(index => {
          return index === Math.min(uniqueValues)})] = unique
      }
    })
    console.log(u[user].real_name + "'s unique array: " + u[user].uniqueWords)
    console.log(u[user].real_name + "'s unique values: " + uniqueValues)
  })
}

const userMaster = async (web) => {
  try {
    let u = await createUserObject(web)
    u  = await readConversation(web, u)
    await analyze(u)
    console.log("\nUNIQUE WORDS\n")
    Object.keys(u).forEach( user => {
      console.log(u[user].real_name + ": " + u[user].uniqueWords)
    })
    return u
  } catch(e) {
    console.log(e)
  }
}



let u = userMaster(web, totalWords, totalMessages)

/*
 * 1. Get tokens
 * 2. Create Web Client
 * 3. Get selected channel
 * 4. Get all users
 * 5. Filter out users not in channel
 * 6. Combine user objects into shared object so they can be referred to by key
 * 7. Retrieve messages
 * 8. Process messages
 * 9. Display
 *
 */
