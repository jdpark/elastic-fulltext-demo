This project demonstrates Elasticsearch fulltext search.  This GUI has 3 tabs: Search, Insert, and Get All.

Search executes various Elastic search options.
Insert allows custom data insert.
Get All views all data.

In order for the GUI to work, Elasticsearch must have index `fulltext` with following schema.


```json
{
    "settings": {
        "number_of_shards": "1",
        "number_of_replicas": "0",
        "analysis": {
            "analyzer": {
                "stemmed_analyzer": {
                    "type": "snowball",
                    "language": "English"
                }
            }
        }
    },
    "mappings": {
        "doc": {
            "properties": {
                "text1": {
                    "type": "text",
                    "analyzer": "stemmed_analyzer"
                },
                "text1-completion": {
                  "type": "completion"
                }
            }
        }
    }
}
```
