from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import uvicorn
from agent_run import run_agent_task, shutdown_browser

app = FastAPI()
templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/", response_class=HTMLResponse)
async def homepage(request: Request):
    return templates.TemplateResponse("index.html", {"request": request, "result": None})


@app.post("/run", response_class=HTMLResponse)
async def run_task(request: Request, user_input: str = Form(...)):
    result = await run_agent_task(user_input)
    return templates.TemplateResponse("index.html", {"request": request, "result": result, "user_input": user_input})


@app.on_event("shutdown")
async def on_shutdown():
    await shutdown_browser()


if __name__ == "__main__":
    uvicorn.run("agent_api:app", host="0.0.0.0", port=8000, reload=True)
