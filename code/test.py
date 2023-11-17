import requests
import json

access_token = "eyJ0eXAiOiJKV1QiLCJub25jZSI6IkxWekxTWnI3eFd1ZEFaTEZLVDZrT2JZdXRTN2dOTkQ4WkNOUHZBWDBaVGMiLCJhbGciOiJSUzI1NiIsIng1dCI6IjlHbW55RlBraGMzaE91UjIybXZTdmduTG83WSIsImtpZCI6IjlHbW55RlBraGMzaE91UjIybXZTdmduTG83WSJ9.eyJhdWQiOiIwMDAwMDAwMy0wMDAwLTAwMDAtYzAwMC0wMDAwMDAwMDAwMDAiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC9jOGQ5MTQ4Zi05YTU5LTRkYjMtODI3ZC00MmVhMGMyYjZlMmUvIiwiaWF0IjoxNzAwMDMwMDgwLCJuYmYiOjE3MDAwMzAwODAsImV4cCI6MTcwMDAzNTQ0MiwiYWNjdCI6MSwiYWNyIjoiMSIsImFpbyI6IkFVUUF1LzhWQUFBQWMwNUZIMDMyZ2g1MkxVQmxyd05EY3Z6UWtzM0o5SWg2VWtLbFArdXUxL1lzdVVzclkwNkVtRlZ3d3pPcUZ3NUxWTUY2RWFxVmZwUGkrYmQxWUxGMHlnPT0iLCJhbHRzZWNpZCI6IjU6OjEwMDMyMDAxRUExRDg4QkMiLCJhbXIiOlsicHdkIl0sImFwcF9kaXNwbGF5bmFtZSI6IlJlc3VtZSBCb29rIERldiIsImFwcGlkIjoiMjUxZWZhODItZjU4OS00MmUxLTllYmItZTIxNGE0ZjQwYTBmIiwiYXBwaWRhY3IiOiIwIiwiZW1haWwiOiJqZ29vbjJAaWxsaW5vaXMuZWR1IiwiaWRwIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvNDQ0NjdlNmYtNDYyYy00ZWEyLTgyM2YtNzgwMGRlNTQzNGUzLyIsImlkdHlwIjoidXNlciIsImlwYWRkciI6IjY2LjI1My4xNjcuMjIzIiwibmFtZSI6Ikdvb24sIEpvc2h1YSBKYW1lcyIsIm9pZCI6IjE0YmM4OTVkLTc5NTItNDhmZC05OTJjLTA4ZjBjNzU2YWNhNSIsInBsYXRmIjoiNSIsInB1aWQiOiIxMDAzMjAwMjZFRTI5MTI0IiwicmgiOiIwLkFYd0FqeFRaeUZtYXMwMkNmVUxxREN0dUxnTUFBQUFBQUFBQXdBQUFBQUFBQUFDN0FBcy4iLCJzY3AiOiJvcGVuaWQgcHJvZmlsZSBVc2VyLlJlYWQgZW1haWwiLCJzdWIiOiJVS29fN0pNU0ZfLXo2S2lRLTB0Zk9uTFpzVldwZTNzZ2dGNjZ1dm1adm80IiwidGVuYW50X3JlZ2lvbl9zY29wZSI6Ik5BIiwidGlkIjoiYzhkOTE0OGYtOWE1OS00ZGIzLTgyN2QtNDJlYTBjMmI2ZTJlIiwidW5pcXVlX25hbWUiOiJqZ29vbjJAaWxsaW5vaXMuZWR1IiwidXRpIjoiTW1uOGVremQxa3lkenRvR3doY0hBUSIsInZlciI6IjEuMCIsIndpZHMiOlsiY2YxYzM4ZTUtMzYyMS00MDA0LWE3Y2ItODc5NjI0ZGNlZDdjIiwiMTNiZDFjNzItNmY0YS00ZGNmLTk4NWYtMThkM2I4MGYyMDhhIl0sInhtc19zdCI6eyJzdWIiOiJzRjVaeVM0YTFWZmRXR3pyQ1JDZkxJNThpdXpHWjN2bFhaNlJXVVlZNXlNIn0sInhtc190Y2R0IjoxNjczOTA5NDE5fQ.SRborBdzLSFr5s_zzCHL1j7qGme_uhtg6OcfW-LsiRgKyglFIAYqqMOCVjjeDMq-qnORCsdg67h_6ctgr1_6rsIWPPkmD-3vckn9nr6b_-3NRp6iP7SU3sg-9vAuyMmCxG4SvJZ24qi6eGyTNMHF0ZGPe_53XS8RW-s6LPYARdhVzqYY0lofW-kxTUPnq6esom5SCk0xi9WH9iInywjuKUW0VI5jBUZTjxPLvqeqG_XGPOyyIOt6hSYI4u-GkNVbJmtMvnonBoXaBk8m2_CiKKcMbI4n-f7Ioo3uI-Qy1XLtaI6WKuzVVu5hXFMhfL-wU5kjwbAxdcWwygDpFTYIGg"
group_id = '172fd9ee-69f0-4384-9786-41ff1a43cf8e'

# resource = 'https://graph.microsoft.com'
# group_display_name = 'Paid Members'


# # Make a request to get the group's information
# headers = {
#     'Authorization': f'Bearer {access_token}',
#     'Content-Type': 'application/json'
# }

# # Query the group by display name
# get_group_url = f'{resource}/v1.0/groups?$filter=displayName eq \'{group_display_name}\''
# # or by group ID: get_group_url = f'{resource}/v1.0/groups/{group_id}'
# group_response = requests.get(get_group_url, headers=headers)

# if group_response.status_code == 200:
#     group_data = group_response.json()
#     if group_data['value']:
#         group_object_id = group_data['value'][0]['id']
#         print(f"The object ID of the group '{group_display_name}' is: {group_object_id}")
#     else:
#         print(f"No group found with the display name '{group_display_name}'")
# else:
#     print(f"Failed to retrieve group information. Status code: {group_response.status_code}")
#     print(json.dumps(group_response, indent=4, sort_keys=True))



# Make a request to Microsoft Graph API to get the current user's details
# graph_api_endpoint = f"https://graph.microsoft.com/v1.0/groups/{group_id}/memberOf"
# GET /me
# GET /users/{id | userPrincipalName}
graph_api_endpoint = f"https://graph.microsoft.com/v1.0/me"
headers = {
    'Authorization': f'Bearer {access_token}'
}

response = requests.get(graph_api_endpoint, headers=headers)

if response.status_code == 200:
    user_data = response.json()
    user_object_id = user_data['id']
    print(f"The object ID of the current user is: {user_object_id}")
else:
    print(f"Failed to retrieve user information. Status code: {response.status_code}")
    print(json.dumps(response.json(), indent=4, sort_keys=True))

