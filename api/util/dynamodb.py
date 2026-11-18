"""Read event attendance from the core API's DynamoDB tables.

These tables are owned by the core repo (acm-uiuc/core); resume book only reads them.
If core renames a table, the index, or changes the RSVP key format, update this file.
Reference: core/src/api/routes/rsvp.ts and core/terraform/modules/dynamo/main.tf
"""

import boto3
from boto3.dynamodb.conditions import Key

# Core's tables live in us-east-2, while resume book runs in us-east-1.
dynamodb = boto3.resource("dynamodb", region_name="us-east-2")

RSVP_TABLE = "infra-core-api-events-rsvp"

rsvp_table = dynamodb.Table(RSVP_TABLE)


def get_user_rsvps(username):
    #Return every row in the RSVP table for this user.
    response = rsvp_table.query(
        IndexName="UserIdIndex",
        KeyConditionExpression=Key("userId").eq(username),
    )
    items = response["Items"]
    # continue querying if the query stopped early (1MB page limit)
    while "LastEvaluatedKey" in response:
        response = rsvp_table.query(
            IndexName="UserIdIndex",
            KeyConditionExpression=Key("userId").eq(username),
            ExclusiveStartKey=response["LastEvaluatedKey"],
        )
        items.extend(response["Items"])

    return items


def get_attended_event_ids(items):
    """Keep checked-in RSVP rows and return their unique event IDs, in order."""
    event_ids = [];
    for i in items:
        sliced = i.get("partitionKey", "").split("#", 2)
        if len(sliced) == 3 and sliced[0] == "RSVP" and i.get("checkedIn"):
            if sliced[1] not in event_ids:
                event_ids.append(sliced[1])

    return event_ids

#rsvps for a one user 
def get_attended_events(username):
    """Event IDs the user checked in to. Event names will come from the RSVP row once core adds that field."""
    return get_attended_event_ids(get_user_rsvps(username))
