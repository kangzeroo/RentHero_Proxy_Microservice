const AWS = require('aws-sdk')
const path = require('path')
const pathToAWSConfig = path.join(__dirname, '../../../', 'credentials', process.env.NODE_ENV, 'aws_config.json')
const aws_config = require(pathToAWSConfig)
AWS.config.update(aws_config)
const CONVO_HISTORY = require('../dynamodb_tablenames').CONVO_HISTORY


const convoHistoryTableParams = {
    TableName : CONVO_HISTORY,
    KeySchema: [
        // USE CASE: ALLOWS ME TO SEE ALL USER PREFERENCES INTEL IN CHRONOLOGICAL ORDER. EG: USER LOOKS FOR ENSUITE FIRST BEFORE CHANGING THEIR FILTERS TO LOOK FOR LESS ROOMATES NO ENSUITE
        { AttributeName: "SES_MESSAGE_ID", KeyType: "HASH" },  //Partition key
        { AttributeName: "TIMESTAMP", KeyType: "RANGE" },  //Sort key
    ],
    AttributeDefinitions: [
        { AttributeName: "SES_MESSAGE_ID", AttributeType: "S" },
        { AttributeName: "TIMESTAMP", AttributeType: "S" },
        { AttributeName: "SENDER_ID", AttributeType: "S" },
        { AttributeName: "RECEIVER_ID", AttributeType: "S" },
        { AttributeName: "SENDER_CONTACT", AttributeType: "S" },
        { AttributeName: "RECEIVER_CONTACT", AttributeType: "S" },
        { AttributeName: "PROXY_ID", AttributeType: "S" },
        // { AttributeName: "ROLE", AttributeType: "S" },
        // { AttributeName: "TIMESTAMP", AttributeType: "S" },
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
    },
    GlobalSecondaryIndexes: [
      {
        // USE CASE: ALLOWS ME TO SEE ALL INTEL OF A SPECIFIC ACTION, GROUPED BY USERS. EG: SHOW ME ALL PRICE ADJUSTMENTS, AND NOW I CAN GROUP USER POPULATIONS INTO PRICE RANGES.
        IndexName: 'BY_SENDER_ID', /* required */
        KeySchema: [ /* required */
          {AttributeName: 'SENDER_ID', KeyType: 'HASH'},
          {AttributeName: 'SES_MESSAGE_ID', KeyType: 'RANGE'}
        ],
        Projection: { /* required */
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: { /* required */
          ReadCapacityUnits: 5, /* required */
          WriteCapacityUnits: 5 /* required */
        }
      },
      {
        // USE CASE: ALLOWS ME TO SEE ALL INTEL OF A SPECIFIC ACTION, GROUPED BY USERS. EG: SHOW ME ALL PRICE ADJUSTMENTS, AND NOW I CAN GROUP USER POPULATIONS INTO PRICE RANGES.
        IndexName: 'BY_RECEIVER_ID', /* required */
        KeySchema: [ /* required */
          {AttributeName: 'RECEIVER_ID', KeyType: 'HASH'},
          {AttributeName: 'SES_MESSAGE_ID', KeyType: 'RANGE'}
        ],
        Projection: { /* required */
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: { /* required */
          ReadCapacityUnits: 5, /* required */
          WriteCapacityUnits: 5 /* required */
        }
      },
      {
        // USE CASE: ALLOWS ME TO SEE ALL INTEL OF A SPECIFIC ACTION, GROUPED BY USERS. EG: SHOW ME ALL PRICE ADJUSTMENTS, AND NOW I CAN GROUP USER POPULATIONS INTO PRICE RANGES.
        IndexName: 'BY_SENDER_CONTACT', /* required */
        KeySchema: [ /* required */
          {AttributeName: 'SENDER_CONTACT', KeyType: 'HASH'},
          {AttributeName: 'SES_MESSAGE_ID', KeyType: 'RANGE'}
        ],
        Projection: { /* required */
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: { /* required */
          ReadCapacityUnits: 5, /* required */
          WriteCapacityUnits: 5 /* required */
        }
      },
      {
        // USE CASE: ALLOWS ME TO SEE ALL INTEL OF A SPECIFIC ACTION, GROUPED BY USERS. EG: SHOW ME ALL PRICE ADJUSTMENTS, AND NOW I CAN GROUP USER POPULATIONS INTO PRICE RANGES.
        IndexName: 'BY_RECEIVER_CONTACT', /* required */
        KeySchema: [ /* required */
          {AttributeName: 'RECEIVER_CONTACT', KeyType: 'HASH'},
          {AttributeName: 'SES_MESSAGE_ID', KeyType: 'RANGE'}
        ],
        Projection: { /* required */
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: { /* required */
          ReadCapacityUnits: 5, /* required */
          WriteCapacityUnits: 5 /* required */
        }
      },
      {
        // USE CASE: ALLOWS ME TO SEE ALL INTEL OF A SPECIFIC ACTION, GROUPED BY USERS. EG: SHOW ME ALL PRICE ADJUSTMENTS, AND NOW I CAN GROUP USER POPULATIONS INTO PRICE RANGES.
        IndexName: 'BY_PROXY_ID', /* required */
        KeySchema: [ /* required */
          {AttributeName: 'PROXY_ID', KeyType: 'HASH'},
          {AttributeName: 'SES_MESSAGE_ID', KeyType: 'RANGE'}
        ],
        Projection: { /* required */
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: { /* required */
          ReadCapacityUnits: 5, /* required */
          WriteCapacityUnits: 5 /* required */
        }
      }
    ]
}

exports.createTables = function(){

  console.log("==> About to create DynamoDB tables!")

  const dynamodb = new AWS.DynamoDB({
    dynamodb: '2012-08-10',
    region: "us-east-1"
  })

  dynamodb.createTable(convoHistoryTableParams, function(err, data) {
      if (err)
          console.log(JSON.stringify(err, null, 2));
      else
          console.log(JSON.stringify(data, null, 2));
  })
}
