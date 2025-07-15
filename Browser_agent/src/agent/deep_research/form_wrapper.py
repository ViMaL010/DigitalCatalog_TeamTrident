import asyncio
from formmanage import ask_user

async def ask_user_async(prompt: str) -> str:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, ask_user, prompt)
