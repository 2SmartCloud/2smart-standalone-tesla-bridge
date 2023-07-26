# Tesla bridge

## How to retrieve Tesla API access and refresh tokens

- Sign up on <https://www.tesla.com/>

- Replace "email" and "password" fields in request body with your own received during sign up and run the following command in terminal:

``` shell
curl --location --request POST 'https://owner-api.teslamotors.com/oauth/token' --header 'Content-Type: application/json' --data-raw '{
    "password": "<your-password>",
    "email": "<your-email@mail.com>",
    "client_secret": "c7257eb71a564034f9419ee651c7d0e5f7aa6bfbd18bafb5c5c033b093bb2fa3",
    "client_id": "81527cff06843c8634fdc09e8ac0abefb46ac849f38fe1e431c2ef2106796384",
    "grant_type": "password"
}'
```

- Copy "access_token", "refresh_token" values and paste it into the tesla bridge creation form
