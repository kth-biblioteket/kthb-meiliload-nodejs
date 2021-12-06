#
KTHB Meiliload

Laddar data från diverse källor till meilisearch

##
```bash

### KTH UG

#### Skapa index
curl \
  -X POST 'http://localhost:7700/indexes' \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "uid": "ugusers",
    "primaryKey": "sAMAccountName"
  }' \
 --header "X-Meili-API-Key: xxxxxxxxx"

#### Definiera facetter/filter
curl \
  -X POST 'http://localhost:7700/indexes/ugusers/settings' \
  -H 'Content-Type: application/json' \
  --header "X-Meili-API-Key: xxxxxxxx" \
  --data-binary '{
      "filterableAttributes": [
          "ugPrimaryAffiliation",
          "title",
          "sn",
          "kthPAGroupMembership",
          "ugClass"
      ]
  }'

#### Ladda data
curl \
  -X POST 'http://localhost:7700/indexes/ugusers/documents' \
  -H 'Content-Type: application/json' \
  --data-binary @ugusers.json \
 --header "X-Meili-API-Key: xxxxxxx"

#### Uppdatera data
curl \
  -X PUT 'http://localhost:7700/indexes/ugusers/documents' \
  -H 'Content-Type: application/json' \
  --header "X-Meili-API-Key: xxxxxxx" \
  --data-binary @ugusers.json \
#### Ta bort index
 curl \
  -X DELETE 'http://localhost:7700/indexes/ugusers' \
  -H 'Content-Type: application/json' \
 --header "X-Meili-API-Key: xxxxxxx"

#### Ta bort data
 curl \
  -X DELETE 'http://localhost:7700/indexes/ugusers/documents' \
  -H 'Content-Type: application/json' \
 --header "X-Meili-API-Key: xxxxxxx"

#### Visa updates
 curl \
  -X GET 'http://localhost:7701/indexes/ugusers/updates' \
 --header "X-Meili-API-Key: xxxxxxxxx"

#### Visa data
 curl \
  -X GET 'http://localhost:7700/indexes/ugusers/documents' \
 --header "X-Meili-API-Key: xxxxxxxxx"



### KTH Anställda

curl \
  -X POST 'http://localhost:7700/indexes' \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "uid": "kthanst",
    "primaryKey": "id"
  }' \
 --header "X-Meili-API-Key: xxxxxx"

curl \
  -X POST 'http://localhost:7700/indexes/kthanst/documents' \
  -H 'Content-Type: application/json' \
  --data-binary @kthanst.json \
 --header "X-Meili-API-Key: xxxxxxxx"

curl \
  -X POST 'http://localhost:7700/indexes/kthanst/settings' \
  -H 'Content-Type: application/json' \
  --header "X-Meili-API-Key: xxxxxxxx" \
  --data-binary '{
      "filterableAttributes": [
          "Enamn",
          "Orgnamn",
          "Bef_ben"
      ]
  }'

  curl \
  -X GET 'http://localhost:7700/indexes/kthanst/updates' \
 --header "X-Meili-API-Key: xxxxxxxxx"


##### Hr
  #### Skapa index
curl \
  -X POST 'http://localhost:7700/indexes' \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "uid": "hr",
    "primaryKey": "kthid"
  }' \
 --header "X-Meili-API-Key: xxxxxxx"

#### Definiera facetter/filter
curl \
  -X POST 'http://localhost:7700/indexes/hr/settings' \
  -H 'Content-Type: application/json' \
  --header "X-Meili-API-Key: xxxxx" \
  --data-binary '{
      "filterableAttributes": [
          "unit_name",
          "lastname",
          "emp_desc"
      ]
  }'

#### Ladda data
curl \
  -X POST 'http://localhost:7700/indexes/hr/documents' \
  -H 'Content-Type: text/csv' \
  --data-binary @hr.csv \
 --header "X-Meili-API-Key: xxxxxxx"


##### Databaslistan
  #### Skapa index
curl \
  -X POST 'http://localhost:7700/indexes' \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "uid": "dbl",
    "primaryKey": "id"
  }' \
 --header "X-Meili-API-Key: xxxxxxx"

#### Definiera facetter/filter
curl \
  -X POST 'http://localhost:7701/indexes/dbl/settings' \
  -H 'Content-Type: application/json' \
  --header "X-Meili-API-Key: xxxxxxxx" \
  --data-binary '{
      "filterableAttributes": [
          "publisher",
          "types",
          "categories",
          "startletter",
          "access"
      ]
  }'

#### Ladda data
curl \
  -X POST 'http://localhost:7700/indexes/dbl/documents' \
  -H 'Content-Type: application/json' \
  --data-binary @dbl.json \
 --header "X-Meili-API-Key: xxxxxxxx"

#### Visa data
 curl \
  -X GET 'http://localhost:7700/indexes/dbl/documents' \
 --header "X-Meili-API-Key: xxxxxxxxxx"

curl \
  -X GET 'http://localhost:7701/indexes/dbl/updates'

 ### General

#### Hämta nycklar
curl \
  -X GET 'http://localhost:7700/keys' \
  -H "X-Meili-API-Key: xxxxxxxxxxxxxxxx" 

#### Hämta index
  curl \
  -X GET 'http://localhost:7700/indexes' \
 --header "X-Meili-API-Key: xxxxxxxx"


#### Docker

Dockerfile build:
kthb@ub-ref:~/docker/meilidbl$ sudo docker build -t meilidbl_7 .

kthb@ub-ref:~/docker/meilidbl$ tail startup.sh
#!/bin/bash

kthb@ub-ref:~/docker/meilidbl$ tail Dockerfile
# syntax=docker/dockerfile:1
FROM meilidbl:6.0
COPY startup.sh /startup.sh
RUN ["chmod", "+x", "/startup.sh"]
ENTRYPOINT ["/startup.sh"]


meilisearch --db-path /meilifiles --http-addr '0.0.0.0:7700'


Run med volume:
sudo docker run  -dp 127.0.0.1:7701:7700 -v meilidbl:/meilifiles --restart unless-stopped meilidbl_7

curl \
  -X POST 'http://127.0.0.1:7701/indexes/movies/documents' \
  -H 'Content-Type: application/json' \
  --data-binary @movies.json
```