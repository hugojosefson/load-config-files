# All possible combinations

Using all possible combinations to call [example.ts](../example.ts):

```sh
for format in json shell spring_shell; do
  for environment in dev prod; do
    for app in myapp{1,2}; do
      echo "

===============================================================================
${app} in ${environment}, formatted as ${format}:
-------------------------------------------------------------------------------"
      deno run \
        --allow-read \
        --allow-net=deno.land \
        https://deno.land/x/load_config_files/example.ts \
        "${format}" example-config "${environment}" "${app}"
    done
  done
done
```

Output is:

```
===============================================================================
myapp1 in dev, formatted as json:
-------------------------------------------------------------------------------
{
  "COLOR": "yellow",
  "CUSTOMER_URLS": {
    "CustomerA": "https://dev.example.com/customers/CustomerA.json",
    "CustomerB": "https://dev.example.com/customers/CustomerB.json",
    "CustomerC": "https://dev.example.com/customers/CustomerC.json",
    "CustomerD": "https://dev.example.com/customers/CustomerD.json",
    "CustomerE": "https://dev.example.com/customers/CustomerE.json"
  },
  "APP_ID": "myapp1"
}


===============================================================================
myapp2 in dev, formatted as json:
-------------------------------------------------------------------------------
{
  "APP_ID": "myapp2",
  "SOMETHING_IN_COMMON": "this value is for myapp2 in all environments.",
  "COLOR": "purple",
  "CUSTOMER_URLS": {
    "CustomerA": "https://dev.example.com/customers/CustomerA.json",
    "CustomerB": "https://dev.example.com/customers/CustomerB.json",
    "CustomerC": "https://dev.example.com/customers/CustomerC.json",
    "CustomerD": "https://dev.example.com/customers/CustomerD.json",
    "CustomerE": "https://dev.example.com/customers/CustomerE.json"
  }
}


===============================================================================
myapp1 in prod, formatted as json:
-------------------------------------------------------------------------------
{
  "COLOR": "black",
  "CUSTOMER_URLS": {
    "Alice's shop": "https://alice.example.com/myapp1",
    "Bob's shop": "https://bob.example.com/myapp1"
  }
}


===============================================================================
myapp2 in prod, formatted as json:
-------------------------------------------------------------------------------
{
  "APP_ID": "default appId for myapp2",
  "SOMETHING_IN_COMMON": "this value is for myapp2 in all environments.",
  "COLOR": "black",
  "CUSTOMER_URLS": {
    "Alice's shop": "https://alice.example.com/myapp2",
    "Bob's shop": "https://bob.example.com/myapp2"
  }
}


===============================================================================
myapp1 in dev, formatted as shell:
-------------------------------------------------------------------------------
COLOR='yellow'
CUSTOMER_URLS='{"CustomerA":"https://dev.example.com/customers/CustomerA.json","CustomerB":"https://dev.example.com/customers/CustomerB.json","CustomerC":"https://dev.example.com/customers/CustomerC.json","CustomerD":"https://dev.example.com/customers/CustomerD.json","CustomerE":"https://dev.example.com/customers/CustomerE.json"}'
APP_ID='myapp1'


===============================================================================
myapp2 in dev, formatted as shell:
-------------------------------------------------------------------------------
APP_ID='myapp2'
SOMETHING_IN_COMMON='this value is for myapp2 in all environments.'
COLOR='purple'
CUSTOMER_URLS='{"CustomerA":"https://dev.example.com/customers/CustomerA.json","CustomerB":"https://dev.example.com/customers/CustomerB.json","CustomerC":"https://dev.example.com/customers/CustomerC.json","CustomerD":"https://dev.example.com/customers/CustomerD.json","CustomerE":"https://dev.example.com/customers/CustomerE.json"}'


===============================================================================
myapp1 in prod, formatted as shell:
-------------------------------------------------------------------------------
COLOR='black'
CUSTOMER_URLS='{"Alice'"'"'s shop":"https://alice.example.com/myapp1","Bob'"'"'s shop":"https://bob.example.com/myapp1"}'


===============================================================================
myapp2 in prod, formatted as shell:
-------------------------------------------------------------------------------
APP_ID='default appId for myapp2'
SOMETHING_IN_COMMON='this value is for myapp2 in all environments.'
COLOR='black'
CUSTOMER_URLS='{"Alice'"'"'s shop":"https://alice.example.com/myapp2","Bob'"'"'s shop":"https://bob.example.com/myapp2"}'


===============================================================================
myapp1 in dev, formatted as spring_shell:
-------------------------------------------------------------------------------
SPRING_APPLICATION_JSON='{"COLOR":"yellow","CUSTOMER_URLS":{"CustomerA":"https://dev.example.com/customers/CustomerA.json","CustomerB":"https://dev.example.com/customers/CustomerB.json","CustomerC":"https://dev.example.com/customers/CustomerC.json","CustomerD":"https://dev.example.com/customers/CustomerD.json","CustomerE":"https://dev.example.com/customers/CustomerE.json"},"APP_ID":"myapp1"}'


===============================================================================
myapp2 in dev, formatted as spring_shell:
-------------------------------------------------------------------------------
SPRING_APPLICATION_JSON='{"APP_ID":"myapp2","SOMETHING_IN_COMMON":"this value is for myapp2 in all environments.","COLOR":"purple","CUSTOMER_URLS":{"CustomerA":"https://dev.example.com/customers/CustomerA.json","CustomerB":"https://dev.example.com/customers/CustomerB.json","CustomerC":"https://dev.example.com/customers/CustomerC.json","CustomerD":"https://dev.example.com/customers/CustomerD.json","CustomerE":"https://dev.example.com/customers/CustomerE.json"}}'


===============================================================================
myapp1 in prod, formatted as spring_shell:
-------------------------------------------------------------------------------
SPRING_APPLICATION_JSON='{"COLOR":"black","CUSTOMER_URLS":{"Alice'"'"'s shop":"https://alice.example.com/myapp1","Bob'"'"'s shop":"https://bob.example.com/myapp1"}}'


===============================================================================
myapp2 in prod, formatted as spring_shell:
-------------------------------------------------------------------------------
SPRING_APPLICATION_JSON='{"APP_ID":"default appId for myapp2","SOMETHING_IN_COMMON":"this value is for myapp2 in all environments.","COLOR":"black","CUSTOMER_URLS":{"Alice'"'"'s shop":"https://alice.example.com/myapp2","Bob'"'"'s shop":"https://bob.example.com/myapp2"}}'
```
