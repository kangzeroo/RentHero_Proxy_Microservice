const query_dynamodb = require('./general_queryable').query_dynamodb
const CONVO_HISTORY = require('./dynamodb_tablenames').CONVO_HISTORY

exports.grab_convo_history_by_proxy_id = (proxy_id) => {
  const p = new Promise((res, rej) => {
    const params =  {
        "TableName": CONVO_HISTORY,
        "KeyConditionExpression": "#PROXY_ID = :proxy_id",
        "IndexName": "BY_PROXY_ID",
        "ExpressionAttributeNames": {
          "#PROXY_ID": "PROXY_ID"
        },
        "ExpressionAttributeValues": {
          ":proxy_id": proxy_id
        }
      }

    query_dynamodb(params)
      .then((data) => {
        // console.log(data)
        res(data)
      })
      .catch((err) => {
        rej(err)
      })
  })
  return p
}
