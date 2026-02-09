import logging
import random
import traceback
from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

# ---------------- LOGGING ----------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s application=user-app user=%(user)s action=%(action)s msg=%(message)s",
    handlers=[
        logging.FileHandler("/var/log/app.log"),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger("app")

# ---------------- APP ----------------
app = FastAPI()
templates = Jinja2Templates(directory="templates")

@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/submit")
def submit_form(
    username: str = Form(...),
    email: str = Form(...),
    action: str = Form(...)
):
    logger.info(
        "User action processed",
        extra={"user": username, "action": action}
    )
    return {"status": "success"}

@app.post("/generate-error")
def generate_error(username: str = Form(...)):
    try:
        # Force a random error
        if random.choice([True, False]):
            1 / 0
        else:
            int("not-a-number")

    except Exception as e:
        logger.error(
            f"Application error occurred: {str(e)}",
            extra={"user": username, "action": "error"},
            exc_info=True
        )
        return {"status": "error generated"}
