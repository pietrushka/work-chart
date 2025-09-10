```
pip install -r requirements.txt
source venv/bin/activate
docker-compose up -d postgres && uvicorn main:app --host 0.0.0.0 --port 8002 --reload
```

DOCKER:

- `docker compose up --watch`

DB:

- to recreate the db run:

```
docker compose down -v
docker compose up
```

- start one sevice

```
docker-compose up -d client
```
