import logging
from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from user_agents import parse
import random

# ---------------- USERS ----------------
USERS = {
    "alice": "alice123",
    "bob": "bob123",
    "charlie": "charlie123"
}

PRODUCTS = ["Laptop", "Headphones", "Keyboard", "Mouse", "Monitor"]

# ---------------- LOGGING ----------------
logging.basicConfig(
    level=logging.INFO,
    format=(
        "%(asctime)s %(levelname)s application=shop-app "
        "user=%(user)s action=%(action)s "
        "browser=%(browser)s os=%(os)s ip=%(ip)s msg=%(message)s"
    ),
    handlers=[
        logging.FileHandler("/var/log/shop-app.log"),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger("shop-app")

# ---------------- APP ----------------
app = FastAPI()
templates = Jinja2Templates(directory="templates")

def log_event(request: Request, user: str, action: str, message: str):
    ua_string = request.headers.get("user-agent", "unknown")
    ua = parse(ua_string)

    logger.info(
        message,
        extra={
            "user": user,
            "action": action,
            "browser": f"{ua.browser.family}-{ua.browser.version_string}",
            "os": f"{ua.os.family}-{ua.os.version_string}",
            "ip": request.client.host
        }
    )

@app.get("/", response_class=HTMLResponse)
def login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.post("/login")
def login(request: Request, username: str = Form(...), password: str = Form(...)):
    if USERS.get(username) == password:
        log_event(request, username, "login", "User logged in")
        return RedirectResponse("/shop?user=" + username, status_code=302)

    log_event(request, username, "login_failed", "Invalid credentials")
    return RedirectResponse("/", status_code=302)

@app.get("/shop", response_class=HTMLResponse)
def shop(request: Request, user: str):
    log_event(request, user, "view_shop", "User viewing products")
    return templates.TemplateResponse(
        "shop.html",
        {"request": request, "user": user, "products": PRODUCTS}
    )

@app.post("/add-to-cart")
def add_to_cart(request: Request, user: str = Form(...), product: str = Form(...)):
    log_event(request, user, "add_to_cart", f"Product added: {product}")
    return RedirectResponse(f"/shop?user={user}", status_code=302)

@app.post("/checkout")
def checkout(request: Request, user: str = Form(...)):
    log_event(request, user, "checkout", "Checkout completed")
    return RedirectResponse(f"/shop?user={user}", status_code=302)

@app.post("/logout")
def logout(request: Request, user: str = Form(...)):
    log_event(request, user, "logout", "User logged out")
    return RedirectResponse("/", status_code=302)

# -------- NOISE ERROR (image-like logs) --------
@app.post("/generate-error")
def generate_error(request: Request, user: str = Form(...)):
    noise = " ".join(random.choice(
        ["prb","req","svc","auth","db","cache","net","api","retry"]
    ) for _ in range(200))

    logger.error(
        f"NOISE_ERROR={noise}",
        extra={
            "user": user,
            "action": "error",
            "browser": "unknown",
            "os": "unknown",
            "ip": request.client.host
        }
    )
    return RedirectResponse(f"/shop?user={user}", status_code=302)
