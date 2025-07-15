import asyncio
from src.utils.llm_provider import get_llm_model
from src.agent.browser_use.browser_use_agent import BrowserUseAgent
from src.controller.custom_controller import CustomController
from src.browser.custom_browser import CustomBrowser
from browser_use.browser.context import BrowserContextConfig
from browser_use.browser.browser import BrowserConfig
from src.agent.session_context import SessionContext

# === CONFIG === #
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

# === Shared Setup === #
llm = get_llm_model(
    provider=LLM_CONFIG["provider"],
    model_name=LLM_CONFIG["model_name"],
    temperature=LLM_CONFIG["temperature"],
    base_url=LLM_CONFIG["base_url"],
    api_key=LLM_CONFIG["api_key"],
    num_ctx=LLM_CONFIG["num_ctx"]
)


async def ask_assistant(prompt, ctx):
    print(f"\n🤖 Agent asked: {prompt}")
    return {"user_input": input("💬 Type your response: ")}


async def interactive_agent_loop():
    print("🔄 Starting interactive agent session...")
    print("💡 Type your instruction or 'exit' to quit.\n")

    browser = None
    browser_context = None

    try:
        # Init browser
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
        controller = CustomController(ask_assistant_callback=ask_assistant)
        session_context = SessionContext()

        system_instruction = (
            "You are a smart browser agent. Follow these rules:\n"
            "1. Stay in one tab unless told otherwise.\n"
            "2. Use current page before searching externally.\n"
            "3. Don’t repeat actions.\n"
            "4. Ask if commands are unclear.\n"
            "5. Only act on meaningful instructions.\n"
        )

        while True:
            try:
                user_command = input("\n🧑 You: ").strip()
            except (EOFError, KeyboardInterrupt):
                print("\n👋 Exiting due to interruption.")
                break

            if user_command.lower() in {"exit", "quit"}:
                print("👋 Exiting interactive session.")
                break

            if len(user_command) < 3:
                print("⚠️ Too short or vague. Try again.")
                continue

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
                source="text_cli",
            )

            try:
                result = await agent.run()

                if result:
                    print("\n✅ Task completed.")
                    print("📄 Final Result:\n", result.final_result())

                    if hasattr(result, "final_state"):
                        state = result.final_state
                        session_context.update(
                            command=user_command,
                            url=getattr(state, "url", "unknown"),
                            title=getattr(state, "title", "unknown"),
                        )

            except Exception as e:
                print(f"❌ Agent failed during task: {e}")

    finally:
        try:
            if browser_context:
                await browser_context.close()
            if browser:
                await browser.close()
        except Exception as e:
            print(f"⚠️ Cleanup error: {e}")


# === ENTRY POINT === #
if __name__ == "__main__":
    try:
        asyncio.run(interactive_agent_loop())
    except KeyboardInterrupt:
        print("\n🛑 Forced exit by user.")
