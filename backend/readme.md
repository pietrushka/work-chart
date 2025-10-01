To fix the Pylance import error in VS Code, you need to tell VS Code to use this virtual environment. In VS Code:

1. Open the Command Palette (Ctrl+Shift+P)
2. Type "Python: Select Interpreter"
3. Choose the interpreter in your venv: /home/piotr/repos/work-chart/backend/venv/bin/python

When adding new dependency
docker compose -f docker-compose.local.yml down && docker compose -f docker-compose.local.yml build --no-cache && docker-compose
up

docker-compose -f docker-compose.local.yml down && docker-compose -f │
│ docker-compose.local.yml up --build

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
