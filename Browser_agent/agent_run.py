# === agent_run.py (MODIFIED TO SUPPORT PERSISTENT BROWSER CONTEXT) ===
import asyncio
from src.utils.llm_provider import get_llm_model
from src.agent.browser_use.browser_use_agent import BrowserUseAgent
from src.controller.custom_controller import CustomController
from src.browser.custom_browser import CustomBrowser
from browser_use.browser.context import BrowserContextConfig
from browser_use.browser.browser import BrowserConfig
from src.agent.session_context import SessionContext
from browser_use.agent.views import ActionResult

LLM_CONFIG = {
    "provider": "google",
    "model_name": "gemini-2.0-flash",
    "temperature": 0.7,
    "base_url": None,
    "api_key": None,
    "num_ctx": None,
}

BROWSER_CONFIG = {
    "headless": False,
    "disable_security": False,
    "window_width": 1280,
    "window_height": 900,
    "browser_binary_path": None,
    "user_data_dir": None,
}

llm = get_llm_model(
    provider=LLM_CONFIG["provider"],
    model_name=LLM_CONFIG["model_name"],
    temperature=LLM_CONFIG["temperature"],
    base_url=LLM_CONFIG["base_url"],
    api_key=LLM_CONFIG["api_key"],
    num_ctx=LLM_CONFIG["num_ctx"]
)

system_instruction = (
    "You are a smart browser agent. Follow these rules:\n"
    "1. Stay in one tab unless told otherwise.\n"
    "2. Use current page before searching externally.\n"
    "3. Don’t repeat actions.\n"
    "4. Ask if commands are unclear.\n"
    "5. Only act on meaningful instructions.\n"
    "6. If user says something like 'add product banana 10kg 50 rupees', go to http://localhost:8080/, click 'Start Speaking', log in with mock credentials,\n"
    "   generate a message in the format 'I sell {product}, {quantity} available at ₹{price} per kg', click Send.\n"
    "7. If user adds 'also post to Facebook Marketplace', log into Facebook with Email: 'vsnu4work@gmail.com' and Password: 'Pan-#zrfg68dmCc',\n"
    "   then go to Marketplace → Create new listing → Item for Sale.\n"
    "8. Fill Title (e.g., 'Banana'), Price, Category (guess best fit), Condition as 'New', Location as 'Bengaluru', skip image.\n"
    "9. Ask the user in text: 'Do you want to push this product to Facebook Marketplace?',\n"
    "   if user responds 'yes', click Next and Publish,\n"
    "   else say 'Product catalog created successfully.'"
)

# Persistent objects
browser = None
browser_context = None
controller = None
session_context = SessionContext()

async def initialize_browser():
    global browser, browser_context, controller
    if not browser:
        browser = CustomBrowser(
            config=BrowserConfig(
                headless=BROWSER_CONFIG["headless"],
                disable_security=BROWSER_CONFIG["disable_security"],
                browser_binary_path=BROWSER_CONFIG["browser_binary_path"],
                extra_browser_args=[],
                new_context_config=BrowserContextConfig(
                    window_width=BROWSER_CONFIG["window_width"],
                    window_height=BROWSER_CONFIG["window_height"],
                    save_downloads_path="./tmp/downloads",
                    force_new_context=True,
                ),
            )
        )
        browser_context = await browser.new_context()
        controller = CustomController(ask_assistant_callback=lambda prompt, ctx: {"user_input": ""})

async def run_agent_task(user_command):
    try:
        await initialize_browser()

        full_prompt = (
            f"{system_instruction}\n\n"
            f"{session_context.to_prompt()}\n"
            f"User: {user_command}\n"
        )

        agent = BrowserUseAgent(
            task=full_prompt,
            llm=llm,
            browser=browser,
            browser_context=browser_context,
            controller=controller,
            use_vision=False,
            source="api",
        )

        result = await agent.run()

        final_output = result.final_result() if result else "No result returned"

        if hasattr(result, "final_state"):
            state = result.final_state
            session_context.update(
                command=user_command,
                url=getattr(state, "url", "unknown"),
                title=getattr(state, "title", "unknown"),
            )

        if hasattr(controller, "log_action_result") and isinstance(result, ActionResult):
            await controller.log_action_result(result, context="agent_run")

        return final_output

    except Exception as e:
        return f"❌ Agent failed: {e}"

async def shutdown_browser():
    global browser, browser_context
    try:
        if browser_context:
            await browser_context.close()
            browser_context = None
        if browser:
            await browser.close()
            browser = None
    except Exception as e:
        print(f"⚠️ Cleanup error: {e}")
