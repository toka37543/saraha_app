# Saraha App 
This project will allow users to sign up have a profile and allow other users to send them messages with or without their names appeared 

## Flow 
```
1.
User ---> Register ---> Get Public profile Link
User ---> Login in ---> View messages 
User / Vistor ---> Login ---> Write message to another user 
```

## FRs
1. User profile hs first, last name, photo, age, email, username
2. User can update any field of his profile 
3. Message can be text only or text with image 



## Messages module 
Create the messages module and the create request only, name the endpoint "send",
the request body must have 3 fields:  
- message
- sender_id: the id of the user who is sending the message 
- receiver_username: the username of the targeted user

Validation rules:
1. Message must be more than 5 chars length, and less than 500 char length.
2. receiver_username must exists in the DB 
3. receiver_username must not be the sender username. 


# Reset and forget password
1. POST /forget-password
```json
{
  "email": "ex@y.com"
}
```
- Check if the email is valid 
- Get the user from the DB. -> Check if the email is exists 
- In a new collection ```password_resets``` (Schema and Model), you will insert the following
```json
{
  "token": "string",
  "user_id": "string",
  "requested_at": "date",
  "valid_until": "date",
  "used": "bool"
}
```
Token: random 64 string 
Requested At: current data 
Valid Until: Current Date + 10 Mins
used: default false
- return to the user in the response 
```json 
{
  "message": "success",
  "token": token,
  "valid_until": valid_until
} 
```

```json
{
  "success": true,
  "message": "",
  "data": {},
  "error": {}
}
```

